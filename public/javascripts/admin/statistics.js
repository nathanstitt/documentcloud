

dc.ui.AdminSingleStatistic = Backbone.View.extend({
  TRIPLETS : /(\d+)(\d{3})/,

  attributes:{
    class:'number'
  },

  initialize: function(options){
    _.bindAll(this,'render');
  },

  render: function(){
    this.$el.toggleClass( 'loading', ! this.model )
    this.$el.html( this.model ? this._format( this.model.get('value') ) : 'Loading' )
    return this;
  },
  // Format a number by adding commas in all the right places.
  _format : function(number) {
    var parts = (number + '').split('.');
    var integer = parts[0];
    var decimal = parts.length > 1 ? '.' + parts[1] : '';
    while (this.TRIPLETS.test(integer)) {
      integer = integer.replace(this.TRIPLETS, '$1,$2');
    }
    return integer + decimal;
  },

});

dc.ui.AdminStatistics = Backbone.View.extend({

  initialize : function(options) {
    _.bindAll(this, 'renderSingleStat', 'render','_reload' );
    this.collection = new dc.model.StatisticsSet();
    this.collection.on('reset', this.render );
    if ( this.options.refreshEvery )
      setInterval( this._reload, 1000 * 60 * this.options.refreshEvery ); // every X minutes: millisecs * secs * minutes
    _.delay(  this._reload, Math.random()*2000 ); // just so we don't fire off all at once

  },

  _reload: function(){
    this.collection.fetch();
  },

  renderSingleStat: function( index, el ){
    view = new dc.ui.AdminSingleStatistic({
      model: this.collection.get( el.className ),
    })
    $(el).html( view.render().el )
  },

  render: function(){
    this.$('tr.data td').each( this.renderSingleStat );
    return this;
  }

});



