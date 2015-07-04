// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

var app = angular.module('subs');

debug = true;


app.factory('WebSocketService', require('./WebSocketService'));
app.factory('BaseService', require('./BaseService.js'));
app.factory('DataService', require('./DataService'));
app.factory('LineService', require('./LineService'));
app.factory('StyleService', require('./StyleService'));
app.factory('VideoService', require('./VideoService'));
app.factory('ImportService', require('./ImportService'));
