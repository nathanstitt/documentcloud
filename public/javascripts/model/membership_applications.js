
dc.model.MembershipApplication = Backbone.Model.extend({

  gravatarUrl : function(size) {
    var hash = this.get('hashed_email');
    var fallback = encodeURIComponent( dc.model.Account.prototype.DEFAULT_AVATAR );
    return dc.model.Account.prototype.GRAVATAR_BASE + hash + '.jpg?s=' + size + '&d=' + fallback;
  }


});


dc.model.MembershipApplicationSet = Backbone.Collection.extend({
  model : dc.model.MembershipApplication,
  url   : '/admin/applications.json'


});
