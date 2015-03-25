angular.module('upsConsole.services').factory('variantModal', function( $modal  ) {

  class VariantModal {

    add(variant) {
      var modal = this.show('create-variant.html', {
        variant: function () { return variant; }
      });
      return modal.result;
    }

    show(template, resolve) {
      return $modal.open({
        templateUrl: 'views/dialogs/' + template,
        controller: modalController,
        resolve: angular.extend({ // mix-in some defaults
          variant: function() { return null; }
        }, resolve)
      });
    }
  }

  function modalController($scope, $modalInstance, variant) {
    $scope.variant = variant;
    if (!$scope.variant) {
      $scope.variant = {};
    }
    $scope.variant.certificates = [];

    $scope.ok = function () {
      $modalInstance.close();
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  }

  return new VariantModal();

});
