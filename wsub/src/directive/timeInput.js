// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

module.exports = function(LineService) {
    return {
        link: function(scope, element, attrs) {
            element.bind('keydown', function(ev) {
                if (37 <= ev.keyCode && ev.keyCode <= 40)
                    return false;

                if (!(48 <= ev.keyCode && ev.keyCode <= 57)) { 
                    ev.preventDefault();
                    return false;
                }

                ev.preventDefault();

                var pos = element[0].selectionStart;
                if (pos == 10)
                    return false;

                var text = element.val();
                if (text[pos] == ':' || text[pos] == '.')
                    pos++;

                element.val(text.substr(0, pos) + String.fromCharCode(ev.keyCode) + text.substr(pos + 1));

                element[0].selectionStart = element[0].selectionEnd = pos + 1;
            })

            element.bind('blur', function(ev) {
                var pos = attrs['timeInput'];
                var oldTime = scope.selected.line[pos];
                var newTime = element.val();

                if (oldTime != newTime) {
                    LineService.requestUpdateTime(newTime, pos, scope.selected.line.id);
                }
            });
        }
    };
};

