// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

module.exports = function() {
/*    return {
        link: function (scope, element, attrs) {
            element.bind('change', function() {
                var onChangeFunc = scope[attrs.onFile];
                onChangeFunc(element[0]);
            });
        }
    };
};
*/
    return {
        link: function (scope, element, attrs) {
            element.bind('click', function() {
                var inpFile = document.createElement('input');
                angular.element(inpFile).bind('change', function() {
                    console.log("FILE SELECTED")
                    var callbackFn = scope[attrs.callback];
                    callbackFn(inpFile);
                });

                inpFile.type = 'file';
                if ('accept' in attrs) {
                    inpFile.accept = attrs['accept'];
                }
                inpFile.click();
            });
        }
    };
};
