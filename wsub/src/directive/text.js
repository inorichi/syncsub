// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

module.exports = function(LineService) {
    return {
        link: function(scope, element) {
            element.bind('input', function() {
                var txt = element.val();
                LineService.requestUpdate(txt, scope.selected.line.id);
            });
        }
    };
};
