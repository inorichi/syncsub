// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

module.exports = function($scope, StyleService) {
    $scope.styles = StyleService.styles;
    $scope.selected = { item: null }
    $scope.savedState = null;

    $scope.encodings = [
        {value: 0, label: '0 - ANSI'},
        {value: 1, label: '1 - Predeterminado'}
    ]

    $scope.$watch('selected.item', function() {
        if ($scope.selected.item !== null) {
            $scope.savedState = angular.copy($scope.selected.item);
        }
    });

    $scope.changeStyle = function(newStyle) {
        if ($scope.savedState === null ||
            angular.equals($scope.savedState, $scope.selected.item)) {
                $scope.selected.item = angular.copy(newStyle);
        } else {
            alert('There are pending changes!')
        }
    }

    $scope.reset = function(form) {
        angular.copy($scope.savedState, $scope.selected.item);
        form.$setPristine();
    };

    $scope.save = function(form) {
        StyleService.requestUpdate($scope.savedState.name, $scope.selected.item).then(function() {
            $scope.savedState = angular.copy($scope.selected.item);
            form.$setPristine();
        });
    };

};

