// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

module.exports = function() {
  var WSService;
  var videoService;
  var lineService;
  var styleService;
  var dialogues;
  var styles;

  beforeEach(inject(function(WebSocketService, VideoService, LineService, StyleService) {
    WSService = WebSocketService;
    videoService = VideoService;
    lineService = LineService;
    styleService = StyleService;
    dialogues = VideoService.ass.dialogues;
    styles = VideoService.ass.styles;
  }))

  it("should restore styles between specs", function() {
    styles.delete('Default');
  });

  it("should have restored dialogues (contains all styles)", function() {
    expect(styles.size).toEqual(styleService.styles.length);
  });

  it("should apply new options of a style", function() {
    var style = styleService.styles[0];
    var newStyle = angular.copy(style);
    newStyle.font = 'Roboto';

    styleService.requestUpdate(style.name, newStyle);

    var response = {};
    response.data = JSON.stringify({'callId': WSService.callId, 'service': styleService.name, 'action': 'update'});
    WSService.ws.onmessage(response);

    expect(styles.get(style.name).fontName).toEqual('Roboto');
  });

  it("should rename a style and lines with that style", function() {
    var style = styleService.styles[0];
    var newStyle = angular.copy(style);
    var oldName = style.name;
    newStyle.name = 'Cat';

    styleService.requestUpdate(oldName, newStyle);

    var response = {};
    response.data = JSON.stringify({'callId': WSService.callId, 'service': styleService.name, 'action': 'rename'});
    WSService.ws.onmessage(response);

    expect(styles.get(oldName)).toBeUndefined();
    expect(styles.get(newStyle.name)).toBeDefined()
  });

  it("should apply new options of a style to a line", function() {
    var style = styleService.styles[0];
    var newStyle = angular.copy(style);
    newStyle.font = 'Roboto';

    var dialogue = _.find(videoService.ass.dialogues, {'style': {'name': style.name}});
    expect(dialogue).toBeDefined();

    styleService.requestUpdate(style.name, newStyle);

    var response = {};
    response.data = JSON.stringify({'callId': WSService.callId, 'service': styleService.name, 'action': 'update'});
    WSService.ws.onmessage(response);

    expect(styles.get(style.name).fontName).toEqual('Roboto');
    expect(dialogue.style.fontName).toEqual('Roboto');
  });

  it("should apply new options of a style to a line and rename", function() {
    var style = styleService.styles[0];
    var newStyle = angular.copy(style);
    newStyle.font = 'Roboto';
    newStyle.name = 'Cat'

    var dialogue = _.find(videoService.ass.dialogues, {'style': {'name': style.name}});
    expect(dialogue).toBeDefined();

    styleService.requestUpdate(style.name, newStyle);

    var response = {};
    response.data = JSON.stringify({'callId': WSService.callId, 'service': styleService.name, 'action': 'rename'});
    WSService.ws.onmessage(response);

    expect(styles.get(newStyle.name)).toBeDefined();
    expect(dialogue.style.name).toEqual(newStyle.name);
  });

  it("should change the color of a style", function() {
    var style = styleService.styles[0];
    var newStyle = angular.copy(style);
    newStyle.outline_color = 'FF0F0AFF';

    styleService.requestUpdate(style.name, newStyle);

    var response = {};
    response.data = JSON.stringify({'callId': WSService.callId, 'service': styleService.name, 'action': 'update'});
    WSService.ws.onmessage(response);

    expect(styles.get(style.name).outlineColor.red).toEqual(255);
    expect(styles.get(style.name).outlineColor.green).toEqual(15);
    expect(styles.get(style.name).outlineColor.blue).toEqual(10);
    expect(styles.get(style.name).outlineColor.alpha).toEqual(1);
  });

  it("should make a style bold", function() {
    var style = styleService.styles[0];
    var newStyle = angular.copy(style);
    newStyle.bold = 1;

    styleService.requestUpdate(style.name, newStyle);

    var response = {};
    response.data = JSON.stringify({'callId': WSService.callId, 'service': styleService.name, 'action': 'update'});
    WSService.ws.onmessage(response);

    expect(styles.get(style.name).bold).toEqual(true);
  });

};
