
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
      { id: 'eng',     name: 'English'             },
      { id: 'spa',     name: 'Español/Spanish'     },
      { id: 'fra',     name: 'Français/French'     },
      { id: 'nor',     name: 'Norwegian'           },
      { id: 'swe',     name: 'Swedish'             },
      { id: 'ara',     name: 'Arabic'              },
      { id: 'deu',     name: 'German'              },
      { id: 'chi_sim', name: 'Chinese/Simplified'  },
      { id: 'chi_tra', name: 'Chinese/Traditional' },
      { id: 'jpn',     name: 'Japanese'            },
      { id: 'hin',     name: 'Hindi'               },
      { id: 'rus',     name: 'Russian'             }
    ]);
  }

});
