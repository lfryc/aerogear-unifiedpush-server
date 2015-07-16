'use strict';

angular.module('upsConsole')
  .controller('RouteController', function($router) {
    $router.config([
      {path: '/',                     component: 'home'},
      {path: '/welcome',              component: 'welcome'},
      {path: '/bootstrap',              component: 'bootstrap'},
      {path: '/wizard/create-app',    component: 'wizard01CreateApp'},
      {path: '/wizard/add-variant',   component: 'wizard02AddVariant'},
      {path: '/wizard/register-device',  component: 'wizard03RegisterDevice'},
      {path: '/wizard/send-push-notification',  component: 'wizard04SendPushNotification'},
      {path: '/wizard/setup-sender',  component: 'wizard05SetupSender'},
      {path: '/wizard/done',          component: 'wizard06Done'},
      {path: '/app/:app/:tab',        component: 'appDetail'},
      {path: '/links-check',          component: 'linksCheck'},
    ]);
  });
