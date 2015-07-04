// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

module.exports = function(WebSocketService) {
    return {
        name: '',

        sendToWs: function(action, content) {
            return WebSocketService.send(this.name, action, content);
        },

        putToWs: function(action, content) {
            WebSocketService.put(this.name, action, content);
        },

    }
};

