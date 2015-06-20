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

var styles = [
    {"outline": 2.0, "bold": 0, "margin_right": 10, "encoding": 1, "back_color": "000000FF",
     "angle": 0.0, "alignment": 2, "shadow": 0.0, "spacing": 0.0, "strike_out": 0, "size": 40.0,
     "italic": 0, "outline_color": "000000FF", "secondary_color": "FF0000FF", "margin_left": 10,
     "primary_color": "FFFFFFFF", "scale_x": 100.0, "margin_vertical": 10, "name": "Default",
     "underline": 0, "border_style": 1, "font": "Arial", "scale_y": 100.0, "margin_left": 10},
    {"outline": 2.0, "bold": 0, "margin_right": 10, "encoding": 1, "back_color": "000000FF",
     "angle": 0.0, "alignment": 2, "shadow": 0.0, "spacing": 0.0, "strike_out": 0, "size": 40.0,
     "italic": 0, "outline_color": "000000FF", "secondary_color": "FF0000FF", "margin_left": 10,
     "primary_color": "FFFFFFFF", "scale_x": 100.0, "margin_vertical": 10, "name": "Test", 
     "underline": 0, "border_style": 1, "font": "Arial", "scale_y": 100.0, "margin_left": 10},
    {"outline": 2.0, "bold": 0, "margin_right": 10, "encoding": 1, "back_color": "000000FF",
     "angle": 0.0, "alignment": 2, "shadow": 0.0, "spacing": 0.0, "strike_out": 0, "size": 40.0,
     "italic": 0, "outline_color": "000000FF", "secondary_color": "FF0000FF", "margin_left": 10,
     "primary_color": "FFFFFFFF", "scale_x": 100.0, "margin_vertical": 10, "name": "Test2", 
     "underline": 0, "border_style": 1, "font": "Arial", "scale_y": 100.0, "margin_left": 10},
    {"outline": 2.0, "bold": 0, "margin_right": 10, "encoding": 1, "back_color": "000000FF",
     "angle": 0.0, "alignment": 2, "shadow": 0.0, "spacing": 0.0, "strike_out": 0, "size": 40.0,
     "italic": 0, "outline_color": "000000FF", "secondary_color": "FF0000FF", "margin_left": 10,
     "primary_color": "FFFFFFFF", "scale_x": 100.0, "margin_vertical": 10, "name": "Test3", 
     "underline": 0, "border_style": 1, "font": "Arial", "scale_y": 100.0, "margin_left": 10},
    {"outline": 2.0, "bold": 0, "margin_right": 10, "encoding": 1, "back_color": "000000FF",
     "angle": 0.0, "alignment": 2, "shadow": 0.0, "spacing": 0.0, "strike_out": 0, "size": 40.0,
     "italic": 0, "outline_color": "000000FF", "secondary_color": "FF0000FF", "margin_left": 10,
     "primary_color": "FFFFFFFF", "scale_x": 100.0, "margin_vertical": 10, "name": "Test4", 
     "underline": 0, "border_style": 1, "font": "Arial", "scale_y": 100.0, "margin_left": 10}
]

var lines = [
    {'id': 4, 'txt': 'prueba4', 'start': '0:00:04.00', 'end': '0:00:05.00', 'style': 'Default', 'comment': 0},
    {'id': 2, 'txt': 'prueba2', 'start': '0:00:02.00', 'end': '0:00:03.00', 'style': 'Default', 'comment': 0},
    {'id': 9, 'txt': 'prueba9', 'start': '0:00:02.00', 'end': '0:00:03.00', 'style': 'Default', 'comment': 1},
    {'id': 7, 'txt': 'prueba7', 'start': '0:00:06.00', 'end': '0:00:07.00', 'style': 'Test', 'comment': 0},
    {'id': 5, 'txt': 'prueba5', 'start': '0:00:06.00', 'end': '0:00:07.00', 'style': 'Default', 'comment': 1},
    {'id': 3, 'txt': 'prueba3', 'start': '0:00:08.00', 'end': '0:00:09.00', 'style': 'Default', 'comment': 0},
    {'id': 1, 'txt': 'prueba1', 'start': '0:00:00.00', 'end': '0:00:01.00', 'style': 'Default', 'comment': 0},
]

describe("Test StyleService", function() {

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
      spyOn(ws, 'sendMessage');
    });
  });

  it("should send data", inject(function(StyleService) {
    StyleService.sendToWs('some_action', {'asd': 123});

    expect(ws.sendMessage).toHaveBeenCalledWith(
        jasmine.objectContaining({
          'service': StyleService.name,
          'action': 'some_action',
          'content': {'asd': 123},
          'callId': jasmine.any(Number)
        })
    );

    expect(WSService.calls[WSService.callId]).toBeDefined();
  }));

  it("should resolve calls", inject(function(StyleService) {
    StyleService.sendToWs('some_action', {'asd': 123});

    var response = {};
    response.data = JSON.stringify({'callId': WSService.callId, 'service': StyleService.name});

    var call = WSService.calls[WSService.callId];
    spyOn(call, 'resolve');

    ws.onmessage(response);
    expect(call.resolve).toHaveBeenCalled();
  }));

  it("should reject calls", inject(function(StyleService) {
    StyleService.sendToWs('some_action', {'asd': 123});

    var response = {};
    response.data = JSON.stringify({'error': 'some_error', 'callId': WSService.callId, 'service': StyleService.name});

    var call = WSService.calls[WSService.callId];
    spyOn(call, 'reject');

    ws.onmessage(response);
    expect(call.reject).toHaveBeenCalled();
  }));

  it("should request init when connected", inject(function(StyleService) {
    spyOn(StyleService, 'requestInit');

    ws.onopen();
    expect(StyleService.requestInit).toHaveBeenCalled();
  }));

  var initStyles = inject(function(StyleService) {
    ws.onopen();

    // Add styles to the response
    var data = ws.sendMessage.calls.mostRecent().args[0];
    data.content = styles;
    ws.onmessage({data: JSON.stringify(data)});
  });

  it("should add styles when init", inject(function(StyleService) {
    initStyles.call();
    expect(StyleService.styles.length).toBe(styles.length);
  }));

  it("should update a style", inject(function(StyleService) {
    initStyles();
    var style = StyleService.styles[0];
    var newStyle = angular.copy(style);
    newStyle.font = 'Roboto';
    expect(style.font).not.toEqual('Roboto');

    StyleService.requestUpdate(style.name, newStyle);

    var response = {};
    response.data = JSON.stringify({'callId': WSService.callId, 'service': StyleService.name, 'action': 'update'});
    ws.onmessage(response);

    expect(StyleService.styles[0].font).toEqual('Roboto');
  }));

  it("should rename a style", inject(function(StyleService) {
    initStyles();
    var style = StyleService.styles[0];
    var newStyle = angular.copy(style);
    newStyle.name = 'Cat';
    expect(style.name).not.toEqual('Cat');

    StyleService.requestUpdate(style.name, newStyle);

    var response = {};
    response.data = JSON.stringify({'callId': WSService.callId, 'service': StyleService.name, 'action': 'rename'});
    ws.onmessage(response);

    expect(StyleService.styles[0].name).toEqual('Cat');
  }));

  it("should apply new style to lines after renaming a style", inject(function(LineService, StyleService) {
    initStyles();

    var style = StyleService.styles[0];
    var newStyle = angular.copy(style);
    var oldName = styles[0].name;
    newStyle.name = 'Cat';

    // Init lines
    var data = {'action': 'init', 'service': LineService.name};
    data.content = lines;
    ws.onmessage({data: JSON.stringify(data)});   
    expect(_.some(LineService.lines, 'style', oldName)).toBe(true);

    StyleService.requestUpdate(oldName, newStyle);

    var response = {};
    response.data = JSON.stringify({'callId': WSService.callId, 'service': StyleService.name, 'action': 'rename'});
    ws.onmessage(response);

    expect(_.some(LineService.lines, 'style', oldName)).toBe(false);
  }));

  it("should not affect other styles when renaming", inject(function(LineService, StyleService) {
    initStyles();

    var style = StyleService.styles[0];
    var newStyle = angular.copy(style);
    var oldName = styles[0].name;
    newStyle.name = 'Cat';

    // Init lines
    var data = {'action': 'init', 'service': LineService.name};
    data.content = lines;
    ws.onmessage({data: JSON.stringify(data)});   
    expect(_.some(LineService.lines, 'style', oldName)).toBe(true);

    StyleService.requestUpdate(oldName, newStyle);

    var response = {};
    response.data = JSON.stringify({'callId': WSService.callId, 'service': StyleService.name, 'action': 'rename'});
    ws.onmessage(response);

    expect(_.every(LineService.lines, 'style', newStyle.name)).toBe(false);
  }));

  it("should create a new style", inject(function(StyleService) {
    initStyles();

    var style = StyleService.styles[0];

    // The style should be created in the backend, this is just for testing
    var newStyle = angular.copy(style);
    newStyle.name = 'Dog';

    StyleService.requestAdd(newStyle.name);

    var response = {};
    var content = {'style': newStyle};
    response.data = JSON.stringify({'service': StyleService.name, 'action': 'add', 'content': content});
    ws.onmessage(response);

    expect(StyleService.styles.length).toEqual(styles.length + 1);
  }));

  it("should delete a style", inject(function(StyleService) {
    initStyles();

    var style = StyleService.styles[0];

    StyleService.requestDelete(style.name);

    var response = {};
    response.data = JSON.stringify({'callId': WSService.callId, 'service': StyleService.name, 'action': 'delete'});
    ws.onmessage(response);

    expect(StyleService.styles.length).toEqual(styles.length - 1);
  }));

  it("should move a style below (from the mid)", inject(function(StyleService) {
    initStyles();
    
    var pos = 2;
    var expectedPos = 3;
    var style = StyleService.styles[pos];

    StyleService.requestMove(style.name, 'below');

    var response = {};
    response.data = JSON.stringify({'callId': WSService.callId, 'service': StyleService.name, 'action': 'move'});
    ws.onmessage(response);

    expect(StyleService.styles[expectedPos].name).toEqual(style.name);
  }));

  it("should move a style above (from the mid)", inject(function(StyleService) {
    initStyles();
    
    var pos = 2;
    var expectedPos = 1;
    var style = StyleService.styles[pos];

    StyleService.requestMove(style.name, 'above');

    var response = {};
    response.data = JSON.stringify({'callId': WSService.callId, 'service': StyleService.name, 'action': 'move'});
    ws.onmessage(response);

    expect(StyleService.styles[expectedPos].name).toEqual(style.name);
  }));

  it("should move a style below (from the beginning)", inject(function(StyleService) {
    initStyles();
    
    var pos = 0;
    var expectedPos = 1;
    var style = StyleService.styles[pos];

    StyleService.requestMove(style.name, 'below');

    var response = {};
    response.data = JSON.stringify({'callId': WSService.callId, 'service': StyleService.name, 'action': 'move'});
    ws.onmessage(response);

    expect(StyleService.styles[expectedPos].name).toEqual(style.name);
  }));

  it("should move a style above (from the beginning)", inject(function(StyleService) {
    initStyles();
    
    var pos = 0;
    var expectedPos = 0;
    var style = StyleService.styles[pos];

    StyleService.requestMove(style.name, 'above');

    var response = {};
    response.data = JSON.stringify({'callId': WSService.callId, 'service': StyleService.name, 'action': 'move'});
    ws.onmessage(response);

    expect(StyleService.styles[expectedPos].name).toEqual(style.name);
  }));

  it("should move a style below (from the end)", inject(function(StyleService) {
    initStyles();
    
    var pos = StyleService.styles.length - 1;
    var expectedPos = pos;
    var style = StyleService.styles[pos];

    StyleService.requestMove(style.name, 'below');

    var response = {};
    response.data = JSON.stringify({'callId': WSService.callId, 'service': StyleService.name, 'action': 'move'});
    ws.onmessage(response);

    expect(StyleService.styles[expectedPos].name).toEqual(style.name);
  }));

  it("should move a style above (from the end)", inject(function(StyleService) {
    initStyles();
    
    var pos = StyleService.styles.length - 1;
    var expectedPos = pos - 1;
    var style = StyleService.styles[pos];

    StyleService.requestMove(style.name, 'above');

    var response = {};
    response.data = JSON.stringify({'callId': WSService.callId, 'service': StyleService.name, 'action': 'move'});
    ws.onmessage(response);

    expect(StyleService.styles[expectedPos].name).toEqual(style.name);
  }));

  it("should move a style to the beginning", inject(function(StyleService) {
    initStyles();
    
    var pos = 2;
    var expectedPos = 0;
    var style = StyleService.styles[pos];

    StyleService.requestMove(style.name, 'first');

    var response = {};
    response.data = JSON.stringify({'callId': WSService.callId, 'service': StyleService.name, 'action': 'move'});
    ws.onmessage(response);

    expect(StyleService.styles[expectedPos].name).toEqual(style.name);
  }));

  it("should move a style to the end", inject(function(StyleService) {
    initStyles();
    
    var pos = 2;
    var expectedPos = StyleService.styles.length - 1;
    var style = StyleService.styles[pos];

    StyleService.requestMove(style.name, 'last');

    var response = {};
    response.data = JSON.stringify({'callId': WSService.callId, 'service': StyleService.name, 'action': 'move'});
    ws.onmessage(response);

    expect(StyleService.styles[expectedPos].name).toEqual(style.name);
  }));

  it("shouldn't move a style to the beginning if it's the first", inject(function(StyleService) {
    initStyles();
    
    var pos = 0;
    var expectedPos = pos;
    var style = StyleService.styles[pos];

    StyleService.requestMove(style.name, 'first');

    var response = {};
    response.data = JSON.stringify({'callId': WSService.callId, 'service': StyleService.name, 'action': 'move'});
    ws.onmessage(response);

    expect(StyleService.styles[expectedPos].name).toEqual(style.name);
  }));

  it("shouldn't move a style to the end if it's the last", inject(function(StyleService) {
    initStyles();
    
    var pos = StyleService.styles.length - 1;;
    var expectedPos = pos;
    var style = StyleService.styles[pos];

    StyleService.requestMove(style.name, 'last');

    var response = {};
    response.data = JSON.stringify({'callId': WSService.callId, 'service': StyleService.name, 'action': 'move'});
    ws.onmessage(response);

    expect(StyleService.styles[expectedPos].name).toEqual(style.name);
  }));

  it("should update a style (I didn't request)", inject(function(StyleService) {
    initStyles();
    var style = StyleService.styles[0];
    var newStyle = angular.copy(style);
    newStyle.font = 'Roboto';
    expect(style.font).not.toEqual('Roboto');

    var response = {};
    var content = {'name': style.name, 'style': newStyle};
    response.data = JSON.stringify({'content': content, 'service': StyleService.name, 'action': 'update'});
    ws.onmessage(response);

    expect(StyleService.styles[0].font).toEqual('Roboto');
  }));

  it("should rename a style (I didn't request)", inject(function(StyleService) {
    initStyles();
    var style = StyleService.styles[0];
    var newStyle = angular.copy(style);
    newStyle.name = 'Cat';
    expect(style.name).not.toEqual('Cat');

    var response = {};
    var content = {'name': style.name, 'style': newStyle};
    response.data = JSON.stringify({'content': content, 'service': StyleService.name, 'action': 'rename'});
    ws.onmessage(response);

    expect(StyleService.styles[0].name).toEqual('Cat');
  }));

  it("should apply new style to lines after renaming a style (I didn't request)", inject(function(LineService, StyleService) {
    initStyles();

    var style = StyleService.styles[0];
    var newStyle = angular.copy(style);
    var oldName = styles[0].name;
    newStyle.name = 'Cat';

    // Init lines
    var data = {'action': 'init', 'service': LineService.name};
    data.content = lines;
    ws.onmessage({data: JSON.stringify(data)});   
    expect(_.some(LineService.lines, 'style', oldName)).toBe(true);

    var response = {};
    var content = {'name': style.name, 'style': newStyle};
    response.data = JSON.stringify({'content': content, 'service': StyleService.name, 'action': 'rename'});
    ws.onmessage(response);

    expect(_.some(LineService.lines, 'style', oldName)).toBe(false);
  }));

  it("should not affect other styles when renaming (I didn't request)", inject(function(LineService, StyleService) {
    initStyles();

    var style = StyleService.styles[0];
    var newStyle = angular.copy(style);
    var oldName = styles[0].name;
    newStyle.name = 'Cat';

    // Init lines
    var data = {'action': 'init', 'service': LineService.name};
    data.content = lines;
    ws.onmessage({data: JSON.stringify(data)});   
    expect(_.some(LineService.lines, 'style', oldName)).toBe(true);

    var response = {};
    var content = {'name': style.name, 'style': newStyle};
    response.data = JSON.stringify({'content': content, 'service': StyleService.name, 'action': 'rename'});
    ws.onmessage(response);

    expect(_.every(LineService.lines, 'style', newStyle.name)).toBe(false);
  }));

  it("should delete a style (I didn't request)", inject(function(StyleService) {
    initStyles();

    var style = StyleService.styles[0];

    var response = {};
    var content = {'name': style.name};
    response.data = JSON.stringify({'content': content, 'service': StyleService.name, 'action': 'delete'});
    ws.onmessage(response);

    expect(StyleService.styles.length).toEqual(styles.length - 1);
  }));

  it("should move a style below (from the mid) (I didn't request)", inject(function(StyleService) {
    initStyles();
    
    var pos = 2;
    var expectedPos = 3;
    var style = StyleService.styles[pos];

    var response = {};
    var content = {'name': style.name, 'pos': 'below'};
    response.data = JSON.stringify({'content': content, 'service': StyleService.name, 'action': 'move'});
    ws.onmessage(response);

    expect(StyleService.styles[expectedPos].name).toEqual(style.name);
  }));

  it("should move a style above (from the mid) (I didn't request)", inject(function(StyleService) {
    initStyles();
    
    var pos = 2;
    var expectedPos = 1;
    var style = StyleService.styles[pos];

    var response = {};
    var content = {'name': style.name, 'pos': 'above'};
    response.data = JSON.stringify({'content': content, 'service': StyleService.name, 'action': 'move'});
    ws.onmessage(response);

    expect(StyleService.styles[expectedPos].name).toEqual(style.name);
  }));

  it("should move a style below (from the beginning) (I didn't request)", inject(function(StyleService) {
    initStyles();
    
    var pos = 0;
    var expectedPos = 1;
    var style = StyleService.styles[pos];

    var response = {};
    var content = {'name': style.name, 'pos': 'below'};
    response.data = JSON.stringify({'content': content, 'service': StyleService.name, 'action': 'move'});
    ws.onmessage(response);

    expect(StyleService.styles[expectedPos].name).toEqual(style.name);
  }));

  it("should move a style above (from the beginning) (I didn't request)", inject(function(StyleService) {
    initStyles();
    
    var pos = 0;
    var expectedPos = 0;
    var style = StyleService.styles[pos];

    var response = {};
    var content = {'name': style.name, 'pos': 'above'};
    response.data = JSON.stringify({'content': content, 'service': StyleService.name, 'action': 'move'});
    ws.onmessage(response);

    expect(StyleService.styles[expectedPos].name).toEqual(style.name);
  }));

  it("should move a style below (from the end) (I didn't request)", inject(function(StyleService) {
    initStyles();
    
    var pos = StyleService.styles.length - 1;
    var expectedPos = pos;
    var style = StyleService.styles[pos];

    var response = {};
    var content = {'name': style.name, 'pos': 'below'};
    response.data = JSON.stringify({'content': content, 'service': StyleService.name, 'action': 'move'});
    ws.onmessage(response);

    expect(StyleService.styles[expectedPos].name).toEqual(style.name);
  }));

  it("should move a style above (from the end) (I didn't request)", inject(function(StyleService) {
    initStyles();
    
    var pos = StyleService.styles.length - 1;
    var expectedPos = pos - 1;
    var style = StyleService.styles[pos];

    var response = {};
    var content = {'name': style.name, 'pos': 'above'};
    response.data = JSON.stringify({'content': content, 'service': StyleService.name, 'action': 'move'});
    ws.onmessage(response);

    expect(StyleService.styles[expectedPos].name).toEqual(style.name);
  }));

  it("should move a style to the beginning (I didn't request)", inject(function(StyleService) {
    initStyles();
    
    var pos = 2;
    var expectedPos = 0;
    var style = StyleService.styles[pos];

    var response = {};
    var content = {'name': style.name, 'pos': 'first'};
    response.data = JSON.stringify({'content': content, 'service': StyleService.name, 'action': 'move'});
    ws.onmessage(response);

    expect(StyleService.styles[expectedPos].name).toEqual(style.name);
  }));

  it("should move a style to the end (I didn't request)", inject(function(StyleService) {
    initStyles();
    
    var pos = 2;
    var expectedPos = StyleService.styles.length - 1;
    var style = StyleService.styles[pos];

    var response = {};
    var content = {'name': style.name, 'pos': 'last'};
    response.data = JSON.stringify({'content': content, 'service': StyleService.name, 'action': 'move'});
    ws.onmessage(response);

    expect(StyleService.styles[expectedPos].name).toEqual(style.name);
  }));

  it("shouldn't move a style to the beginning if it's the first (I didn't request)", inject(function(StyleService) {
    initStyles();
    
    var pos = 0;
    var expectedPos = pos;
    var style = StyleService.styles[pos];

    var response = {};
    var content = {'name': style.name, 'pos': 'first'};
    response.data = JSON.stringify({'content': content, 'service': StyleService.name, 'action': 'move'});
    ws.onmessage(response);

    expect(StyleService.styles[expectedPos].name).toEqual(style.name);
  }));

  it("shouldn't move a style to the end if it's the last (I didn't request)", inject(function(StyleService) {
    initStyles();
    
    var pos = StyleService.styles.length - 1;;
    var expectedPos = pos;
    var style = StyleService.styles[pos];

    var response = {};
    var content = {'name': style.name, 'pos': 'last'};
    response.data = JSON.stringify({'content': content, 'service': StyleService.name, 'action': 'move'});
    ws.onmessage(response);

    expect(StyleService.styles[expectedPos].name).toEqual(style.name);
  }));

});
