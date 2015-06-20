// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

module.exports = function($scope, LineService) {
    $scope.lines = LineService.lines;
    $scope.selected = LineService.selected;

    $scope.menuOptions = [
        ['Add line before', function($itemScope) {
            LineService.requestAdd($itemScope.line.id, 'before')
        }],
        ['Add line after', function($itemScope) {
            LineService.requestAdd($itemScope.line.id, 'after')
        }],
        null,
        ['Delete line', function($itemScope) {
            LineService.requestDelete($itemScope.line.id)
        }]
    ]

};

