dc.ui.AdminLatestDocumentLine = Backbone.View.extend({

  tagName: 'tr',

  render: function(){
    this.$el.html( JST.latest_document_line( this.model.toJSON() ) );
    return this;
  }

});


dc.ui.AdminLatestDocuments = Backbone.View.extend({

  initialize: function(){
    _.bindAll(this, 'appendLine', 'render','_reload' );
    this.collection = new dc.model.DocumentSet();
    this.collection.url =  '/admin/lastest_documents_data';
    this.collection.on('reset', this.render );
    if ( this.options.refreshEvery )
      setInterval( this._reload, 1000 * 60 * this.options.refreshEvery ); // every X minutes: millisecs * secs * minutes
    _.delay(  this._reload, Math.random()*2000 ); // just so we don't fire off all at once
  },

  _reload: function(){
    this.collection.fetch(); 
  },

  appendLine: function( model ){
    var line = new dc.ui.AdminLatestDocumentLine({model: model});
    this.$el.append( line.render().el );
  },

  render: function(){
    this.$el.html('');
    this.collection.each( this.appendLine );
  }

});