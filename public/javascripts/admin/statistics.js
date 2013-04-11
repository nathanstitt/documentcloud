dc.ui.AdminSingleStatistic = Backbone.View.extend({


  attributes:{
    'class':'number'
  },

  initialize: function(options){
    _.bindAll(this,'render');
  },

  render: function(){
    this.$el.toggleClass( 'loading', ! this.model );
    this.$el.html( this.model ? dc.inflector.commify( this.model.get('value') ) : 'Loading' );
    return this;
  }

});

dc.ui.AdminStatistics = Backbone.View.extend({

  events:{
    'click .refresh': '_reload'
  },

  initialize : function(options) {
    _.bindAll(this, 'renderSingleStat', 'render','_reload' );
    this.collection = new dc.model.StatisticsSet();
    this.collection.on('reset', this.render );
    if ( this.options.refreshEvery )
      setInterval( this._reload, 1000 * 60 * this.options.refreshEvery ); // every X minutes: millisecs * secs * minutes
    _.delay(  this._reload, Math.random()*2000 ); // just so we don't fire off all at once

  },

  _reload: function(){
    this.collection.reset();
    this.collection.fetch();
  },

  renderSingleStat: function( index, el ){
    var view = new dc.ui.AdminSingleStatistic({
      model: this.collection.get( el.className )
    });
    $(el).html( view.render().el );
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
    this.$('tr.data td').each( this.renderSingleStat );
    return this;
  }

});
