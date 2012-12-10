module DC
  module Import

    class PDFWrangler

      # Number of pages in a parallelized batch.
      DEFAULT_BATCH_SIZE = 5

      # Make sure we're dealing with a PDF. If not, it needs to be
      # converted first. Yields the path to the converted document to a block.
      def ensure_pdf(file, filename=nil)
        Dir.mktmpdir do |temp_dir|
          path = file.path
          original_filename = filename || file.original_filename
          mime_type = `file -b --mime-type #{Shellwords.shellescape(original_filename)}`.chomp
          ext  = File.extname(original_filename).downcase
          name = File.basename(original_filename, File.extname(original_filename)).gsub(/[^a-zA-Z0-9_\-.]/, '-').gsub(/-+/, '-') + ext

          # If the file is a PDF with an incorrect extension, rename it
          if 'application/pdf' == mime_type && '.pdf' != File.extname(path).downcase
            new_name = File.join( temp_dir, File.basename(name) + '.pdf' )
            Rails.logger.debug "File is a PDF with extension #{File.extname(path)}, renaming to #{new_name}"
            FileUtils.mv(path, new_name )
            path = new_name
          end
          return yield(path) if 'application/pdf' == mime_type
          begin
            doc  = File.join(temp_dir, name)
            FileUtils.cp(path, doc)
            Docsplit.extract_pdf(doc, :output => temp_dir)
            yield(File.join(temp_dir, File.basename(name, ext) + '.pdf'))
          rescue Exception => e
            LifecycleMailer.deliver_exception_notification(e)
            Rails.logger.error("PDF Conversion Failed: " + e.message + "\n" + e.backtrace.join("\n"))
            yield path
          end
        end
      end

      # Archive a list of PDF pages into TAR archives, grouped by batch_size.
      def archive(pages, batch_size=nil)
        batch_size ||= DEFAULT_BATCH_SIZE
        batches = (pages.length / batch_size.to_f).ceil
        batches.times do |batch_num|
          tar_path = "#{sprintf('%05d', batch_num)}.tar"
          batch_pages = pages[batch_num*batch_size...(batch_num + 1)*batch_size]
          `tar -czf #{tar_path} #{batch_pages.join(' ')}`
        end
        Dir["*.tar"]
      end

    end

  end
end
