// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

module.exports = function(LineService) {
    return {
        link: function(scope, element) {
            element.bind('focus', function(ev) {
                element[0].currentIndex = element[0].selectedIndex;
            })

            element.bind('change', function(ev) {
                var selected = element.val();
                
                element[0].selectedIndex = element[0].currentIndex;

                LineService.requestChangeStyle(selected, scope.selected.line.id).then(function() {
                    element.val(selected);
                });
            });
        }
    };
};

