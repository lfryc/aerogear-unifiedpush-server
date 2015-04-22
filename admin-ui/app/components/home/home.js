angular.module('upsConsole')
  .controller('HomeController', function( $q, $modal, $router, applicationsEndpoint, dashboardEndpoint ) {

    var self = this;

    this.apps = [];
    this.stats = {};
    this.topNotifications = [];

    this.canActivate = function() {
      this.currentPage = 1;
      return self.fetchNewPage(1)
        .then(function() {
          if (self.totalItems < 1) {
            $router.parent.navigate('/welcome');
            return false;
          }
        });
    };

    this.activate = function() {
      return $q.all([
        dashboardEndpoint.totals()
          .then(function( data ) {
            self.stats = data;
          }),
        dashboardEndpoint.latestActiveApps()
          .then(function( data ) {
            self.topNotifications = data;
          })
      ]);
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
          $scope.app = app;
          $scope.confirm = function() {
            applicationsEndpoint.delete({appId: app.pushApplicationID})
              .then(function () {
                return self.fetchNewPage(self.currentPage);
              })
              .then(function() {
                $modalInstance.close();
                if (self.totalItems < 1) {
                  $router.parent.navigate('/welcome');
                }
              });
          };
          $scope.dismiss = function() {
            $modalInstance.dismiss('cancel');
          }
        }
      });
    };

  });
