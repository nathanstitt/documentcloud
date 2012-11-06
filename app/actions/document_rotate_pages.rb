
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

    # sort by page number so pdftk puts the pages together in the correct order
    @rotations = options['rotations'].sort!{|a,b| a['page_number'].to_i <=> b['page_number'].to_i }

    Rails.logger.debug( "Rotating Document ID: #{document.id}  Rotations are:" )
    Rails.logger.debug( @rotations )

    return unless pdf = process_pdf


    process_images( pdf )

    document.reindex_all! access
    document.update_attributes :access => access
    document.id
  end


  def process_pdf
    nextpg=1
    cmd = []
    dest_pdf = document.slug + '.pdf'
    src_pdf = "src-#{dest_pdf}"

    File.open(src_pdf, 'w+') {|f| f.write(asset_store.read_pdf(document)) }

    @rotations.each do | opts |
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
    Rails.logger.debug cmd
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

  def process_images( pdf )
    Docsplit.extract_images( pdf, 
                             :format => :gif, 
                             :pages=> @rotations.map{|r| r['page_number'].to_i },
                             :size => Page::IMAGE_SIZES.values, 
                             :rolling => true, 
                             :output => 'images' )

    @rotations.each do | rotation |
      pg_num = rotation['page_number']
      image  = "#{document.slug}_#{pg_num}.gif"
      DC::Import::Utils.save_page_images(asset_store, document, pg_num, image, access)
    end
  end


  def rotation_to_pdftk( degrees )
    case degrees.to_i
    when 90  then 'R'
    when 180 then 'D'
    when 270 then 'L'
    else 0
    end
  end


end
