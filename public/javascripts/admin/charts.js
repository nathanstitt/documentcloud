
// a private little model. 
var chartModel = Backbone.Model.extend({
  url: '/admin/chart_data' 
});


dc.ui.AdminCharts = Backbone.View.extend({

  GRAPH_OPTIONS : {
    xaxis     : {mode : 'time', minTickSize: [1, "day"]},
    yaxis     : {},
    legend    : {show : false},
    series    : {lines : {show : true, fill : false}, points : {show : false}},
    grid      : {borderWidth: 1, borderColor: '#222', labelMargin : 7, hoverable : true}
  },

  initialize: function(){
    _.bindAll(this, 'render', '_reload' );
    this.model = new chartModel;
    this.model.on('change',this.render);

    if ( this.options.refreshEvery )
      setInterval( this._reload, 1000 * 60 * this.options.refreshEvery ); // every X minutes: millisecs * secs * minutes

    _.delay(  this._reload, Math.random()*2000 ); // just so we don't fire off all at once
  },

  _reload: function(){
    this.model.fetch();
  },

  setChartStatus: function(selector, is_loading ){
    var el = this.$( selector );

    if ( is_loading ){
      el.html('loading');
    }
    el.toggleClass( 'loading', is_loading );
    return el;
  },


  render: function(){

    var stats = this.model.toJSON(),
        is_loading = $.isEmptyObject( stats ),
        el;

    el=this.setChartStatus( '#daily_docs_chart', is_loading );
    if ( ! is_loading ){
      $.plot(el,  [ this._series(stats.daily_documents, 'Document', 1), 
                    this._series(stats.daily_pages, 'Page', 2) ], this.GRAPH_OPTIONS);
    }

    el=this.setChartStatus( '#weekly_docs_chart', is_loading );
    if ( ! is_loading ){
      $.plot( el, [this._series(stats.weekly_documents, 'Document', 1), 
                   this._series(stats.weekly_pages, 'Page', 2)], this.GRAPH_OPTIONS);
    }

    el=this.setChartStatus( '#daily_hits_chart', is_loading );
    if ( ! is_loading ){
      $.plot(el,  [this._series(stats.daily_hits_on_documents, 'Document Hit'), 
                   this._series(stats.daily_hits_on_notes, 'Note Hit'), 
                   this._series(stats.daily_hits_on_searches, 'Search Hit')], this.GRAPH_OPTIONS);
    }
    

    el=this.setChartStatus( '#weekly_hits_chart', is_loading );
    if ( ! is_loading ){
      $.plot( el, [this._series(stats.weekly_hits_on_documents, 'Document Hit'), 
                   this._series(stats.weekly_hits_on_notes, 'Note Hit'), 
                   this._series(stats.weekly_hits_on_searches, 'Search Hit')], this.GRAPH_OPTIONS);
    }
    

  },


  // Convert a date-hash into JSON that flot can properly plot.
  _series : function(data, title, axis) {
    return {
      title : title,
      yaxis : axis,
      color : axis == 1 ? '#7EC6FE' : '#199aff',
      data  : _.sortBy(_.map(data, function(val, key) {
        return [parseInt(key, 10) * 1000, val];
      }), function(pair) {
        return pair[0];
      })
    };
  }


});
