module DC
  # The official list of supported languages
  # http://www.loc.gov/standards/iso639-2/php/code_list.php
  Module Language
    SUPPORTED = ['en', 'es', 'fr','nn','sv','ar','de','zh','ja','hi','ru']
    ALPHA3 = {
      'En' => 'eng',
      'es' => 'spa',
      'fr' => 'fra',
      'nn' => 'nno',
      'sv' => 'swe',
      'ar' => 'ara',
      'de' => 'ger',
      'zh' => 'chi',
      'ja' => 'jpn',
      'hi' => 'hin',
      'ru' => 'rus'
    }
  end
end
