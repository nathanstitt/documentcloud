// A tile view for a document's annotations, listed per-document. Allows
// note editing by those who have permission.
dc.ui.NoteList = Backbone.View.extend({

  className : 'note noselect',

  events: {
    'valuesChanging .moderation': 'onValuesChanged'
  },

  constructor : function(options) {
    Backbone.View.call(this, options);
    _.bindAll( this, 'render','_addNote');
    this.collection.bind('reset', this.render );
    this.collection.bind('add', this._addNote);
    

  },

  onValuesChanged: function( ev, data ){
    var selected = this.collection.filter( function(note){
      return ( note.updatedAt() >= data.values.min && note.updatedAt() <= data.values.max );
    });

    this.renderNotes( selected );
  },


  // Render each of a document's notes, which have already been fetched.
  _addNote : function(note) {
    var noteView = new dc.ui.Note({
      model : note,
      collection : this.collection
    });

    // if isModerator = note is shared with you or you are a member of the organization
    // 

    this.$('.filtered_notes').append( JST["document/note_moderation_tools"]() );

    this.$('.filtered_notes').append(noteView.render().el);

    noteView.center();
  },

  _updatedComparator: function( note ){
    return note.updatedAt();
  },

  render: function(){

    this.$el.empty();

    var ordered = this.collection.sortBy(this._updatedComparator);
    if ( this.collection.length ){ // FIXME add isModerator check here
      this.renderModeration( ordered );
    }


    this.renderNotes( ordered );

    return this;
  },

  renderNotes: function( notes ){
    this.$('.filtered_notes').empty();
    this.$('.showing-count').text( notes.length );
    _.each( notes, this._addNote );
  },

  renderModeration: function( ordered ){

    this.$el.append( JST["document/notes_listing"]() );
    var minmax = {
      min: _.first( ordered ).updatedAt(),
      max: _.last( ordered ).updatedAt()
    };
    this.$('.dateslider').dateRangeSlider({
      arrows:false,
      bounds: minmax,
      defaultValues: minmax
    });

  }


});