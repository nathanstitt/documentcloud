class ExpandDocumentLanguageCodes < ActiveRecord::Migration

  def self.up

    DC::Language::ALPHA2.each do | new_code, old_code |
      execute "update documents set language = '#{new_code}' where language = '#{old_code}'"
    end
  end

  def self.down
    DC::Language::ALPHA2.each do | new_code, old_code |
      execute "update documents set language = '#{old_code}' where language = '#{new_code}'"
    end

  end

end
