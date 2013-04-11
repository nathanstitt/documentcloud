

dc.ui.AdminTableLine = Backbone.View.extend({
  tagName: 'tr',
  render: function(){
    this.$el.html( JST[this.options.tmpl]( { line: this.model } ) );
    return this;
  }
});



dc.ui.AdminTableUpdater = Backbone.View.extend({
  events:{
    'click .refresh': '_reload'
  },

  initialize: function(){
    _.bindAll(this, 'appendLine', 'render','_reload' );
    if ( ! this.collection )
      this.collection = new Backbone.Collection();
    this.collection.url = '/admin/' + this.options.action;
    this.collection.on('reset', this.render );
    if ( this.options.comparator )
      this.collection.comparator = this.options.comparator;
    if ( this.options.refreshEvery )
      setInterval( this._reload, 1000 * 60 * this.options.refreshEvery ); // every X minutes: millisecs * secs * minutes
    _.delay(  this._reload, Math.random()*2000 ); // just so we don't fire off all at once
  },

  _reload: function(){
    this.$('.view').html('<td class="loading">Loading...</td>');
    this.collection.fetch();
  },

  appendLine: function( model ){
    var line = new dc.ui.AdminTableLine({model: model, tmpl: this.options.tmpl });
    return line.render().el;
  },

  setUpdatedTime: function(){
    var el = this.$('.timeago');
    if ( el.data('timeago') )
      el.timeago('update', (new Date).toISOString() );
    else
      el.attr('title', (new Date).toISOString() ).timeago();
  },

  render: function(){
    this.setUpdatedTime();
    if ( _.isFunction( this.options.beforeRender ) )
      this.options.beforeRender( this.collection );
    this.$('.view').html( this.collection.map( this.appendLine ) );
  }

});
