
require File.dirname(__FILE__) + '/support/setup'
require File.dirname(__FILE__) + '/support/document_mod_base'
require 'fileutils'

class DocumentRotatePages < DocumentModBase

  # # Split a the rotate job into parallel parts, one job per page
  # def split
  #   Rails.logger.debug "SPLIT:"
  #   Rails.logger.debug options
  #   return options['rotations'] << { :task=>'pdf' }
  # end

  def process
    Rails.logger.debug "PROCESS:"
    Rails.logger.debug options
    Rails.logger.debug input

    return unless pdf = process_pdf


    process_images( pdf )

    document.reindex_all! access
    document.update_attributes :access => access
    document.id
  end

  def process_images( pdf )

    pg_numbers = options['rotations'].map{|rt| rt['page_number'] }

    Docsplit.extract_images( pdf, 
                             :format => :gif, 
                             :pages=> pg_numbers,
                             :size => Page::IMAGE_SIZES.values, 
                             :rolling => true, 
                             :output => 'images' )

    Rails.logger.warn Dir['images/700x/*.gif']
    Rails.logger.warn Dir['images/1000x/*.gif']
    pg_numbers.each do | number |
      image  = "#{document.slug}_#{number}.gif"
      DC::Import::Utils.save_page_images(asset_store, document, number, image, access)
    end
  end

  def rotation_to_pdftk( rotation )
    case rotation.to_i
      when 90  then 'E'
      when 180 then 'S'
      when 270 then 'W'
    end
  end

  def process_pdf
    nextpg=1
    cmd = []
    dest_pdf = document.slug + '.pdf'
    src_pdf = "src-#{dest_pdf}"

    File.open(src_pdf, 'w+') {|f| f.write(asset_store.read_pdf(document)) }

    options['rotations'].each do | opts |
      pg = opts['page_number'].to_i
      rotation = rotation_to_pdftk( opts['rotation'] )
      if nextpg < pg
        cmd << ( ( nextpg == pg-1 ) ? "#{nextpg}" : "#{nextpg}-#{pg-1}" )
      end
      cmd << "#{pg}#{rotation}"
      nextpg = pg+1
    end
    if nextpg < document.page_count
      cmd << "#{nextpg}-end"
    end
    cmd = "pdftk #{src_pdf} cat #{cmd.join(' ')} output #{dest_pdf}"
    Rails.logger.warn cmd
    output = `#{cmd} 2>&1`
    Rails.logger.warn "#{cmd} returned: #{output}" unless output.empty?
    if 0 == $?.exitstatus && File.exists?( dest_pdf )
      asset_store.save_pdf( document, dest_pdf, access)
      File.open( dest_pdf,'r') do | fh |
        document.update_file_metadata( fh.read )
      end
      return dest_pdf
    else
      Rails.logger.warn "Not saving pdf;  exitstatus: #{$?.exitstatus}, #{dest_pdf} exists?: #{File.exists?( dest_pdf )}"
      return nil
    end

  end


end
