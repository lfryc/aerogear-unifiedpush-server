angular.module('upsConsole')
  .controller('SenderController', function( $modal ) {
    this.renewMasterSecret = function () {
      $modal.open({
        templateUrl: 'inline:renew-master-secret.html',
        controller: 'DefaultModalController'
      });
    };
  });
