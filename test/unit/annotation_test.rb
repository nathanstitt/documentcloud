require 'test_helper'

class AnnotationTest < ActiveSupport::TestCase



  context "A Markdown Annotation" do

#    note { Annotation.first }
    subject { Annotation.find_by_title( 'A markdown note' ) }

    should "have correct title" do
      assert subject.title == 'A markdown note'
    end

    should 'process markdown' do
      subject.clean_content

txt=<<-EOS
Markdown: Syntax
================
A List

- Red
- Green
- Blue

[Overview](#overview)
**Note:** This note is formatted using Markdown
# Header 1 #
## Header 2 ##
### Header 3 ###             (Hashes on right are optional)
#### Header 4 ####
##### Header 5 #####
EOS
      p txt
      p RDiscount.new( txt ).to_html
      exit 0

      html = subject.html_content
      p html
      assert_equal html, "<p>Markdown: Syntax ================\n  * Main\n  * Basics\n  * Syntax\n  * License\n  * Dingus\n<a href=\"#overview\">Overview</a>\n<strong>Note:</strong> This note is formatted using Markdown</p>\n\n<h1>Header 1</h1>\n\n<h2>Header 2</h2>\n\n<h3>Header 3 ###             (Hashes on right are optional)</h3>\n\n<h4>Header 4</h4>\n\n<h5>Header 5</h5>\n"

      # make sure we are caching
      assert_same subject.html_content, html
      
      subject.content = 'Markdown: Syntax ================'

      # and that the cache is reset along with the content
      assert_not_same subject.html_content, html
    end

    
  end

end
