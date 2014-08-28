require 'test_helper'

class SolrTaskTest < ActiveSupport::TestCase

  setup do
    Sunspot.session.stubs(:index).raises(Net::ReadTimeout, 'To Busy!')
  end

  # If no exception is thrown, nothing should be recorded
  def test_does_not_interfere_when_solr_is_success
    assert_no_difference -> { SolrTask.count } do
      Sunspot.session.unstub(:index)
      assert doc.save
    end
  end

  # An exception when creating or saving the document
  # should create a SolrTask
  def test_exceptions_are_logged
    assert_difference -> { SolrTask.count },1 do
      assert doc.save
    end
    assert_difference -> { SolrTask.count },1 do
      newdoc = Document.first.dup
      assert newdoc.save
    end
  end

  # Test that the SolrTask increments attempt counts
  # and will only attempt the task 3 times
  def test_retry_also_handles_failures
    assert doc.save # trigger SolrTask
    SolrTask.retry_failures
    task = SolrTask.pending.last
    assert_equal 1,     task.attempts
    assert_equal true,  task.pending
    2.times do
      SolrTask.retry_failures
    end
    task.reload
    assert_equal 3,     task.attempts
    assert_equal false, task.pending
    refute SolrTask.pending.any?
  end

  # Test that SolrTask works with both
  # Documents and Pages
  def test_can_record_multiple_types
    assert_difference -> { SolrTask.count }, 2 do
      Document.first.save
      Page.first.save
    end
    assert_equal 2, SolrTask.pending.count
    Sunspot.session.unstub(:index)
    SolrTask.retry_failures
    assert SolrTask.pending.none?
  end

end
