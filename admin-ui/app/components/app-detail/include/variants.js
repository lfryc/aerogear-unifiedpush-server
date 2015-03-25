angular.module('upsConsole')
  .controller('VariantsController', function ( variantModal ) {
    this.add = function() {
      return variantModal.add()
        .then(function() {
        });
    };

    this.toggled = false;
  });
