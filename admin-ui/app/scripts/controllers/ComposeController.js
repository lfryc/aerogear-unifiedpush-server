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

angular.module('upsConsole').controller('ComposeController', function($rootScope, $scope, $routeParams, $modal, $http, Notifications, messageSender) {

    /*
     * INITIALIZATION
     */
  $scope.variantSelection = [];
  $scope.criteria = [];

  $scope.sendMessage = function (testMessage) {
    var pushData = {'message': {'sound': 'default', 'alert': testMessage}};

    //let's check if we filter variants
    if($scope.variantSelection.length > 0) {
      pushData.variants = [];
      for(var variant in $scope.variantSelection) {
        pushData.variants.push($scope.variantSelection[variant].variantID);
      }
    }
    //let's check if we filer on aliases
    if($scope.criteria.alias) {
      pushData.alias = $scope.criteria.alias.split(',');
    }

    //let's check if we filter on deviceType
    if($scope.criteria.deviceType) {
      pushData.deviceType = $scope.criteria.deviceType.split(',');
    }

    //let's check if we filter on categories
    if($scope.criteria.categories) {
      pushData.categories = $scope.criteria.categories.split(',');
    }

    $http.defaults.headers.common.Authorization = 'Basic ' + btoa($rootScope.application.pushApplicationID +
      ':' + $rootScope.application.masterSecret);

    messageSender.send({}, pushData, function() {
      Notifications.success('Successfully sent Notification');
      $scope.testMessage = '';
    }, function() {
      Notifications.error('Something went wrong...', 'danger');
    });
  };

  $scope.changeVariant = function ( application ) {
    show( application, 'filter-variants.html' );
  };

  $scope.changeCriteria = function ( application ) {
    show( application, 'add-criteria.html' );
  };

  function modalController( $scope, $modalInstance, application, variantSelection, criteria ) {
    $scope.variantSelection = variantSelection;
    $scope.criteria = criteria;
    $scope.application = application;
    $scope.ok = function ( application ) {
      $modalInstance.close( application );
    };

    $scope.cancel = function () {
      $modalInstance.dismiss( 'cancel' );
    };

    $scope.toggleSelection = function toggleSelection( variant ) {
      var idx = $scope.variantSelection.indexOf( variant );

      // is currently selected
      if ( idx > -1 ) {
        $scope.variantSelection.splice( idx, 1 );
      }
      // is newly selected
      else {
        $scope.variantSelection.push( variant );
      }
    };
  }

  function show( application, template ) {
    return $modal.open( {
      templateUrl: 'views/dialogs/' + template,
      controller: modalController,
      resolve: {
        application: function () {
          return application;
        },
        variantSelection: function () {
          return $scope.variantSelection;
        },
        criteria: function () {
          return $scope.criteria;
        }
      }
    } );
  }

});

angular.module('upsConsole').controller('PreComposeController', function($rootScope, $scope, $location, applications) {
  if ($rootScope.application && !$scope.applicationChosen) {
    $location.path('/compose/' + $rootScope.application.pushApplicationID);
  }

  $scope.applications = applications;

  $scope.setApplication = function(application) {
    $rootScope.application = application;
    $scope.applicationChosen = !!application;
  };
});