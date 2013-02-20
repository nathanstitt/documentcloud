// A tile view for a document's annotations, listed per-document. Allows
// note editing by those who have permission.
dc.ui.NoteList = Backbone.View.extend({

  className : 'note noselect',

  events: {
    'valuesChanging .moderation' : 'onValuesChanged',
    'change .hideapproved'       : 'onHideApproved',
    'click .approve_all'         : 'onApproveAll'
  },

  constructor : function(options) {
    Backbone.View.call(this, options);
    _.bindAll( this, 'render','_addNote');
    this.collection.bind('reset', this.render );
    this.collection.bind('add', this._addNote);
    this.collection.bind('remove', this._onRemoveNote);

  },

  onApproveAll: function(){
    this.collection.markApproved();
  },

  onValuesChanged: function( ev, data ){
    var selected = this.collection.filter( function(note){
      return ( note.createdAt() >= data.values.min && note.createdAt() <= data.values.max );
    });

    this.renderNotes( selected );
  },

  onHideApproved: function(ev,data){
    var selected_notes = ev.target.checked ? 
          this.collection.reject( function( note ){
            return note.isApproved();
          } ) : this.collection.models;
    var ordered_notes = _.sortBy( selected_notes, this._createdComparator );

    this.renderNotes( ordered_notes );
    this.updateModerationControls( ordered_notes );
  },

  _onRemoveNote: function(ev,data){
    this.updateModerationControls( this.collection.sortBy(this._createdComparator) );
  },

  // Render each of a document's notes, which have already been fetched.
  _addNote : function(note) {
    var noteView = new dc.ui.Note({
      model : note,
      collection : this.collection
    });

    // if isModerator = note is shared with you or you are a member of the organization
    // 

    this.$('.filtered_notes').append(noteView.render().el);

    noteView.center();
  },

  _createdComparator: function( note ){
    return note.createdAt();
  },

  render: function(){
    this.$el.html( JST["document/notes_listing"]() );


    var ordered = this.collection.sortBy(this._createdComparator);

    if ( ordered.length ){ // FIXME add isModerator check here
      this.$('.moderation').html( JST["document/note_moderation_tools"]() );
      this.updateModerationControls( ordered );
    }

    this.renderNotes( ordered );

    return this;
  },

  renderNotes: function( notes ){
    this.$('.filtered_notes').empty();
    this.$('.showing-count').text( notes.length );
    _.each( notes, this._addNote );
  },

  updateModerationControls: function( ordered_notes ){
    this.$('.approve_all').toggle( !!ordered_notes.length );
    this.$('.dateslider').toggle( ordered_notes.length > 1 );

    if ( ordered_notes.length > 1 ){
      var minmax = {
        min: _.first( ordered_notes ).createdAt(),
        max: _.last( ordered_notes ).createdAt()
      };

      this.$('.dateslider').dateRangeSlider({
        arrows:false,
        bounds: minmax,
        defaultValues: minmax
      });
    }


  }


});