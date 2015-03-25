angular.module('upsConsole')
  .controller('SenderController', function( $modal ) {
    this.renewMasterSecret = function () {
      $modal.open({
        templateUrl: 'inline:renew-master-secret.html',
        controller: 'DefaultModalController'
      });
    };
  })

  .controller('DefaultModalController', function( $scope, $modalInstance ) {
    $scope.confirm = function () {
      $modalInstance.close.apply($modalInstance, arguments);
    };

    $scope.dismiss = function () {
      $modalInstance.dismiss.apply($modalInstance, arguments);
    };
  });
