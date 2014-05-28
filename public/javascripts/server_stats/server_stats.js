$(function() {

  var ServerStats = Backbone.View.extend({
    initialize : function() {
    },


    render: function(){
      this.$el.html("HOWDY!");
      return this;
    }

  });

  window.server_stats = new ServerStats({el: $('#server-stats')}).render();

});
