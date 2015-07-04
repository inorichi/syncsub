// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

var capitalize = require('../utils/capitalize');

module.exports = function($rootScope, WebSocketService, BaseService, DataService, VideoService) {
    var service = Object.create(BaseService);
    service.name = 'style';
    service.styles = DataService.styles;

    $rootScope.$on('connected', function() {
        service.requestInit();
    })

    $rootScope.$on(service.name, function(ev, data) {
        var fn = 'received' + capitalize(data.action);
        service[fn](data.content);

        VideoService.updateAss(data);
    })

    service.getStyleByName = function(name) {
        return _.find(service.styles, {'name': name});
    }

    service.getStyleIndex = function(name) {
        return _.findIndex(service.styles, {'name': name});
    }

    service.getModifiedProperties = function(name, style) {
        var modified = {};
        var localStyle = service.getStyleByName(name);
        
        for (key in style) {
            if (style[key] != localStyle[key]) {
                modified[key] = style[key];
            }
        }
        return modified;
    }

    service.requestInit = function() {
        service.putToWs('init');
    }

    service.requestAdd = function(name) {
        service.putToWs('add', {
            'name': name
        });
    }

    service.requestDelete = function(name) {
        return service.sendToWs('delete', {
            'name': name
        }).then(function(data) {
            service.receivedDelete(data.content);
            VideoService.updateAss(data);
        });
    }

    // Properties have been changed but not the name
    service.requestUpdate = function(name, style) {
        if (name != style.name) {
            return service.requestRename(name, style);
        }

        var modified = service.getModifiedProperties(name, style);

        return service.sendToWs('update', {
            'name': name,
            'style': modified
        }).then(function(data) {
            service.receivedUpdate({'name': name, 'style': modified })
            VideoService.updateAss(data);
        });
    }

    // The name has changed, properties may have or not
    service.requestRename = function(oldName, style) {
        var modified = service.getModifiedProperties(oldName, style);

        return service.sendToWs('rename', {
            'name': oldName,
            'style': modified
        }).then(function(data) {
            service.receivedRename({'name': oldName, 'style': modified })
            VideoService.updateAss(data);
        });
    }

    service.requestMove = function(name, pos) {
        return service.sendToWs('move', {
            'name': name,
            'pos': pos
        }).then(function(data) {
            service.receivedMove({'name': name, 'pos': pos});
        });
    }

    service.receivedInit = function(content) {
        Array.prototype.push.apply(service.styles, content);
    }

    service.receivedAdd = function(content) {
        service.styles.push(content.style);
    }

    service.receivedDelete = function(content) {
        _.remove(service.styles, {'name': content.name});
    }

    service.receivedUpdate = function(content) {
        var style = service.getStyleByName(content.name);
        for (key in content.style) {
            style[key] = content.style[key];
        }
    }

    service.receivedRename = function(content) {
        var style = service.getStyleByName(content.name);
        for (key in content.style) {
            style[key] = content.style[key];
        }

        _.forEach(DataService.lines, function(line) {
            if (line.style == content.name) {
                line.style = style.name;
            }
        });
    }

    service.receivedMove = function(content) {
        var index = service.getStyleIndex(content.name);

        switch (content.pos) {
            case 'below':
                if (index == service.styles.length-1) return;
                index += 1;
                break;
            case 'above':
                if (index == 0) return;
                index -= 1;
                break;
            case 'first':
                if (index == 0) return;
                index = 0;
                break;
            case 'last':
                if (index == service.styles.length-1) return;
                index = service.styles.length-1;
                break;

            default: return;
        }

        var style = _.remove(service.styles, {'name': content.name})[0];
        service.styles.splice(index, 0, style);
    }

    return service;
};

