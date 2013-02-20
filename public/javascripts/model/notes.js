// Note Model

dc.model.Note = Backbone.Model.extend({

  document : function() {
    return this._document = this._document || Documents.get(this.get('document_id'));
  },

  checkAllowedToEdit : function() {
    if (!dc.account) return false;
    if (this.document().viewerEditable) return true;
    return Accounts.current().allowedToEdit(this);
  },

  imageUrl : function() {
    return this._imageUrl = this._imageUrl ||
      this.document().get('page_image_url').replace('{size}', 'normal').replace('{page}', this.get('page'));
  },

  coordinates : function() {
    if (this._coordinates) return this._coordinates;
    var loc = this.get('location');
    if (!loc) return null;
    var css = _.map(loc.image.split(','), function(num){ return parseInt(num, 10); });
    return this._coordinates = {
      top:    css[0],
      left:   css[3],
      right:  css[1],
      height: css[2] - css[0],
      width:  css[1] - css[3]
    };
  },

  createdAt: function(){
    return new Date( Date.parse( this.get('created_at') ) );
  },
  markApproved: function(){
    this.collection.markApproved( [this] );
  },
  isApproved: function(){
    return !! this.get('moderation_date');
  }

});

// Note Set

dc.model.NoteSet = Backbone.Collection.extend({

  model : dc.model.Note,
  url   : '/notes',

  comparator : function(note) {
    var coords = note.coordinates();
    return note.get('page') * 10000 + (coords ? coords.top : 0);
  },

  unrestricted : function() {
    return this.filter(function(note){ return note.get('access') != 'private'; });
  },

  markApproved: function( models ){
    if ( ! models ){
      models = this.models;
    }
    var ids = _.pluck( models, 'id' );
    var me = this;
    $.ajax({
      type: "POST",
      url: this.url()+'/approve',
      data: { annotation_ids: ids },
      dataType: 'json',
      success: function(updated_notes){ // won't need when we upgrade backbone and have Collection#update
        _.each( updated_notes, function( note ){
          var existing_model = me.get( note.id );
          if ( existing_model ){
            existing_model.set( note );
          } else {
            me.add( note );
          }
        });
      }
    });
    
  }

});
