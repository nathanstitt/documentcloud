require 'test_helper'

class SearchTest < ActiveSupport::TestCase
  test "logging creates an entry" do
    assert_difference ->{ Search.count }, 1 do
      Search.log('test query', louis, louis.organization, documents(:tv_manual))
    end
  end
end
