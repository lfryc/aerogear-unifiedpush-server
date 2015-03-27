angular.module('upsConsole')
  .controller('VariantsController', function ( $modal, variantModal, $scope, variantsEndpoint ) {

    var self = this;

    this.app = $scope.$parent.$parent.appDetail.app;

    this.typeEnum = {
      android:      { name: 'Android',    snippets: ['android', 'cordova'] },
      ios:          { name: 'iOS',        snippets: ['objc', 'swift']},
      windows:      { name: 'Windows',    snippets: ['wns', 'mpns', 'cordova'] },
      simplePush:   { name: 'SimplePush', snippets: ['cordova'] },
      adm:          { name: 'ADM',        snippets: ['cordova'] }
    };

    /* split the variant types to the groups so that they can be easily access */
    function splitByType( variants ) {
      return variants
        .sort(function(a, b) {
          return a.type.localeCompare(b.type);
        })
        .reduce(function(result, variant) {
          result[variant.type] = result[variant.type] || [];
          result[variant.type].push(variant);
          return result;
        }, {});
    }
    this.byType = splitByType( this.app.variants );

    this.add = function() {
      return variantModal.add( this.app )
        .then(function( variant ) {
          self.app.variants.push( variant );
          self.byType = splitByType( self.app.variants );
        });
    };

    this.delete = function( variant ) {
      $modal.open({
        templateUrl: 'views/dialogs/remove-variant.html',
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

  });
