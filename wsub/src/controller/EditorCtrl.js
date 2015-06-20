// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

module.exports = function($scope, LineService, StyleService) {
    $scope.styles = StyleService.styles;
    $scope.selected = LineService.selected;
    $scope.editor = document.getElementById('text-editor');
    $scope.start = document.getElementById('start-editor');
    $scope.end = document.getElementById('end-editor');
    $scope.styleSelect = document.getElementById('style-editor');
    $scope.comment = document.getElementById('comment-editor');

    $scope.hasSelection = function() {
        return $scope.selected.line != null;
    }

    $scope.$watch('selected.line', function(newValue) {
        if ($scope.selected.line != null) {
            $scope.editor.value = $scope.selected.line.txt;
            $scope.start.value = $scope.selected.line.start;
            $scope.end.value = $scope.selected.line.end;
            $scope.styleSelect.value = $scope.selected.line.style;
            $scope.comment.checked = $scope.selected.line.comment;
        }
    });

};

