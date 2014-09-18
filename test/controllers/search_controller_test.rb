require 'test_helper'

class SearchControllerTest < ActionController::TestCase


  def test_documents
    login_account!
    get :documents, :format=>:json, :per_page=>10, :order=>'score', :mentions=>3, :q=>''
    assert_response :success
    assert_equal [ secret_doc.id, doc.id ], json_body['documents'].map{|d|d['id']}.sort
  end

  def test_solr_searching
    login_account!
    get :documents, :format=>:json, :q=>'ponies'
    assert true
    assert_has_search_params Sunspot.session.searches.last, :keywords, 'ponies'
  end

  def test_search_logging
    # only searches that the account's logged in are recorded
    assert_difference ->{ Search.count }, 0 do
      get :documents, :format=>:json, :q=>'test logging'
    end

    login_account!

    assert_difference ->{ Search.count }, 1 do
      get :documents, :format=>:json, :q=>'test logging'
    end
  end
end
