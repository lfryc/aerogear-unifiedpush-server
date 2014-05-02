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

function DetailController($rootScope, $scope, $routeParams, $window, $modal, pushApplication, variants) {

    /*
     * INITIALIZATION
     */
    onLoginDone($rootScope, $scope, function() {
        pushApplication.get({appId: $routeParams.applicationId}, function(application) {
            $scope.application = application;
            var href = $window.location.href;
            $scope.currentLocation = href.substring(0, href.indexOf('#'));
        });
    });


    /*
     * PUBLIC METHODS
     */

    $scope.expand = function(variant) {
        variant.expand = !variant.expand;
    };

    $scope.isCollapsed = function(variant) {
        return !variant.expand;
    };

    $scope.addVariant = function (variant) {
        var modalInstance = show(variant, 'create-variant.html');
        modalInstance.result.then(function (result) {
            var variant = result.variant;
            var params = $.extend({}, {
                appId: $scope.application.pushApplicationID,
                variantType: result.variantType
            });

            variants.create(params, variant, function(newVariant) {
                console.log('success');
            }, function() {
                console.log('fail');
            });
        });
    };

//    $scope.editVariant = function(application) {
//        var modalInstance = show(application, 'create-app.html');
//        modalInstance.result.then(function (application) {
//            pushApplication.update({appId:application.pushApplicationID}, application, function() {
//                createAlert("Successfully edited application \"" + application.name + "\"");
//            });
//        });
//    };

    $scope.removeVariant = function(variant, variantType) {
        var modalInstance = show(variant, 'remove-variant.html');
        modalInstance.result.then(function (result) {
            var params = $.extend({}, {
                appId: $scope.application.pushApplicationID,
                variantType: variantType,
                variantId: result.variant.variantID
            });
            variants.remove(params, function() {
                $scope.$evalAsync(function() {
                var osVariants = $scope.application[variantType + 'Variants'];
                osVariants.splice(osVariants.indexOf(variant), 1);
                    $scope.$digest();
                });
            });
        });
    };

    /*
     * PRIVATE FUNCTIONS
     */

    function modalController($scope, $modalInstance, variant) {
        $scope.variant = variant;
        $scope.variantType = null;
        $scope.ok = function (variant, variantType) {
            $modalInstance.close({
                variant: variant,
                variantType: variantType
            });
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    }

    function show(variant, template) {
        return $modal.open({
            templateUrl: 'views/dialogs/' + template,
            controller: modalController,
            resolve: {
                variant: function () {
                    return variant;
                }
            }
        });
    }

//    function createAlert(msg, type) {
//        $scope.alerts.push({type: type || 'success', msg: msg});
//        setTimeout(function () {
//            $scope.alerts.splice(0, 1);
//            $scope.$apply();
//        }, 4000)
//    }

}
