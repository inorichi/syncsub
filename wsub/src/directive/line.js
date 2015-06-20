// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

module.exports = function(LineService) {
    return {
        link: function(scope, element) {
            // Event when the user clicks on a line
            element.bind('click', function() {
                LineService.requestLock(scope.line);
            });

            // Show a pointer when mouse is over a line
            element.bind('mouseover', function() {
                element.css('cursor', 'pointer');
            });
        }
    };
};

