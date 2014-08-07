module DC
  module Search

    module ModelSupport
      def self.included(base)
        base.module_eval do
          extend(ClassMethods)
        end
      end

      module ClassMethods
        def searchable_with_deferred_indexing(options = {}, &block)
          include InstanceMethods
          options[:auto_index]=false
          searchable(options,&block)
          before_save :mark_for_auto_indexing_or_removal
          after_save  :ensure_indexed
        end

      end

      module InstanceMethods
        def ensure_indexed
          perform_index_tasks
        rescue Errno::ECONNREFUSED, Net::ReadTimeout
          SolrTask.index_later(self, :removal=>@marked_for_auto_removal)
        end
      end

    end
  end
end
