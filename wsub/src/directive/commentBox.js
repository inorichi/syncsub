// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

module.exports = function(LineService) {
    return {
        link: function(scope, element) {
            element.bind('click', function(ev) {
                ev.preventDefault();

                var preventedValue = scope.selected.line.comment ? 0 : 1;

                LineService.requestToggleComment(preventedValue, scope.selected.line.id).then(function() {
                    ev.target.checked = !ev.target.checked;
                });
            });
        }
    };
};

