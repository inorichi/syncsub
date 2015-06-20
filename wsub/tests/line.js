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

var lines = [
    {'id': 4, 'txt': 'prueba4', 'start': '0:00:04.00', 'end': '0:00:05.00', 'style': 'Default', 'comment': 0},
    {'id': 2, 'txt': 'prueba2', 'start': '0:00:02.00', 'end': '0:00:03.00', 'style': 'Default', 'comment': 0},
    {'id': 9, 'txt': 'prueba9', 'start': '0:00:02.00', 'end': '0:00:03.00', 'style': 'Default', 'comment': 1},
    {'id': 7, 'txt': 'prueba7', 'start': '0:00:06.00', 'end': '0:00:07.00', 'style': 'Default', 'comment': 0},
    {'id': 5, 'txt': 'prueba5', 'start': '0:00:06.00', 'end': '0:00:07.00', 'style': 'Default', 'comment': 1},
    {'id': 3, 'txt': 'prueba3', 'start': '0:00:08.00', 'end': '0:00:09.00', 'style': 'Default', 'comment': 0},
    {'id': 1, 'txt': 'prueba1', 'start': '0:00:00.00', 'end': '0:00:01.00', 'style': 'Default', 'comment': 0},
]

describe("Test LineService", function() {

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

  it("should send data", inject(function(LineService) {
    LineService.sendToWs('some_action', {'asd': 123});

    expect(ws.sendMessage).toHaveBeenCalledWith(
        jasmine.objectContaining({
          'service': 'line',
          'action': 'some_action',
          'content': {'asd': 123},
          'callId': jasmine.any(Number)
        })
    );

    expect(WSService.calls[WSService.callId]).toBeDefined();
  }));

  it("should resolve calls", inject(function(LineService) {
    LineService.sendToWs('some_action', {'asd': 123});

    var response = {};
    response.data = JSON.stringify({'callId': WSService.callId, 'service': 'line'});

    var call = WSService.calls[WSService.callId];
    spyOn(call, 'resolve');

    ws.onmessage(response);
    expect(call.resolve).toHaveBeenCalled();
  }));

  it("should reject calls", inject(function(LineService) {
    LineService.sendToWs('some_action', {'asd': 123});

    var response = {};
    response.data = JSON.stringify({'error': 'some_error', 'callId': WSService.callId, 'service': 'line'});

    var call = WSService.calls[WSService.callId];
    spyOn(call, 'reject');

    ws.onmessage(response);
    expect(call.reject).toHaveBeenCalled();
  }));

  it("should request init when connected", inject(function(LineService) {
    spyOn(LineService, 'requestInit');

    ws.onopen();
    expect(LineService.requestInit).toHaveBeenCalled();
  }));

  var initLines = inject(function(LineService) {
    ws.onopen();

    // Add lines to the response
    var data = ws.sendMessage.calls.mostRecent().args[0];
    data.content = lines;
    ws.onmessage({data: JSON.stringify(data)});
  });

  it("should add lines when init", inject(function(LineService) {
    initLines.call();
    expect(LineService.lines.length).toBe(lines.length);
  }));

  it("should not have a selected line by default", inject(function(LineService) {
    expect(LineService.selected.line).toBeNull();
  }));

  it("should lock a line", inject(function(LineService) {
    initLines();
    LineService.requestLock(LineService.lines[0]);

    var response = {};
    response.data = JSON.stringify({'callId': WSService.callId, 'service': 'line', 'action': 'lock'});
    ws.onmessage(response);

    expect(LineService.selected.line).toBe(LineService.lines[0]);
  }));

  it("should edit a line", inject(function(LineService) {
    initLines();
    LineService.selected.line = LineService.lines[0];
    var textCopy = LineService.selected.line.txt;

    // Request an update appending a random string 
    LineService.requestUpdate(LineService.selected.line.txt + 'asd');

    var response = {};
    response.data = JSON.stringify({'callId': WSService.callId, 'service': 'line', 'action': 'update'});
    ws.onmessage(response);

    expect(LineService.selected.line.txt).not.toEqual(textCopy);
  }));

  it("should update the start time of a line", inject(function(LineService) {
    initLines();
    LineService.selected.line = LineService.lines[0];
    var start = LineService.selected.line.start;

    // Update the last digit
    var lastNumberStart = parseInt(start.charAt(start.length - 1));

    lastNumberStart == 9 ? 0 : lastNumberStart++;

    // Request update of start time
    LineService.requestUpdateTime(start.substr(0, start.length - 1) + lastNumberStart, 'start');

    var response = {};
    response.data = JSON.stringify({'callId': WSService.callId, 'service': 'line', 'action': 'updateTime'});
    ws.onmessage(response);

    expect(LineService.selected.line.start).not.toEqual(start);
  }));

  it("should update the end time of a line", inject(function(LineService) {
    initLines();
    LineService.selected.line = LineService.lines[0];
    var end = LineService.selected.line.end;

    // Update the last digit
    var lastNumberEnd = parseInt(end.charAt(end.length - 1));

    lastNumberEnd == 9 ? 0 : lastNumberEnd++;

    // Request update of end time
    LineService.requestUpdateTime(end.substr(0, end.length - 1) + lastNumberEnd, 'end');

    var response = {};
    response.data = JSON.stringify({'callId': WSService.callId, 'service': 'line', 'action': 'updateTime'});
    ws.onmessage(response);

    expect(LineService.selected.line.end).not.toEqual(end);
  }));

  it("should change the style of a line", inject(function(LineService) {
    initLines();
    LineService.selected.line = LineService.lines[0];
    var style = LineService.selected.line.style;
    
    // Change the style to another one
    LineService.requestChangeStyle('Test');

    var response = {};
    response.data = JSON.stringify({'callId': WSService.callId, 'service': 'line', 'action': 'changeStyle'});
    ws.onmessage(response);

    expect(LineService.selected.line.style).not.toEqual(style);
  }));

  it("should be a comment", inject(function(LineService) {
    initLines();
    LineService.selected.line = LineService.lines[0];
    var comment = LineService.selected.line.comment;
    
    LineService.requestToggleComment(1);

    var response = {};
    response.data = JSON.stringify({'callId': WSService.callId, 'service': 'line', 'action': 'toggleComment'});
    ws.onmessage(response);

    expect(LineService.selected.line.comment).toEqual(1);
  }));

  it("should be a dialogue", inject(function(LineService) {
    initLines();
    LineService.selected.line = LineService.lines[0];
    var comment = LineService.selected.line.comment;
    
    LineService.requestToggleComment(0);

    var response = {};
    response.data = JSON.stringify({'callId': WSService.callId, 'service': 'line', 'action': 'toggleComment'});
    ws.onmessage(response);

    expect(LineService.selected.line.comment).toEqual(0);
  }));

  it("should request to add a new line", inject(function(LineService) {
    initLines();
    var line = {'id': 3, 'pos': 'after'};

    LineService.requestAdd(line.id, line.pos);
  }));

  it("should delete a line", inject(function(LineService) {
    initLines();
    var line = LineService.lines[5];
    LineService.requestDelete(line.id);

    var response = {};
    response.data = JSON.stringify({'callId': WSService.callId, 'service': 'line', 'action': 'delete'});
    ws.onmessage(response);

    expect(LineService.lines.length).toEqual(lines.length - 1);
  }));

  it("should edit a line (not mine)", inject(function(LineService) {
    initLines();
    var line = LineService.lines[0];
    var textCopy = line.txt;

    var response = {};
    var content = {'id': line.id, 'txt': line.txt + 'qwe'};
    response.data = JSON.stringify({'service': 'line', 'action': 'update', 'content': content});
    ws.onmessage(response);

    expect(line.txt).not.toEqual(textCopy);
  }));

  it("should update the start time of a line (not mine)", inject(function(LineService) {
    initLines();
    var line = LineService.lines[0];
    var start = line.start;

    // Update the last digit
    var lastNumberStart = parseInt(start.charAt(start.length - 1));

    lastNumberStart == 9 ? 0 : lastNumberStart++;

    var newStart = start.substr(0, start.length - 1) + lastNumberStart;

    var response = {};
    var content = {'id': line.id, 'pos': 'start', 'time': newStart};
    response.data = JSON.stringify({'service': 'line', 'action': 'updateTime', 'content': content});
    ws.onmessage(response);

    expect(line.start).not.toEqual(start);
  }));

  it("should update the end time of a line (not mine)", inject(function(LineService) {
    initLines();
    var line = LineService.lines[0];
    var end = line.end;

    // Update the last digit
    var lastNumberEnd = parseInt(end.charAt(end.length - 1));

    lastNumberEnd == 9 ? 0 : lastNumberEnd++;

    // Request update of end time
    var newEnd = end.substr(0, end.length - 1) + lastNumberEnd;

    var response = {};
    var content = {'id': line.id, 'pos': 'end', 'time': newEnd};
    response.data = JSON.stringify({'service': 'line', 'action': 'updateTime', 'content': content});
    ws.onmessage(response);

    expect(line.end).not.toEqual(end);
  }));

  it("should change the style of a line (not mine)", inject(function(LineService) {
    initLines();
    var line = LineService.lines[0];

    // Get a copy of the style
    var style = line.style;
    
    var response = {};
    var content = {'id': line.id, 'style': 'Test'};
    response.data = JSON.stringify({'service': 'line', 'action': 'changeStyle', 'content': content});
    ws.onmessage(response);

    expect(line.style).not.toEqual(style);
  }));

  it("should be a comment (not mine)", inject(function(LineService) {
    initLines();
    var line = LineService.lines[0];
    
    var response = {};
    var content = {'id': line.id, 'comment': 1};
    response.data = JSON.stringify({'service': 'line', 'action': 'toggleComment', 'content': content});
    ws.onmessage(response);

    expect(line.comment).toEqual(1);
  }));

  it("should be a dialogue (not mine)", inject(function(LineService) {
    initLines();
    var line = LineService.lines[0];
    
    var response = {};
    var content = {'id': line.id, 'comment': 0};
    response.data = JSON.stringify({'service': 'line', 'action': 'toggleComment', 'content': content});
    ws.onmessage(response);

    expect(line.comment).toEqual(0);
  }));

  it("should delete a line (not mine)", inject(function(LineService) {
    initLines();
    var line = LineService.lines[5];

    var response = {};
    var content = {'id': line.id};
    response.data = JSON.stringify({'service': 'line', 'action': 'delete', 'content': content});
    ws.onmessage(response);

    expect(LineService.lines.length).toEqual(lines.length - 1);
  }));

  it("should add a line after", inject(function(LineService) {
    initLines();
    var line = LineService.lines[5];

    var response = {};
    var newLine = {'id': 10, 'txt': 'prueba10', 'start': '0:00:10.00', 'end': '0:00:13.00', 'style': 'Default', 'comment': 0};
    var content = {'id': line.id, 'pos': 'after', 'line': newLine};
    response.data = JSON.stringify({'service': 'line', 'action': 'add', 'content': content});
    ws.onmessage(response);

    expect(LineService.lines[6]).toEqual(newLine);
  }));

  it("should add a line before", inject(function(LineService) {
    initLines();
    var line = LineService.lines[5];

    var response = {};
    var newLine = {'id': 10, 'txt': 'prueba10', 'start': '0:00:10.00', 'end': '0:00:13.00', 'style': 'Default', 'comment': 0};
    var content = {'id': line.id, 'pos': 'before', 'line': newLine};
    response.data = JSON.stringify({'service': 'line', 'action': 'add', 'content': content});
    ws.onmessage(response);

    expect(LineService.lines[5]).toEqual(newLine);
  }));

  it("should add a line after at the beginning", inject(function(LineService) {
    initLines();
    var line = LineService.lines[0];

    var response = {};
    var newLine = {'id': 10, 'txt': 'prueba10', 'start': '0:00:10.00', 'end': '0:00:13.00', 'style': 'Default', 'comment': 0};
    var content = {'id': line.id, 'pos': 'after', 'line': newLine};
    response.data = JSON.stringify({'service': 'line', 'action': 'add', 'content': content});
    ws.onmessage(response);

    expect(LineService.lines[1]).toEqual(newLine);
  }));

  it("should add a line before at the beginning", inject(function(LineService) {
    initLines();
    var line = LineService.lines[0];

    var response = {};
    var newLine = {'id': 10, 'txt': 'prueba10', 'start': '0:00:10.00', 'end': '0:00:13.00', 'style': 'Default', 'comment': 0};
    var content = {'id': line.id, 'pos': 'before', 'line': newLine};
    response.data = JSON.stringify({'service': 'line', 'action': 'add', 'content': content});
    ws.onmessage(response);

    expect(LineService.lines[0]).toEqual(newLine);
  }));

  it("should add a line after at the end", inject(function(LineService) {
    initLines();
    var line = LineService.lines[6];

    var response = {};
    var newLine = {'id': 10, 'txt': 'prueba10', 'start': '0:00:10.00', 'end': '0:00:13.00', 'style': 'Default', 'comment': 0};
    var content = {'id': line.id, 'pos': 'after', 'line': newLine};
    response.data = JSON.stringify({'service': 'line', 'action': 'add', 'content': content});
    ws.onmessage(response);

    expect(LineService.lines[7]).toEqual(newLine);
  }));

  it("should add a line before at the end", inject(function(LineService) {
    initLines();
    var line = LineService.lines[6];

    var response = {};
    var newLine = {'id': 10, 'txt': 'prueba10', 'start': '0:00:10.00', 'end': '0:00:13.00', 'style': 'Default', 'comment': 0};
    var content = {'id': line.id, 'pos': 'before', 'line': newLine};
    response.data = JSON.stringify({'service': 'line', 'action': 'add', 'content': content});
    ws.onmessage(response);

    expect(LineService.lines[6]).toEqual(newLine);
  }));

});
