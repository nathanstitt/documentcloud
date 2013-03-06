class ExpandDocumentLanguageCodes < ActiveRecord::Migration

  def self.up
    execute 'alter table documents alter column language type varchar(7)'
    DC::Language::ALPHA2.each do | new_code, old_code |
      execute "update documents set language = '#{new_code}' where language = '#{old_code}'"
    end
  end

  def self.down
    DC::Language::ALPHA2.each do | new_code, old_code |
      execute "update documents set language = '#{old_code}' where language = '#{new_code}'"
    end
    execute 'alter table documents alter column language type varchar(3)'
  end

end
