(function( namespace, jQuery, undefined) {

  // This method may not be the way to go:
  // http://stackoverflow.com/questions/295566/sanitize-rewrite-html-on-the-client-side/430240#430240
  // claims that <img src=bogus onerror="alert('by')">
  // will run the onerror handler even if the node is never attached to the DOM.
  // I have not been able to replicate this

  var DOM = jQuery( '<span></span>' );

  namespace.XSS={

    escape: function( txt ){
      return DOM.text( txt ).html()
    },

    uri_decode: function( txt ){
      return decodeURIComponent( this.escape( txt ) );
    }

  };

})( window, jQuery );
