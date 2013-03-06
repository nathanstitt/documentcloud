module DC
  # The official list of supported languages
  # http://www.loc.gov/standards/iso639-2/php/code_list.php
  module Language
    SUPPORTED = ['eng', 'spa', 'fra','nor','swe','ara','deu','chi_sim','chi_tra','jpn','hin','rus']
    ALPHA2 = {
      'eng'     => 'en',
      'spa'     => 'es',
      'fra'     => 'fr',
      'nor'     => 'no',
      'swe'     => 'sv',
      'ara'     => 'ar',
      'deu'     => 'de',
      'chi_sim' => 'zh',
      'chi_tra' => 'zh',
      'jpn'     => 'ja',
      'hin'     => 'hi',
      'rus'     => 'ru'
    }
  end
end
