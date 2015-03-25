angular.module('upsConsole.appDetail', [])
  .controller('AppDetailController', function($routeParams) {

    this.tab = $routeParams.tab;

    this.app = {
      id: $routeParams.app
    };

  });
