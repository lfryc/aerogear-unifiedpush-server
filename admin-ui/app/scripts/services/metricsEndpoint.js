'use strict';

var upsServices = angular.module('upsConsole.services');

upsServices.factory('metricsEndpoint', function ($resource, $q) {
  return $resource('rest/metrics/messages/:verb/:id', { id: '@id' }, {
    application: {
      method: 'GET',
      isArray: true,
      params: {
        verb: 'application'
      }
    },
    variant: {
      method: 'GET',
      isArray: true,
      params: {
        verb: 'variant'
      }
    },
    fetchVariantMetrics: function(variantId, pageNo) {
      var deferred = $q.defer();
      this.variant({id: variantId, page: pageNo - 1, per_page: 10, sort:'desc'}, function (data, responseHeaders) {
        angular.forEach(data, function (metric) {
          metric.totalReceivers = metric.variantInformations[0].receivers;
          metric.deliveryFailed = !metric.variantInformations[0].deliveryStatus;
        });
        deferred.resolve({
          totalItems: responseHeaders('total'),
          pushMetrics: data
        });
      });
      return deferred.promise;
    },
    fetchApplicationMetrics: function(applicationId, pageNo) {
      var deferred = $q.defer();
      this.application({id: applicationId, page: pageNo - 1, per_page: 10, sort:'desc'}, function (data, responseHeaders) {
        angular.forEach(data, function (metric) {
          angular.forEach(metric.variantInformations, function (variant) {
            if (!variant.deliveryStatus) {
              metric.deliveryFailed = true;
            }
          });
        });
        deferred.resolve({
          totalItems: responseHeaders('total'),
          pushMetrics: data
        });
      });
      return deferred.promise;
    }
  });
});
