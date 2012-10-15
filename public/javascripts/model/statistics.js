
dc.model.Statistic = Backbone.Model.extend({
 
});

dc.model.StatisticNumbers = Backbone.Model.extend({
 
});

dc.model.StatisticsNumbersSet = Backbone.Collection.extend({
  model: dc.model.StatisticNumbers,
  url: '/admin/statistics_number_data'
});



dc.model.StatisticsSet = Backbone.Collection.extend({

  model: dc.model.Statistic,

  url: '/admin/statistics_data',

  initialize: function(){
    this.on('reset',this.addCalculatedRecords );
  },

  addCalculatedRecords: function(){

    var acl =  this.get('documents_by_access').get('value'),
          a = dc.access;

    this.add( { 
      id: 'total_documents', 
      value: _.reduce( acl, function(sum, value) {
        return sum + value;
      }, 0)
    });

    this.add( { 
      id:'private_documents',
      value: ( acl[a.PRIVATE] || 0) + (acl[a.ORGANIZATION] || 0) + (acl[a.EXCLUSIVE] || 0)
    });

    this.add({ id: 'public_docs', value: acl[a.PUBLIC] || 0 });

    this.add({ id: 'pending_docs', value: acl[a.PENDING] || 0 } );

    this.add({ id: 'error_docs', value: acl[a.ERROR] || 0 });

  }

});
