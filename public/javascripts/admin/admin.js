dc.ui.Admin = Backbone.View.extend({

  DATE_FORMAT : "%b %d, %y",

  // Quick tags for the instances we know about. Purely for convenience.
  INSTANCE_TAGS : {
    'i-0d4e9065': 'staging',
    'i-a3466ecb': 'app01',
    'i-4752792f': 'db01',
    'i-c47d78b9': 'worker01',
    'i-c41216b9': 'worker02',
    'i-c61216bb': 'worker03',
    'i-c01216bd': 'worker04'
  },

  id        : 'statistics',
  className : 'serif',

  events : {
    'plothover .chart':           '_showTooltop',
    'click #instances .minus':    '_terminateInstance',
    'click .more_top_documents':  '_loadMoreTopDocuments',
    'click #load_all_accounts':   '_loadAllAccounts',
    'click .account_list .sort':  '_sortAccounts'
  },

  ACCOUNT_COMPARATORS : {
    name           : dc.model.AccountSet.prototype.comparator,
    email          : function(account){ return account.get('email').toLowerCase(); },
    organization   : function(account){ return account.get('orgnization_name').toLowerCase(); },
    document_count : function(account){ return -(account.get('public_document_count') || 0 + account.get('private_document_count') || 0); },
    page_count     : function(account){ return -account.get('page_count') || 0; }
  },

  initialize : function(options) {
    _.bindAll(this, 'launchWorker', 'renderCharts', 'reprocessFailedDocument', 'vacuumAnalyze', 'optimizeSolr', '_loadAllAccounts');
    this._tooltip = new dc.ui.Tooltip();
    this.per_account_stats = {};
    this._actionsMenu      = this._createActionsMenu();

    this.statistics        = new dc.ui.AdminStatistics({ refreshEvery: 18 });
    this.charts            = new dc.ui.AdminCharts({refreshEvery: 22 });
    this.updaters = {};
    _.each({
      'ec2': 20,
      'latest_documents': 8,
      'by_the_numbers': 20,
      'top_documents': { comparator: function( doc ){  return -doc.get('hits');  } },
      'top_searches': { comparator: function( search ){ return -search.get('hits'); } },
      'top_notes': { beforeRender: this.linkNoteDocument, comparator: function( note ){ return -note.get('hits'); } },
      'failed_documents': 10
    }, this.tableUpdaterFactory, this );

    $(window).bind('resize', this.renderCharts );
  },

  tableUpdaterFactory: function( opts, name ){
    if ( _.isNumber(opts) )
      opts = { refreshEvery: opts };
    _.extend( opts, {
      tmpl: name + '_line',
      action: name + '_data'
    });
    this.updaters[name] = new  dc.ui.AdminTableUpdater( opts );
  },


  linkNoteDocument: function(notes){
    notes.each(function(note) {
      note.document = new dc.model.Document(note.get('document'));
    });
  },


  render : function() {
    $(this.el).html( JST.main_page() );
    $('#topbar').append(this._actionsMenu.render().el);

    _.each( this.updaters, function( updater, name ){
      updater.setElement( this.$('#' + name ) );
    },this);

    this.statistics.setElement(  this.$('.statistics') ).render();
    this.renderCharts();

    if (Accounts.length) _.defer(this._loadAllAccounts);

    return this;
  },

  renderCharts : function(){
    this.charts.setElement( this.$('.charts') ).render();
  },

  renderAccounts : function() {
    this.$('#accounts_wrapper').html((new dc.ui.AdminAccounts()).render().el);
  },


  launchWorker : function() {
    dc.ui.Dialog.confirm('Are you sure you want to launch a new Medium Compute<br />\
      EC2 instance for document processing, on <b>production</b>?', function() {
      $.post('/admin/launch_worker', function() {
        dc.ui.Dialog.alert(
          'The worker instance has been launched successfully.\
          It will be a few minutes before it comes online and registers with CloudCrowd.'
        );
      });
      return true;
    });
  },

  vacuumAnalyze : function() {
    $.post('/admin/vacuum_analyze', function() {
      dc.ui.Dialog.alert('The vacuum background job was started successfully.');
    });
  },

  optimizeSolr : function() {
    $.post('/admin/optimize_solr', function() {
      dc.ui.Dialog.alert('The Solr optimization task was started successfully.');
    });
  },

  forceBackup : function() {
    $.post('/admin/force_backup', function() {
      dc.ui.Dialog.alert('The database backup job was started successfully.');
    });
  },

  reprocessFailedDocument : function() {
    dc.ui.Dialog.confirm('Are you sure you want to re-import the last failed document?', function() {
      $.post('/admin/reprocess_failed_document', function() {
        window.location.reload(true);
      });
      return true;
    });
  },

  _terminateInstance : function(e) {
    var instanceId = $(e.target).attr('data-id');
    dc.ui.Dialog.confirm('Are you sure you want to terminate instance <b>' + instanceId + '</b>?', function() {
      $.post('/admin/terminate_instance', {instance: instanceId}, function() {
        dc.ui.Dialog.alert('Instance <b>' + instanceId + '</b> is shutting down.');
      });
      return true;
    });
  },

  _sortAccounts : function(e) {
    var sort = $(e.target).attr('data-sort');
    Accounts.comparator = this.ACCOUNT_COMPARATORS[sort];
    Accounts.sort();
    this.renderAccounts();
    $('.account_list .sort_' + sort).addClass('active');
  },

  // Create a tooltip to show a hovered date.
  _showTooltop : function(e, pos, item) {
    if (!item) return this._tooltip.hide();
    var count = item.datapoint[1];
    var date  = $.plot.formatDate(new Date(item.datapoint[0]), this.DATE_FORMAT);
    var title = dc.inflector.pluralize(item.series.title, count);
    return this._tooltip.show({
      left : pos.pageX,
      top  : pos.pageY,
      title: count + ' ' + title,
      text : date
    });
  },

  _loadAllAccounts : function() {
    $('#load_all_accounts').hide();
    $('.minibutton.download_csv').hide();
    var finish = _.bind(function() {
      this.renderAccounts();
      this._addCountsToAccounts();
      $('tr.accounts_row').show();
    }, this);
    if (Accounts.length) return finish();
    return $.getJSON('/admin/all_accounts', {}, _.bind(function(resp) {
      Accounts.reset(resp.accounts);
      delete resp.accounts;
      _.extend(this.per_account_stats, resp);
      finish();
    }, this));
  },

  // Loads the top 100 published documents, sorted by number of hits in the past year.
  _loadMoreTopDocuments : function(e) {
    $.getJSON('/admin/hits_on_documents', {}, _.bind(this._displayMoreTopDocuments, this));
  },

  // Displays all top documents, retrieved through AJAX.
  _displayMoreTopDocuments : function(data) {
    this.updaters.top_documents.collection.reset(data);
  },


  _createActionsMenu : function() {
    return new dc.ui.Menu({
      label   : 'Administrative Actions',
      id      : 'admin_actions',
      items   : [
        {title : 'Add an Organization',       onClick : function(){ window.location = '/admin/signup'; }},
        {title : 'View CloudCrowd Console',   onClick : function(){ window.location = CLOUD_CROWD_SERVER; }},
        {title : 'Reprocess Last Failed Doc', onClick : this.reprocessFailedDocument},
        {title : 'Force a DB Backup to S3',   onClick : this.forceBackup},
        {title : 'Vacuum Analyze the DB',     onClick : this.vacuumAnalyze},
        {title : 'Optimize the Solr Index',   onClick : this.optimizeSolr},
        {title : 'Launch a Worker Instance',  onClick : this.launchWorker},
        {title : 'Edit Featured Reporting',   onClick : function(){ window.location = '/admin/featured'; } }
      ]
    });
  },

  _addCountsToAccounts : function() {
    Accounts.each(function(acc) {
    acc.set({
      public_document_count   : this.per_account_stats.public_per_account[acc.id],
      private_document_count  : this.per_account_stats.private_per_account[acc.id],
      page_count              : this.per_account_stats.pages_per_account[acc.id]
     });
    },this);
  }

});
