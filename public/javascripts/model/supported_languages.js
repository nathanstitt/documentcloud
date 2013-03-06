
// A listing of the languages that have full text search support

dc.model.SupportedLanguage = Backbone.Model.extend({

  isDefault: function(){
    return this.get('default');
  }

});


dc.model.SupportedLanguageSet = Backbone.Collection.extend({

  model: dc.model.SupportedLanguage,

  constructor : function(attrs, options) {
    Backbone.Collection.call(this, options);
    this.add([
      { id: 'en', name: 'English',         shortName: 'English', default: true },
      { id: 'es', name: 'Español/Spanish', shortName: 'Spanish'                },
      { id: 'fr', name: 'Français/French', shortName: 'French'                 },
      { id: 'nn', name: 'Norwegian',       shortName: 'Norwegian'              },
      { id: 'sv', name: 'Swedish',         shortName: 'Swedish'                },
      { id: 'ar', name: 'Arabic',          Shortname: 'Arabic'                 },
      { id: 'de', name: 'German',          shortName: 'German'                 },
      { id: 'hans', name: 'Chinese/Simplified',         shortName: 'Chinese(sim)'                },
      { id: 'hant', name: 'Chinese/Traditional',        shortName: 'Chinese(tra)'                },
      { id: 'ja', name: 'Japanese',        shortName: 'Japanese'               },
      { id: 'hi', name: 'Hindi',           shortName: 'Hindi'                  },
      { id: 'ru', name: 'Russian',         shortName: 'Russian'                }
    ]);
  }

});
