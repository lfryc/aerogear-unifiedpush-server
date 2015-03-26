angular.module('upsConsole.services').factory('variantModal', function( $modal, $q, variantsEndpoint, createAppWizard  ) {

  class VariantModal {

    add() {
      var modal = $modal.open({
        templateUrl: 'views/dialogs/create-variant.html',
        controller: VariantModalController,
        resolve: {
          variant: function() {
            return {}
          }, // for adding we use empty variant
          confirm: function () {
            return function ( modal, variantType, variantData ) {
              console.log('confirm');
              console.log(variantData);
              console.log(createAppWizard);
              variantsEndpoint.create( { appId: createAppWizard.app.pushApplicationID, variantType: variantType }, variantData )
                .then(function( variant ) {
                  console.log(variant);
                  modal.close( variant );
                })
                .catch(function( err ) {
                  modal.dismiss( err );
                });
            }
          },
          dismiss: function () {
            return function () {
              modal.dismiss('cancel');
            }
          }
        }
      });
      return modal.result;
    }
  }

  function VariantModalController($scope, $modalInstance, variant, confirm, dismiss) {

    $scope.variant = variant;
    $scope.variant.certificates = []; // initialize file list for upload

    $scope.confirm = function () {
      confirm( $modalInstance, $scope.variant.type, extractValidVariantData($scope.variant) );
    };

    $scope.dismiss = function () {
      dismiss( $modalInstance );
    };

    $scope.validateFileInputs = function() {
      switch ($scope.variant.type) {
        case 'ios':
          return $scope.variant.certificates.length > 0;
      }
      return true;
    }
  }

  function extractValidVariantData(variant) {
    var properties = ['name'], result = {};
    switch (variant.type) {
      case 'android':
        properties = properties.concat(['projectNumber', 'googleKey']);
        break;
      case 'simplePush':
        properties = properties.concat([]);
        break;
      case 'ios':
        if (variant.certificates && variant.certificates.length) {
          variant.certificate = variant.certificates[0];
        }
        properties = properties.concat(['production', 'passphrase', 'certificate']);
        var formData = new FormData();
        properties.forEach(function (property) {
          formData.append(property, variant[property] || '');
        });
        return formData;
      case 'windows':
        variant.type = variant.type + '_' + variant.protocolType;
        properties = properties.concat(['sid', 'clientSecret', 'protocolType']);
        break;
      case 'windows_wns':
        result.protocolType = 'wns';
        properties = properties.concat(['sid', 'clientSecret']);
        break;
      case 'windows_mpns':
        result.protocolType = 'mpns';
        properties = properties.concat([]);
        break;
      case 'adm':
        properties = properties.concat(['clientId','clientSecret']);
        break;
      default:
        throw 'Unknown variant type ' + variant.type;
    }
    properties.forEach(function (property) {
      result[property] = variant[property];
    });
    console.log(result);
    return result;
  }

  return new VariantModal();

});
