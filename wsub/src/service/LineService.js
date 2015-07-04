// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

var capitalize = require('../utils/capitalize');

module.exports = function($rootScope, WebSocketService, BaseService, DataService, VideoService) {
    var service = Object.create(BaseService);
    service.name = 'line';
    service.lines = DataService.lines;
    service.selected = {line: null};

    service.getLineById = function(id) {
        return _.find(service.lines, {'id': id});
    }

    service.getLineIndexById = function(id) {
        return _.findIndex(service.lines, {'id': id});
    }

    $rootScope.$on('connected', function() {
        service.requestInit();
    });

    $rootScope.$on(service.name, function(ev, data) {
        var fn = 'received' + capitalize(data.action);
        service[fn](data.content);

        VideoService.updateAss(data);
    })

    service.requestInit = function() {
        service.putToWs('init');
    }

    service.requestLock = function(line) {
        return service.sendToWs('lock', {
            'id': line.id
        }).then(function() {
            service.selected.line = line;
        });
    }

    service.requestUpdate = function(txt, id) {
        return service.sendToWs('update', {
            'txt': txt 
        }).then(function(data) {
            service.selected.line.txt = txt;
            data.content.id = id;
            VideoService.updateAss(data);
        });
    }

    service.requestAdd = function(id, pos) {
        service.putToWs('add', {
            'id': id,
            'pos': pos
        });
    }

    service.requestDelete = function(id) {
        return service.sendToWs('delete', {
            'id': id
        }).then(function(data) {
            service.receivedDelete(data.content);
            VideoService.updateAss(data);
        });
    }

    service.requestUpdateTime = function(time, pos, id) {
        return service.sendToWs('updateTime', {
            'time': time,
            'pos': pos
        }).then(function(data) {
            service.selected.line[pos] = time;
            data.content.id = id;
            VideoService.updateAss(data);
        });
    }

    service.requestChangeStyle = function(style, id) {
        return service.sendToWs('changeStyle', {
            'style': style
        }).then(function(data) {
            service.selected.line.style = style;
            data.content.id = id;
            VideoService.updateAss(data);
        });
    }

    service.requestToggleComment = function(value, id) {
        return service.sendToWs('toggleComment', {
            'comment': value
        }).then(function(data) {
            service.selected.line.comment = value;
            data.content.id = id;
            VideoService.updateAss(data);
        });
    }

    service.receivedInit = function(content) {
        Array.prototype.push.apply(service.lines, content);
    }

    service.receivedUpdate = function(content) {
        service.getLineById(content.id).txt = content.txt;
    }

    service.receivedDelete = function(content) {
        _.remove(service.lines, {'id': content.id});
    }

    service.receivedAdd = function(content) {
        var lineIndex = service.getLineIndexById(content.id);
        if (content.pos == 'after') {
            lineIndex++;
        }
        service.lines.splice(lineIndex, 0, content.line);
    }

    service.receivedUpdateTime = function(content) {
        service.getLineById(content.id)[content.pos] = content.time;
    }

    service.receivedChangeStyle = function(content) {
        service.getLineById(content.id).style = content.style;
    }

    service.receivedToggleComment = function(content) {
        service.getLineById(content.id).comment = content.comment;
    }

    return service;
};

