// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

module.exports = function($rootScope, WebSocketService, BaseService, LineService, StyleService, VideoService) {
    var service = Object.create(BaseService);
    service.name = 'import';

    $rootScope.$on(service.name, function(ev, data) {
        service.receivedImport(data.content);
    })

    service.requestImport = function(type, script) {
        service.putToWs(type, script);
    }

    service.receivedImport = function(content) {
        StyleService.styles.length = 0;
        StyleService.receivedInit(content.styles);
        LineService.receivedInit(content.lines);

        // Needs testing
        if (VideoService.isVideoReady) {
            VideoService.onVideoLoaded();
        }
    }

    return service;
};
