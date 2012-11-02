dc.ui.RotatePagesEditor = dc.ui.EditorToolbar.extend({

  id : 'rotate_pages_container',

  events : {
    'click .rotate_pages_confirm_input' : 'confirmRotatePages',
    'click .close_editor'                : 'close',
    'click .left' : 'rotateLeft',
    'click .right' : 'rotateRight'
  },

  apiExtensions:{
    enterRotatePagesMode : function() {
      this.viewer.openEditor = 'rotatePages';
      this.viewer.elements.viewer.addClass('DV-rotatePages');
    },

    leaveRotatePagesMode : function() {
      this.resetRotatedPages();
      this.viewer.openEditor = null;
      this.viewer.elements.viewer.removeClass('DV-rotatePages');
    },

    resetRotatedPages : function() {
//      this.viewer.models.document.redrawReorderedPages();
    },

 
    rotatePages : function(pageOrder, options) {
      var model = this.getModelId();
      this.viewer.models.document.rotatePages(model, pageOrder, options);
    }

  },

  initialize : function(options) {
    this.editor = options.editor;

    // HACK!  This monkey patches the viwer api with
    // rotate functionality
    // Should really go onto it directly
    _.extend( currentDocument.api, this.apiExtensions );

  },

  _isRotationCSS: function( cls ){
    var match = cls.match(/^r\d+$/);
    return match ? match[0] : null;
  },

  getElementsRotation: function(el){
    var css = _.find( el.attr('class').split(/\s+/), this._isRotationCSS );
    return css ? parseInt(css.substr(1)) : 0;
  },

  _performRotation: function( el,move ){
    var rotation     = this.getElementsRotation( el ),
        new_rotation = rotation + move;
    if ( new_rotation < 0 ){
      new_rotation = 270;
    } else if ( new_rotation >= 360 ){
      new_rotation = 0;
    }
    el.removeClass('r'+rotation);
    el.addClass( 'r'+new_rotation);
  },

  rotateLeft: function(){
    var move = -90, me = this;
    this.getSelections().each( function(){ me._performRotation( $(this), move ); } );
    this.updateSavableState();
  },

  rotateRight: function(){
    var move = 90, me = this;
    this.getSelections().each( function(){ me._performRotation( $(this), move ); } );
    this.updateSavableState();
  },

  updateSavableState: function(){
    var rotated_count  = this.getRotated().length;
    this.$s.saveButton.setMode( rotated_count ? 'is' : 'not', 'enabled');
  },

  getSelections: function(){ 
    return this.$s.thumbnailsContainer.find( '.DV-selected' );
  },

  getRotated: function(){
    return this.$s.thumbnailsContainer.find( '.DV-thumbnail.r90,.DV-thumbnail.r180,.DV-thumbnail.r270' );
  },

  findSelectors : function() {
    this.$s = {
      viewerContainer : $('.DV-docViewer-Container'),
      pages : $('.DV-pages'),
      thumbnailsContainer : $('.DV-thumbnails'),
      helpText : $('.rotate_pages .editor_hint'),
      guide : $('#edit_rotate_pages_guide'),
      guideButton: $('.edit_rotate_pages'),
      arrows: $('.editor_toolbar .rotate_pages .arrows'),
      saveButton : $('.rotate_pages_confirm_input')
    };
  },

  open : function() {
    $(this.el).show();
    this.findSelectors();
    this.setMode('is', 'open');
    this.viewer.api.enterRotatePagesMode();
    this.viewer.api.resetRotatedPages();
    this.render();
    this.$s.guide.fadeIn('fast');
    this.$s.guideButton.addClass('open');
    this.$s.saveButton.setMode('not', 'enabled');
    this.hideSelectedThumbnail();
  },

  render : function() {
    $(this.el).html(JST['rotate_pages']({}));
    this.$s.viewerContainer.append(this.el);
    this.findSelectors();
    if (this.viewer.state != 'ViewThumbnails') {
        this.viewer.open('ViewThumbnails');
    }
    this.$s.pages.addClass('rotate_pages_viewer');
    this.$s.container = $(this.el);
    $('.DV-currentPageImage', this.$s.thumbnails).removeClass('DV-currentPageImage')
      .addClass('DV-currentPageImage-disabled');

    this.$s.thumbnailsContainer.on('mousedown','.DV-thumbnail', _.bind(this.toggleThumbnail, this) );
  },

  toggleThumbnail: function( evt ){
    $(evt.target).closest('.DV-thumbnail').toggleClass('DV-selected');
    var selected_count = this.getSelections().length;
    if ( selected_count > 0 ){
      this.$s.helpText.html( "Rotate "+ selected_count + ' ' + 
                             dc.inflector.pluralize('page',selected_count) + 
                             ' as desired then click Save');
    } else {
      this.$s.helpText.html( "Select pages to modify rotation");
    }
  },


  confirmRotatePages : function() {
    if ( ! this.getRotated().length ) return;
    dc.ui.Dialog.confirm("You've rotated the pages in this document. The document will close while it's being rebuilt. Are you sure you're ready to proceed?", _.bind(function() {
      $('input.rotate_pages_confirm_input', this.el).val('Rotateing...').attr('disabled', true);
      this.save();
      return true;
    }, this));
  },

  save : function() {
    var rotate = _.map( this.getRotated(), function( dom_el ){
      var jq_el = $(dom_el);
      return {  page_number : jq_el.attr('data-pageNumber'),
                rotation    : this.getElementsRotation( jq_el ) };
    }, this );
    //    dc.ui.Dialog.progress("Rotateing Pages&hellip;");
    console.log( rotate );
    var modelId = this.viewer.api.getModelId();
    $.ajax( '/documents/' + modelId + '/rotate_pages', {
      data: { rotations: rotate }, 
      dataType: 'json',
      type: 'POST',
      success   : function(resp) {
        try {
          window.opener && window.opener.Documents && window.opener.Documents.get(modelId).set(resp);
        } catch (e) {
          // It's alright.
        }
        window.close();
        _.defer(dc.ui.Dialog.alert, "The pages are being rotated. Please close this document.");
      }
    });
  },

  close : function() {
    if (this.modes.open == 'is') {
      this.editor.setSaveState();
      $('.DV-currentPageImage-disabled', this.$s.page).addClass('DV-currentPageImage').removeClass('DV-currentPageImage-disabled');
      this.setMode('not', 'open');
      jQuery('.DV-thumbnails').sortable('destroy');
      this.$s.guide.hide();
      this.$s.guideButton.removeClass('open');
      this.$s.pages.removeClass('rotate_pages_viewer');
      $(this.el).hide();
      this.viewer.api.leaveRotatePagesMode();
    }
  }

});