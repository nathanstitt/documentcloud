module DC
  module Search

    # DC::Search::ModelSupport extends Solr search
    # to include failure handling and background retry
    module ModelSupport

      def self.included(base)
        base.module_eval do
          extend(SchemaDefinition)
        end
      end

      module SchemaDefinition

        # Calls Sunspot::Rails::Searchable#searchable method
        # with auto_index and auto_remove set to false,
        # and then sets up our own handlers for those cases
        def searchable_with_deferred_indexing(options = {}, &block)
          include SafeIndexing
          options.merge!(:auto_index=>false,:auto_remove=>false)
          searchable(options,&block)
          # mark_for_auto_indexing_or_removal is defined by
          # Sunspot::Rails.  It checks for if/unless and sets
          # up the perform_index_tasks method
          before_save   :mark_for_auto_indexing_or_removal
          after_save    :ensure_indexed
          after_destroy :ensure_index_removed
        end

      end

      # Methods are included by the searchable_with_deferred_indexing
      # method.  Consists of callback handlers for after_save and after_destroy
      module SafeIndexing

        # Wraps the indexing into a task so it can be re-tried if it fails
        def ensure_indexed
          SolrTask.perform(self){ perform_index_tasks }
        end

        def ensure_index_removed
          SolrTask.perform(self,:removal=>true){ solr_remove_from_index }
        end
      end

    end
  end
end
