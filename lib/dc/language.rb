module DC
  # The official list of supported languages
  #
  # These codes are passed to docsplit to set the language to use
  # for OCR and from there to tesseract.
  #
  # Note that tesseract (incorrectly) calls the Chinese training data files
  #   chi_tra and chi_sim vs the correct codes chi and zho.
  #
  # We rename the tesseract training data files to the correct 3 letter codes
  # when we installed them to maintain the correct ios 639-3 letter convention

  module Language
    SUPPORTED = ['eng', 'spa', 'fra','nor','swe','ara','deu','chi','zho','jpn','hin','rus']
    ALPHA2 = {
      'eng' => 'en',
      'spa' => 'es',
      'fra' => 'fr',
      'nor' => 'no',
      'swe' => 'sv',
      'ara' => 'ar',
      'deu' => 'de',
      'chi' => 'zh',
      'zho' => 'zh',
      'jpn' => 'ja',
      'hin' => 'hi',
      'rus' => 'ru'
    }
  end
end
