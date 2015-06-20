// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

var app = angular.module('subs');

app.directive('ngLine', require('./line'));
app.directive('ngText', require('./text'));
app.directive('timeInput', require('./timeInput'));
app.directive('selectStyle', require('./selectStyle'));
app.directive('commentBox', require('./commentBox'));
app.directive('video', require('./video'));
app.directive('openFile', require('./openFile'));
app.directive('ngContextMenu', require('./contextMenu'));
