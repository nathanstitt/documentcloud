require File.dirname(__FILE__) + '/support/setup'

# A simple job for testing CloudCrowd's performace
# It's designed to perform minimal work, and exit
# quickly
class DbFuzz < CloudCrowd::Action

  def process

    doc_id = rand(Document.maximum(:id) )
    if ( document = Document.where({ id: doc_id  }).first )
      document.pages.pluck(:page_number)
    end
    Rails.logger.info "Document #{doc_id} found: #{!document.nil?}"
    sleep 2
    true
  end

end
