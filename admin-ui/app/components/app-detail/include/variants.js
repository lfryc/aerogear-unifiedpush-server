angular.module('upsConsole')
  .controller('VariantsController', function ( $modal, variantModal, $scope, variantsEndpoint, Notifications ) {

    var self = this;

    this.app = $scope.$parent.$parent.appDetail.app;

    /* split the variant types to the groups so that they can be easily access */
    function splitByType( variants ) {
      return variants
        .sort(function(a, b) {
          return a.type.localeCompare(b.type);
        })
        .reduce(function(variantList, variant) {
          var type = variant.type.match(/^windows/) ? 'windows' : variant.type;
          var variantType = variantList[type] = variantList[type] || [];
          variantType.push(variant);
          variantType.$deviceCount = (variantType.$deviceCount  || 0) + (variant.$deviceCount || 0);
          variantType.$messageCount = (variantType.$messageCount  || 0) + (variant.$messageCount || 0);
          return variantList;
        }, {});
    }
    this.byType = splitByType( this.app.variants );

    this.add = function() {
      return variantModal.add( this.app )
        .then(function( variant ) {
          variant.$deviceCount = 0;
          variant.$messageCount = 0;
          self.app.variants.push( variant );
          self.byType = splitByType( self.app.variants );
          Notifications.success('Variant ' + variant.name + ' successfully created');
        })
        .catch(function() {
          Notifications.error('Failed to create variant ' + variant.name);
        });
    };

    this.edit = function( variant ) {
      var variantClone = angular.extend({}, variant);
      return variantModal.edit( this.app, variantClone )
        .then(function( updatedVariant ) {
          angular.extend(variant, updatedVariant);
          Notifications.success('Variant ' + variant.name + ' was successfully modified');
        })
        .catch(function( e ) {
          if ( e != 'cancel' ) {
            Notifications.error('Failed to modify variant ' + variant.name + ': ' + e);
          }
        });
    };

    this.editName = function( variant ) {
      var variantClone = angular.extend({}, variant);
      return variantModal.editName( self.app, variantClone )
        .then(function( updatedVariant ) {
          angular.extend(variant, updatedVariant);
          Notifications.success('The name of ' + variant.name + ' variant was successfully changed');
        })
        .catch(function(e) {
          if ( e !== 'cancel' ) {
            Notifications.error('Failed to modify variant ' + variant.name + ': ' + e);
          }
        });
    };

    this.delete = function( variant ) {
      $modal.open({
        templateUrl: 'dialogs/remove-variant.html',
        controller: function( $modalInstance, $scope ) {
          $scope.variant = variant;
          $scope.confirm = function() {
            variantsEndpoint.delete({
                  appId: self.app.pushApplicationID,
                  variantType: variant.type,
                  variantId: variant.variantID })
              .then(function () {
                self.app.variants = self.app.variants.filter(function( v ) {
                  return v != variant;
                });
                self.byType = splitByType( self.app.variants );
                $modalInstance.close();
              });
          };
          $scope.dismiss = function() {
            $modalInstance.dismiss('cancel');
          }
        }
      });
    };

    this.getWarningsForVariant = function( warnings, variant ) {
      return warnings.filter(function( warning ) {
        return warning.variant.variantID == variant.variantID;
      });
    }

  });
