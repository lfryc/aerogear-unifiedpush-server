'use strict';

var upsServices = angular.module('upsConsole.services');

upsServices.factory('variantsEndpoint', function ($resource) {
  var resource = $resource('rest/applications/:appId/:variantType/:variantId/:verb', {
    appId: '@appId',
    variantType: '@variantType',
    variantId: '@variantId'
  }, {
    get: {
      method: 'GET'
    },
    query: {method: 'GET', isArray: true},
    create: {
      method: 'POST'
    },
    update: {
      method: 'PUT'
    },
    delete: {
      method: 'DELETE'
    },
    patch: {
      method: 'PATCH'
    },
    createWithFormData: {
      method: 'POST',
      headers: {'Content-Type': undefined},
      withCredentials: true,
      transformRequest: angular.identity
    },
    updateWithFormData: {
      method: 'PUT',
      headers: {'Content-Type': undefined},
      withCredentials: true,
      transformRequest: angular.identity
    },
    reset: {
      method: 'PUT',
      params: {verb: 'reset'}
    }
  });

  return {
    create: function() {
      return resource.create.apply(resource, arguments).$promise;
    }
  }
});
