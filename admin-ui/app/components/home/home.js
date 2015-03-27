angular.module('upsConsole')
  .controller('HomeController', function( $modal, applicationsEndpoint ) {

    var self = this;

    this.apps = [];

    this.activate = function() {
      self.fetchNewPage(1);
    };

    this.pageChanged = function(page) {
      self.fetchNewPage(page);
    };

    this.fetchNewPage = function(page) {
      applicationsEndpoint.fetch(page)
        .then(function( result ) {
          self.apps = result.apps;
          self.totalItems = result.totalItems;
        });
    };

    this.deleteApp = function() {
      $modal.open({
        templateUrl: 'views/dialogs/remove-app.html',
        controller: 'DefaultModalController'
      });
    };

  });
