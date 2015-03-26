angular.module('upsConsole')
  .controller('HomeController', function( $modal, applicationsEndpoint ) {

    var $scope = this;

    this.apps = [];

    this.activate = function() {
      applicationsEndpoint.fetch(1)
        .then(function( result ) {
          $scope.apps = result.page;
        });
    };

    this.deleteApp = function() {
      $modal.open({
        templateUrl: 'views/dialogs/remove-app.html',
        controller: 'DefaultModalController'
      });
    };

  });
