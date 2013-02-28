dc.ui.MembershipApplication = Backbone.View.extend({

  tagName: 'tr',

  render: function(){
    this.$el.html( JST['membership_application_row']( this.model.toJSON() ) );

    // commented out for speed while testing
    // var img = new Image();
    // var src = this.model.gravatarUrl( 25 );
    // img.onload = _.bind(function() { 
    //   this.$('img.avatar').attr({src : src}); 
    // }, this);
    // img.src = src;
    return this;
  }

});

dc.ui.MembershipApplications = Backbone.View.extend({

  attributes:{
    'class': 'membership_applications'
  },

  events: {
    'change input.validated': 'onShowValidatedChange'
  },

  initialize: function(options) {
    _.bindAll(this,'prepend', 'render' );
    this.collection.bind( 'reset',  this.render  );
    this.collection.bind( 'add',    this.prepend );
    this.collection.bind( 'remove', this.render  );
  },
  _isValidated: function( model){
    return model.get('validated');
  },
  onShowValidatedChange: function( ev ){
    var checked = this.$('input.validated').is(':checked');
    var models = checked ? this.collection.filter( this._isValidated ) : this.collection.models;
    this.$('tbody').html('');
    _.each( models, this.prepend );
    this.$('.totals .showing').html( models.length );
    this.$('.totals .count').html( this.collection.length );

  },

  prepend: function( model ){
    var application = new dc.ui.MembershipApplication( { model: model });
    this.$('tbody').prepend( application.render().el );
  },

  render: function() {

    this.$el.html( JST['membership_applications']() );

    this.collection.each( this.prepend );
    this.$('.totals .showing').html( this.collection.length );
    this.$('.totals .count').html( this.collection.length );

    return this;
  }


});
