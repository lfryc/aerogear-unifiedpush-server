angular.module('upsConsole')
  .config(function( $provide ) {

    /**
     * Decorator for $resource service which helps to maintain conciseness of the code by avoiding a need to call resource.method(...).$promise.then(...),
     * because it returns a promise directly: resource.method(...).then(...).
     */
    $provide.decorator('$resource', function($delegate) {
      return function decorator(url, paramDefaults, actions) {
        var wrappedResource = {};
        var originalActions = {};
        var actionsWithoutFunctions = {};
        Object.keys(actions).forEach(function( methodName ) {
          var method = actions[methodName];
          originalActions[methodName] = method;
          if (!angular.isFunction(method)) {
            actionsWithoutFunctions[methodName] = method;
          }
        });
        arguments[2] = actionsWithoutFunctions;
        var originalResource = $delegate.apply($delegate, arguments);
        Object.keys(originalActions).forEach(function( methodName ) {
          var method = originalActions[methodName];
          if (angular.isFunction(method)) {
            wrappedResource[methodName] = method;
          } else {
            wrappedResource[methodName] = function() {
              //if (angular.isFunction(method)) {
                // if we defined a function as action then call it directly
                //return originalResource[methodName].apply(originalResource, arguments);
              //} else {
                // return promise instead of resource so we can call .then/.catch on the return value
                return originalResource[methodName].apply(originalResource, arguments).$promise;
              //}
            }
          }
        });
        return wrappedResource;
      }
    });
  });

