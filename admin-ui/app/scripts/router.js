angular.module('upsConsole')
  .controller('AppController', function($router) {
    $router.config([

      {path: '/apps/:page',                   component: 'home'},
      {path: '/create-app-welcome', component: 'createAppWelcome'},
      {path: '/wizard/create-app',  component: 'wizard01CreateApp'},
      {path: '/wizard/add-variant',  component: 'wizard02AddVariant'},
      {path: '/wizard/register-device',  component: 'wizard03RegisterDevice'},
      {path: '/wizard/send-push-notification',  component: 'wizard04SendPushNotification'},
      {path: '/wizard/setup-sender',  component: 'wizard05SetupSender'},
      {path: '/wizard/setup-sender',  component: 'wizard06Done'},
      {path: '/wizard/setup-sender',  component: 'wizard06Done'},
      {path: '/app/:app/:tab',  component: 'appDetail'},
      {path: '/',                   redirectTo: '/apps/1'},
    ]);
  });
