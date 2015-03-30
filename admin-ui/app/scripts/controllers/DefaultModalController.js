'use strict';

angular.module('upsConsole')
  .controller('DefaultModalController', function( $scope, $modalInstance ) {

    $scope.confirm = function () {
      $modalInstance.close.apply($modalInstance, arguments);
    };

    $scope.dismiss = function () {
      $modalInstance.dismiss.apply($modalInstance, arguments);
    };
  });
