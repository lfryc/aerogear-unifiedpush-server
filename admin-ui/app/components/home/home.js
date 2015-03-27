angular.module('upsConsole')
  .controller('HomeController', function( $modal, applicationsEndpoint ) {

    var self = this;

    this.apps = [];

    this.activate = function() {
      self.fetchNewPage(1);
      this.currentPage = 1;
    };

    this.pageChanged = function(page) {
      self.fetchNewPage(page);
    };

    this.fetchNewPage = function(page) {
      return applicationsEndpoint.fetch(page)
        .then(function( result ) {
          self.apps = result.apps;
          self.totalItems = result.totalItems;
        });
    };

    this.deleteApp = function(app) {
      $modal.open({
        templateUrl: 'views/dialogs/remove-app.html',
        controller: function( $modalInstance, $scope ) {
          $scope.confirm = function() {
            applicationsEndpoint.delete({appId: app.pushApplicationID})
              .then(function () {
                return self.fetchNewPage(self.currentPage);
              })
              .then(function() {
                $modalInstance.close();
              })
          };
          $scope.dismiss = function() {
            $modalInstance.dismiss('cancel');
          }
        }
      });
    };

  });
