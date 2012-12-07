
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
      { id: 'es', name: 'Español/Spanish', shortName: 'Spanish' },
      { id: 'fr', name: 'Français/French', shortName: 'French'  }
    ]);
  }

});



