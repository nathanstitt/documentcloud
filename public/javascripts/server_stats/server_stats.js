(function(root,$,undefined) {

  root.ServerStats = Backbone.View.extend({
    initialize : function(options) {
      _.extend(this, _.pick(options, ['statistics','graphs']));
      _.bindAll(this,'grid_value');
    },


    render: function(){
      five_minutes = 300000; // not really, needs 00 added
      this.context = cubism.context()
        .step(five_minutes) // 00 5 minutes
        .size(12*12*10); //this.$el.width()-280); // Number of data points

      this.draw_graph();
      return this;
    },

    grid_value: function(index) {
      var stats = this.statistics;
      console.log(index);
      return this.context.metric(function(start, stop, step, callback) {
        //values.push()
        var index=name
        var values = [];
        console.log(arguments);
        // convert start & stop to milliseconds
        start = +start;
        stop = +stop;

        while (start < stop) {
          start += step;
          values.push(Math.random());
        }

        callback(null, values);
      }, name);
    },


    draw_graph: function() {
      var context = this.context,
            width = this.$el.width(),
           aspect = 500 / 950;

      d3.select(this.el).append("div") // Add a vertical rule to the graph
        .attr("class", "rule")
        .call(this.context.rule());


      d3.select("#charts")                 // Select the div on which we want to act
        .selectAll(".axis")              // This is a standard D3 mechanism to bind data
        .data(["top"])                   // to a graph. In this case we're binding the axes
        .enter()                         // "top" and "bottom". Create two divs and give them
        .append("div")                   // the classes top axis and bottom axis respectively.
        .attr("class", function(d) {
          return d + " axis";
        })
        .each(function(d) {              // For each of these axes, draw the axes with 4
          d3.select(this)              // intervals and place them in their proper places.
            .call(context.axis()       // 4 ticks gives us an hourly axis.
                  .ticks(4).orient(d));
        });

      d3.select("#charts")
        .selectAll(".horizon")
        .data(_.map(_.range(this.graphs.length), this.grid_value ))
//      values.map(this.grid_value)
        .enter()
        .insert("div", ".bottom")        // Insert the graph in a div. Turn the div into
        .attr("class", "horizon")        // a horizon graph and format to 2 decimals places.
        .call(context.horizon()
              .format(d3.format("+,.2p"))
              .height(60)
             );

      context.on("focus", function(i) {
        d3.selectAll(".value").style("right",   // Make the rule coincide with the mouse
                                     i == null ? null : context.size() - i + "px");
      });



    }


  });


})( window, $ );
