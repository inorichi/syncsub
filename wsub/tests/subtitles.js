// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

require('../src/app');
var assUtils = require('../src/utils/assUtils');

var mockWS = function(address) {
  this.send = function() { };
  this.onopen = function() { };
  this.onmessage = function() { };
  this.onclose = function() { };
  this.url = address;
}

var copyAss = function(fromD, fromS, toD, toS) {
  fromS.forEach(function(value, key) {
    toS.set(key, angular.copy(value));
  })

  angular.copy(fromD, toD);

  toD.forEach(function(dialogue) {
    dialogue._style = toS.get(dialogue.style.name);
  })
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

describe("Test video subtitles", function() {

  debug = false;
  var lineService;
  var styleService;
  var p;
  var ass;
  var stylesSaved = new libjass.Map();
  var dialoguesSaved = [];

  // Add a video inside a div to the DOM so that we can use libjass' renderer
  var elemDiv = document.createElement('div');
  elemDiv.style.cssText = 'display:none;';
  var video = document.createElement('video');
  elemDiv.appendChild(video);

  // We return always the same promise because initializing libjass costs some time,
  // so it's better to save the state at the beginning and copy it back when each test finish
  var assPromise = function() {
    if (p === undefined) {
      var assFile = assUtils.convertToAss([null, styleService.styles, lineService.lines], true);
      p = libjass.ASS.fromString(assFile);
    }
    return p;
  }

  beforeEach(function(done) {
    angular.mock.module('subs');

    inject(function(SocketConfig) {
      SocketConfig.socket = mockWS;
    })

    inject(function(WebSocketService, VideoService, LineService, StyleService) {
      lineService = LineService;
      styleService = StyleService;

      var ws = WebSocketService.ws;
      spyOn(ws, 'sendMessage');

      // Init lines and styles
      ws.onopen();
      var initLines = {'action': 'init', 'service': LineService.name, 'content': lines};
      ws.onmessage({data: JSON.stringify(initLines)});
      
      var initStyles = {'action': 'init', 'service': StyleService.name, 'content': styles};
      ws.onmessage({data: JSON.stringify(initStyles)});

      assPromise().then(function(response) {
        if (ass === undefined) {
          ass = response;
          copyAss(ass.dialogues, ass.styles, dialoguesSaved, stylesSaved);
        }
        VideoService.ass = ass;
        VideoService.video = video;
        VideoService.renderer = new libjass.renderers.DefaultRenderer(VideoService.video, VideoService.ass);
        VideoService.isVideoReady = true;
        done();
        return ass;
      });
    });
  });

  afterEach(function() {
    copyAss(dialoguesSaved, stylesSaved, ass._dialogues, ass._styles);
  });

  describe("Test dialogues", require('./subtitle_line'));
  describe("Test styles", require('./subtitle_style'));

});
