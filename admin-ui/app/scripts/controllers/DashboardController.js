/*
 * JBoss, Home of Professional Open Source
 * Copyright Red Hat, Inc., and individual contributors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * 	http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

angular.module('upsConsole').controller('DashboardController',
  function ($rootScope, $scope, dashboard, totals, warnings, topThree) {
    $rootScope.application = null;

    $scope.dashboardData = totals;
    $scope.warnings = warnings;
    $scope.topThree = topThree;
  });

angular.module('upsConsole').controller('ActivityController',
  function ($scope, $rootScope, $routeParams, $modal, metrics, pushApplication, breadcrumbs) {

    $scope.applicationId = $routeParams.applicationId;
    $scope.currentPage = 1;

    function forAllVariants(application, variantId, closure) {
      angular.forEach(application.variants, function (variant) {
        if (variant.variantID === variantId) {
          closure(variant);
        }
      });
    }

    $scope.onDetailsPage = function() {
      return typeof $routeParams.variantId !== 'undefined';
    };

    pushApplication.get({appId: $routeParams.applicationId}, function (application) {
      $rootScope.application = application;

      if (typeof $routeParams.variantId !== 'undefined') {
        forAllVariants(application, $routeParams.variantId, function (variant) {
          $rootScope.variant = variant;
        });
      }
      breadcrumbs.generateBreadcrumbs();
    });

    function fetchVariantsMetrics(pageNo) {
      metrics.variant({id: $routeParams.variantId, page: pageNo - 1, per_page: 10}, function (data, responseHeaders) {
        $scope.totalItems = responseHeaders('total');
        $scope.pushMetrics = data;
        angular.forEach(data, function (metric) {
          metric.totalReceivers = metric.variantInformations[0].receivers;
          metric.deliveryFailed = !metric.variantInformations[0].deliveryStatus;
        });
      });
    }

    function fetchApplicationMetrics(pageNo) {
      metrics.application({id: $routeParams.applicationId, page: pageNo - 1, per_page: 10}, function (data, responseHeaders) {
        $scope.totalItems = responseHeaders('total');
        $scope.pushMetrics = data;

        function totalReceivers(data) {
          angular.forEach(data, function (metric) {
            angular.forEach(metric.variantInformations, function (variant) {
              if (!variant.deliveryStatus) {
                metric.deliveryFailed = true;
              }
              if (!metric.totalReceivers) {
                metric.totalReceivers = 0;
              }
              metric.totalReceivers += variant.receivers;
            });
          });
        }

        totalReceivers(data);
      });
    }

    function fetch() {
      if ($scope.onDetailsPage()) {
        fetchVariantsMetrics($scope.currentPage);
      } else {
        fetchApplicationMetrics($scope.currentPage);
      }
    }

    $scope.pageChanged = function () {
      fetch();
    };

    fetch();
    $scope.variantMetricInformation = function(metrics) {
      angular.forEach(metrics, function(variantInfo) {
        forAllVariants($rootScope.application, variantInfo.variantID, function (variant) {
          variantInfo.name = variant.name;
        });
      });

      return metrics;
    };

    $scope.detailsPage = function() {
      return $scope.onDetailsPage();
    };

    $scope.expand = function (metric) {
      metric.expand = !metric.expand;
    };

    $scope.isCollapsed = function (metric) {
      return !metric.expand;
    };

    $scope.parse = function (metric) {
      try {
        return JSON.parse(metric.rawJsonMessage);
      } catch (err) {
        return {};
      }
    };

    $scope.showFullRequest = function (rawJsonMessage) {
      $modal.open({
        templateUrl: 'views/dialogs/request.html',
        controller: function ($scope, $modalInstance, request) {
          $scope.request = request;

          $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
          };
        },
        resolve: {
          request: function () {
            //nasty way to get formatted json
            return JSON.stringify(JSON.parse(rawJsonMessage), null, 4);
          }
        }
      });
    };

  });
