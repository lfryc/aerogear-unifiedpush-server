'use strict';

angular.module('upsConsole.services').factory('variantModal', function ($modal, $q, variantsEndpoint) {
  var service = {
    add: function (app) {
      return $modal.open({
        templateUrl: 'views/dialogs/create-variant.html',
        controller: function ($scope, $modalInstance) {

          $scope.isNew = true;
          $scope.variant = {}; // start with empty variant
          $scope.variant.certificates = []; // initialize file list for upload

          $scope.confirm = function () {
            var variantData = extractValidVariantData($scope.variant);

            var createFunction = (variantData instanceof FormData) ? variantsEndpoint.createWithFormData : variantsEndpoint.create;

            createFunction({
              appId: app.pushApplicationID,
              variantType: extractVariantType($scope.variant)
            }, variantData)
              .then(function (variant) {
                $modalInstance.close(variant);
              })
              .catch(function (err) {
                $modalInstance.dismiss(err);
              });
          };

          $scope.dismiss = function () {
            $modalInstance.dismiss('cancel');
          };

          $scope.validateFileInputs = function () {
            switch ($scope.variant.type) {
            case 'ios':
              return $scope.variant.certificates.length > 0;
            }
            return true;
          };
        }
      }).result;
    },

    edit: function (app, variant) {
      return $modal.open({
        templateUrl: 'views/dialogs/create-variant.html',
        controller: function ($scope, $modalInstance) {

          $scope.isNew = false;
          $scope.variant = variant;
          $scope.variant.certificates = []; // initialize file list for upload

          $scope.confirm = function () {
            var endpointParams = {
              appId: app.pushApplicationID,
              variantType: extractVariantType($scope.variant),
              variantId: variant.variantID
            };
            var variantData = extractValidVariantData($scope.variant);
            var promise;
            if (variant.type !== 'ios') {
              promise = variantsEndpoint.update(endpointParams, variantData);
            } else {
              if (variant.certificate) {
                promise = variantsEndpoint.updateWithFormData(endpointParams, variantData);
              } else {
                promise = variantsEndpoint.patch(endpointParams, {
                  name: variant.name,
                  description: variant.description
                });
              }
            }
            promise.then(function (modifiedVariant) {
              modifiedVariant.variantID = variant.variantID;
              $modalInstance.close(modifiedVariant);
            });
          };

          $scope.dismiss = function () {
            $modalInstance.dismiss('cancel');
          };

          $scope.validateFileInputs = function () {
            switch ($scope.variant.type) {
            case 'ios':
              return $scope.variant.certificates.length > 0;
            }
            return true;
          };
        }
      }).result;
    }
  };

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
      if (variant.protocolType === 'wns') {
        properties = properties.concat(['sid', 'clientSecret', 'protocolType']);
      } else {
        properties = properties.concat(['protocolType']);
      }
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
      properties = properties.concat(['clientId', 'clientSecret']);
      break;
    default:
      throw 'Unknown variant type ' + variant.type;
    }
    properties.forEach(function (property) {
      result[property] = variant[property];
    });
    return result;
  }

  function extractVariantType( variant ) {
    switch(variant.type) {
    case 'windows':
      return 'windows_' + variant.protocolType;
    default:
      return variant.type;
    }
  }

  return service;

});
