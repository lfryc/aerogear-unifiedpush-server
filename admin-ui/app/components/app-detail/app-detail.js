angular.module('upsConsole.appDetail', [])
  .controller('AppDetailController', function( $routeParams, $modal ) {

    this.tab = $routeParams.tab;

    this.app = {
      id: $routeParams.app
    };

    this.sendNotification = function() {
      $modal.open({
        templateUrl: 'views/dialogs/send-push-notification.html',
        controller: 'SendNotificationCtrl as sendNotificationCtrl'
      });
    };

  })

  .controller('SendNotificationCtrl', function( $scope, $modalInstance ) {
    $scope.send = function() {
      console.log('send');
      $modalInstance.close();
    };

    $scope.cancel = function() {
      console.log('cancel');
      $modalInstance.dismiss();
    };
  });
