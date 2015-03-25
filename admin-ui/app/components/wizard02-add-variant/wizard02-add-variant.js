angular.module('upsConsole')
  .controller('Wizard02AddVariantController', function ( variantModal, $router ) {

    this.addVariant = function() {
      return variantModal.add()
        .then(function() {
          $router.root.navigate('/wizard/register-device');
        });
    }
  });
