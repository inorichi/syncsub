// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

require('../src/app');

var mockWS = function(address) {
  this.send = function() { };
  this.onopen = function() { };
  this.onmessage = function() { };
  this.onclose = function() { };
  this.url = address;
}

describe("Test websocket methods", function() {

  debug = false;
  var WSService;
  var ws;

  beforeEach(function() {
    angular.mock.module('subs');

    inject(function(SocketConfig) {
      SocketConfig.socket = mockWS;
    });

    inject(function(WebSocketService) {
      WSService = WebSocketService;
      ws = WSService.ws;
    });
  });

  it("should define a websocket connection", function() {
    expect(WSService.ws).toBeDefined();
  });

  it("should have called send method with right content", function() {
    spyOn(ws, 'sendMessage');
    ws.sendMessage({'a':'b'});
    expect(ws.sendMessage).toHaveBeenCalledWith(
        jasmine.objectContaining({'a':'b'})
    );
  });

  it("should have called send method with wrong content", function() {
    spyOn(ws, 'sendMessage');
    ws.sendMessage({'a':'b'});
    expect(ws.sendMessage).not.toHaveBeenCalledWith(
        jasmine.objectContaining({'a':'c'})
    );
  });

  it("should be able to send raw data", function() {
    spyOn(ws, 'send');
    ws.send('some data');
    expect(ws.send).toHaveBeenCalled();
  });

  it("should have called put method with right content", function() {
    spyOn(WSService, 'put');
    WSService.put({'a':'b'});
    expect(WSService.put).toHaveBeenCalledWith(
        jasmine.objectContaining({'a':'b'})
    );
  });

  it("should have called put method with wrong content", function() {
    spyOn(WSService, 'put');
    WSService.put({'a':'b'});
    expect(WSService.put).not.toHaveBeenCalledWith(
        jasmine.objectContaining({'a':'c'})
    );
  });

  it("should have called put method and not create a call", function() {
    WSService.put({'a':'b'});
    expect(Object.keys(WSService.calls).length).toEqual(0);
  });

  it("should increment callId with every call", function() {
    expect(WSService.callId).toEqual(0);

    WSService.send('test', 'test', 'message');
    expect(WSService.callId).toEqual(1);
  });

  it("should contains a call", function() {
    expect(Object.keys(WSService.calls).length).toEqual(0);

    WSService.send('test', 'test', 'message');
    expect(Object.keys(WSService.calls).length).toEqual(1);
    expect(WSService.calls[1]).toBeDefined();
  });

  it("should delete calls from unresolved", function() {
    WSService.send('test', 'test', 'message');

    var response = {};
    response.data = JSON.stringify({'callId': WSService.callId, 'service': 'test'});
    ws.onmessage(response);

    expect(Object.keys(WSService.calls).length).toEqual(0);
  });

  it("should reject calls", function() {
    WSService.send('test', 'test', 'message');

    var response = {};
    response.data = JSON.stringify({'error': 'Unknown method', 'callId': WSService.callId, 'service': 'test'});

    var call = WSService.calls[WSService.callId];
    spyOn(call, 'reject');

    ws.onmessage(response);
    expect(call.reject).toHaveBeenCalled();
    expect(Object.keys(WSService.calls).length).toEqual(0);
  });

  it("should resolve calls", function() {
    WSService.send('test', 'test', 'message');

    var response = {};
    response.data = JSON.stringify({'callId': WSService.callId, 'service': 'test'});

    var call = WSService.calls[WSService.callId];
    spyOn(call, 'resolve');

    ws.onmessage(response);
    expect(call.resolve).toHaveBeenCalled();
    expect(Object.keys(WSService.calls).length).toEqual(0);
  });

  it("should resolve others' calls", inject(function($rootScope) {
    spyOn($rootScope, '$emit');
    var response = {};
    response.data = JSON.stringify({'service': 'test'});

    ws.onmessage(response);
    expect($rootScope.$emit).toHaveBeenCalled();
  }));

  it("should send an event when connected", inject(function($rootScope) {
    spyOn($rootScope, '$emit');

    ws.onopen();
    expect($rootScope.$emit).toHaveBeenCalled();
  }));

  it("should send an event when disconnected", inject(function($rootScope) {
    spyOn($rootScope, '$emit');

    ws.onclose();
    expect($rootScope.$emit).toHaveBeenCalled();
  }));

});

describe("Test WebSocketConfig", function() {
  beforeEach(function() {
    angular.mock.module('subs');
  });

  it("should change default hostname", function() {
    inject(function(SocketConfig) {
        SocketConfig.hostname='myverylonghostname.com';
        SocketConfig.socket = mockWS;
    });

    inject(function(WebSocketService) {
      expect(WebSocketService.ws.url).toContain('myverylonghostname.com');
    });
  });

  it("should change default port", function() {
    inject(function(SocketConfig) {
        SocketConfig.port = 65323;
        SocketConfig.socket = mockWS;
    });

    inject(function(WebSocketService) {
      expect(WebSocketService.ws.url).toContain(65323);
    });
  });

  it("should change default path", function() {
    inject(function(SocketConfig) {
        SocketConfig.path = 'pathToMyWs?room=';
        SocketConfig.socket = mockWS;
    });

    inject(function(WebSocketService) {
      expect(WebSocketService.ws.url).toContain('pathToMyWs?room=');
    });
  });

  it("should change default path", function() {
    inject(function(SocketConfig) {
        SocketConfig.room = 'myCoolRoom';
        SocketConfig.socket = mockWS;
    });

    inject(function(WebSocketService) {
      expect(WebSocketService.ws.url).toContain('myCoolRoom');
    });
  });

});
