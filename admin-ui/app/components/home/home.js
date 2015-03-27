angular.module('upsConsole')
  .controller('HomeController', function( $modal, applicationsEndpoint, $routeParams, $router, $rootScope, $timeout ) {

    var self = this;

    this.apps = [];
    this.totalItems = 0;

    this.activate = function() {
      console.log('activate: ' + $routeParams.page);
      console.log($router.root.navigating);
      self.fetchAppsPage($routeParams.page).then(function () {
        self.requestedPage = $routeParams.page;
      });
    };

    this.pageChanged = function ( page ) {
      console.log('page changed: ' + page);
      $router.root.navigate('/apps/' + page);
    };

    this.fetchAppsPage = function(page) {
      return applicationsEndpoint.fetch(page)
        .then(function( result ) {
          self.apps = result.apps;
          self.totalItems = result.totalItems;
        });
    };

    this.deleteApp = function() {
      $modal.open({
        templateUrl: 'views/dialogs/remove-app.html',
        controller: 'DefaultModalController'
      });
    };

  });

// on page change
//$rootScope.$watch(function() { return self.requestedPage }, function(newPage, oldPage) {
//  console.log('changed: ' + oldPage + ' -> ' + newPage);
//  if (newPage !== undefined) {
//    if (oldPage !== undefined) {
//      console.log('navigate: ' + newPage);
//      $router.root.navigate('/home/' + newPage);
//    }
//  }
//});

//$timeout(function() {
//  self.currentPage = $routeParams.page;
//  console.log('initializing to: ' + self.currentPage);
//});
