// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

module.exports = function() {
  var WSService;
  var videoService;
  var lineService;
  var styleService;
  var dialogues;

  beforeEach(inject(function(WebSocketService, VideoService, LineService, StyleService) {
    WSService = WebSocketService;
    videoService = VideoService;
    lineService = LineService;
    styleService = StyleService;
    dialogues = VideoService.ass.dialogues;
  }))

  it("should restore dialogues between specs", function() {
    dialogues.pop(0);
  });

  it("should have restored dialogues", function() {
    expect(dialogues.length).toEqual(_.filter(lineService.lines, {'comment': 0}).length);
  });

  it("should contain all dialogue lines", function() {
     var dialogueIds = _.pluck(_.filter(lineService.lines, {'comment': 0}), 'id');

    _.forEach(dialogues, function(dialogue) {
      _.pull(dialogueIds, dialogue.appId);
    });

    expect(dialogueIds.length).toEqual(0);
  })

  it("shouldn't contain commented lines", function() {
    var commentedLines = _.pluck(_.filter(lineService.lines, {'comment': 1}), 'id');

    _.forEach(dialogues, function(dialogue) {
        expect(_.contains(commentedLines, dialogue.appId)).toBe(false);
    });

  });

  it("should edit a dialogue", function() {
    lineService.selected.line = lineService.lines[0];
    var dialogue = videoService.getLineById(lineService.selected.line.id);
    spyOn(dialogue, '_parsePartsString');

    lineService.requestUpdate(lineService.selected.line.txt + "qwe", lineService.selected.line.id);

    var response = {'service': 'line', 'callId': WSService.callId, 'action': 'update'};
    WSService.ws.onmessage({ data: JSON.stringify(response) });

    // Expect both messages are the same after the update
    expect(dialogue._rawPartsString).toEqual(lineService.selected.line.txt);

    // Expect the function that reload parts have been called
    expect(dialogue._parsePartsString).toHaveBeenCalled();
  });

  it("should update start time", function() {
    lineService.selected.line = lineService.lines[0];
    var dialogue = videoService.getLineById(lineService.selected.line.id);

    var start = '0:34:53.23';
    var startDialogue = dialogue.start;

    lineService.requestUpdateTime(start, 'start', lineService.selected.line.id);

    var response = {'service': 'line', 'callId': WSService.callId, 'action': 'updateTime'};
    WSService.ws.onmessage({ data: JSON.stringify(response) });

    expect(dialogue.start).not.toEqual(startDialogue);
  });

  it("should update start/end time", function() {
    lineService.selected.line = lineService.lines[0];
    var dialogue = videoService.getLineById(lineService.selected.line.id);

    var end = '0:34:55.35';
    var endDialogue = dialogue.end;

    lineService.requestUpdateTime(end, 'end', lineService.selected.line.id);

    var response = {'service': 'line', 'callId': WSService.callId, 'action': 'updateTime'};
    WSService.ws.onmessage({ data: JSON.stringify(response) });

    expect(dialogue.end).not.toEqual(endDialogue);
  });

  it("should update the style of a line", function() {
    lineService.selected.line = lineService.lines[1];
    var dialogue = videoService.getLineById(lineService.selected.line.id);
    expect(dialogue.style.name).not.toBe("Test");

    lineService.requestChangeStyle('Test', dialogue.appId);

    var response = {'service': 'line', 'callId': WSService.callId, 'action': 'changeStyle'};
    WSService.ws.onmessage({ data: JSON.stringify(response) });

    expect(dialogue.style).toBe(videoService.ass.styles.get("Test"));
  });

  it("should add a line", function() {
    lineService.selected.line = lineService.lines[1];
    var linesBefore = dialogues.length;

    var response = {};
    var newLine = {'id': 10, 'txt': 'prueba10', 'start': '0:00:10.00', 'end': '0:00:13.00', 'style': 'Default', 'comment': 0};
    var content = {'id': lineService.selected.line.id, 'pos': 'after', 'line': newLine};
    response.data = JSON.stringify({'service': 'line', 'action': 'add', 'content': content});
    WSService.ws.onmessage(response);

    expect(dialogues.length).toBe(linesBefore + 1);
  });

  it("should delete a line", function() {
    lineService.selected.line = lineService.lines[1];
    var linesBefore = dialogues.length;

    lineService.requestDelete(lineService.selected.line.id);

    var response = {'service': 'line', 'callId': WSService.callId, 'action': 'delete'}
    WSService.ws.onmessage({ data: JSON.stringify(response) });

    expect(dialogues.length).toBe(linesBefore - 1);
  });

  it("should delete a line when it's commented", function() {
    lineService.selected.line = _.find(lineService.lines, {'comment': 0});
    var linesBefore = dialogues.length;

    lineService.requestToggleComment(1, lineService.selected.line.id);

    var response = {'service': 'line', 'callId': WSService.callId, 'action': 'toggleComment'}
    WSService.ws.onmessage({ data: JSON.stringify(response) });

    expect(dialogues.length).toEqual(linesBefore - 1);
  });

  it("should add a line when it's uncommented", function() {
    lineService.selected.line = _.find(lineService.lines, {'comment': 1});
    var linesBefore = dialogues.length;

    lineService.requestToggleComment(0, lineService.selected.line.id);

    var response = {'service': 'line', 'callId': WSService.callId, 'action': 'toggleComment'}
    WSService.ws.onmessage({ data: JSON.stringify(response) });

    expect(dialogues.length).toEqual(linesBefore + 1);
  });

};
