// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

module.exports = function($q, $rootScope, SocketConfig) {
    var service = {};
    var calls = {};
    var currentCallId = 0;

    var hostname = window.location.hostname;
    var port = window.location.port;
    var path = 'ws?room=';
    var room = 'some-room';
    var socket = WebSocket;

    if (SocketConfig) {
        if (SocketConfig.hostname) hostname = SocketConfig.hostname;
        if (SocketConfig.port) port = SocketConfig.port;
        if (SocketConfig.path) path = SocketConfig.path;
        if (SocketConfig.room) room = SocketConfig.room;
        if (SocketConfig.socket) socket = SocketConfig.socket;
    }

    var address = 'ws://' + hostname + ':' + port + '/' + path + room;
    var ws = new socket(address);
    service.ws = ws;
    service.calls = calls;
    Object.defineProperty(service, "callId", { get: function(){ return currentCallId; } });

    // We don't need to send big numbers to the WS, so we just reset the callback id
    service.nextCallId = function() {
        if (currentCallId == 10000) {
            currentCallId = 0;
        }
        return ++currentCallId;
    }
    
    // Emit an event when a connection to the WS is made
    ws.onopen = function() {
        if (debug) console.debug('CONNECTED TO WS');
        $rootScope.$emit('connected');
    }

    // Emit an event when the connection from the WS is closed
    ws.onclose = function() {
        if (debug) console.debug('DISCONNECTED FROM WS');
        $rootScope.$emit('disconnected');
    }

    ws.sendMessage = function(message) {
        ws.send(JSON.stringify(message));
    }

    // If the response contains a callbackId, resolve it
    // If not, emit an event with the service name containing the data received
    ws.onmessage = function(response) {
        if (debug) console.debug('Received from WS: ' + response.data);
        var data = JSON.parse(response.data);
        if ('callId' in data) {
            var call = calls[data.callId];
            if (!('error' in data)) { 
                $rootScope.$apply(call.resolve(call.request));
            } else {
                $rootScope.$apply(call.reject(call.request));
            }
            delete calls[data.callId];
        } else {
            $rootScope.$apply($rootScope.$emit(data['service'], data))
        }
    }

    // Send data with a callback id. With this callback we can resolve or reject
    // promises so that we can refresh the UI when we get a callback, for example
    //
    // @param {Object} name Service name who called this method
    // @param {Object} request A dict containing the data to send
    service.send = function(serviceName, action, content) {
        var q = $q.defer();
        var callId = service.nextCallId();
        var request = {
            'service': serviceName,
            'action': action,
            'content': content,
            'callId': callId
        };
        calls[callId] = {
            'resolve': q.resolve,
            'reject': q.reject,
            'request': request
        };

        if (debug) console.debug('Sending request: ' + JSON.stringify(request));
        ws.sendMessage(request);
        return q.promise;
    }

    // Send data without a callback id. Useful when we don't need a promise and
    // want to do something based on the response from the WS
    //
    // @param {Object} service Service who called this method
    // @param {Object} request A dict containing the data to send
    service.put = function(serviceName, action, content) {
        var request = {
            'service': serviceName,
            'action': action,
            'content': content
        }
        if (debug) console.debug('Sending request without callback: ' + JSON.stringify(request));
        ws.sendMessage(request);
    } 

    return service;
};

