// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

var capitalize = require('../utils/capitalize');
var assUtils = require('../utils/assUtils');

module.exports = function($rootScope, DataService) {
    var service = {};

    service.isVideoReady = false;
    service.videoUrl = null;
    service.video = null;
    service.ass = null;
    service.renderer = null;

    service.openVideo = function(url) {
        service.videoUrl = url;
        $rootScope.$broadcast('open-video', url);
    }

    service.closeVideo = function() {
        service.isVideoReady = false;
        service.video = null;
        service.ass = null;
        service.renderer = null;
        $rootScope.$broadcast('close-video');
    }

    service.onVideoLoaded = function() {
        if (debug) libjass.debugMode = true;
        service.video = document.getElementById('video');
        var fontMap = document.getElementById('font-map');
        var assFile = assUtils.convertToAss(DataService.getData(), true);
        var assLoadedPromise = libjass.ASS.fromString(assFile).then(function (ass) {
            if (debug) console.debug("Script received.");

            // Export the ASS object for debugging
            service.ass = ass;

            service.renderer = new libjass.renderers.DefaultRenderer(service.video, service.ass, {
                //fontMap: libjass.renderers.RendererSettings.makeFontMapFromStyleElement(fontMap)
                enableSvg: false
            });
            service.renderer.addEventListener("ready", function() {
                service.isVideoReady = true;
                video.play();
            })
            if (debug) window.ass = service.ass;
            if (debug) window.renderer = service.renderer;

            return ass;
        });

    }

    service.updateAss = function(data) {
        if (!service.isVideoReady) { return; }

        var fn = 'received' + capitalize(data.action) + capitalize(data.service);
        service[fn](data.content);
    }

    service.getLineById = function(id) {
        return _.find(service.ass.dialogues, {'appId': id});
    }

    service.removeDialogueFromRendered = function(id) {
        if (service.renderer._preRenderedSubs.delete(id)) {
            service.renderer._removeAllSubs();
        }
    }

    service.receivedUpdateLine = function(content) {
        var dialogue = service.getLineById(content.id);
        if (dialogue === undefined) { return; }

        dialogue._rawPartsString = content.txt;
        dialogue._parsePartsString();

        service.removeDialogueFromRendered(dialogue.id);
    }

    service.receivedUpdateTimeLine = function(data) {
        var dialogue = service.getLineById(data.id);
        if (dialogue === undefined) { return; }

        dialogue['_' + data.pos] = libjass.Dialogue._toTime(data.time)
    }

    service.receivedChangeStyleLine = function(data) {
        var dialogue = service.getLineById(data.id);
        if (dialogue === undefined) { return; }

        var newStyle = service.ass.styles.get(data.style);
        dialogue._style = newStyle;

        service.removeDialogueFromRendered(dialogue.id);
    }

    service.receivedAddLine = function(data) {
        var newLine = assUtils.lineToAss(data.line, true);
        service.ass.addEvent(newLine);
    }

    service.receivedDeleteLine = function(data) {
        var dialogue = _.remove(service.ass.dialogues, {'appId': data.id})[0];

        service.removeDialogueFromRendered(dialogue.id)
    }

    service.receivedToggleCommentLine = function(data) {
        if (data.comment == 1) {
            service.receivedDeleteLine(data);
        } else {
            var line = _.find(DataService.lines, {'id': data.id});
            data.line = line;
            service.receivedAddLine(data);
        }
    }

    service.receivedUpdateStyle = function(data) {
        var style = service.ass.styles.get(data.name);

        var result;
        for (key in data.style) {
            result = assUtils.styleToLibjass(key, data.style[key]);
            style[result[0]] = result[1]
        }
        
        service.renderer._preRenderedSubs.clear();
    }

    service.receivedRenameStyle = function(data) {
        var style = service.ass.styles.get(data.name);
        service.ass.styles.delete(data.name);

        var result;
        for (key in data.style) {
            result = assUtils.styleToLibjass(key, data.style[key]);
            style[result[0]] = result[1]
        }
        service.ass.styles.set(style.name, style);

        service.renderer._preRenderedSubs.clear();
    }

    return service;
};

