angular.module('upsConsole')
  .controller('HomeController', function( $modal ) {

    this.deleteApp = function() {
      $modal.open({
        templateUrl: 'views/dialogs/remove-app.html',
        controller: 'DefaultModalController'
      });
    }
  });
