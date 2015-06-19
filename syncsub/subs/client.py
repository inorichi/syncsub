# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

import json
from .room import RoomManager


room_manager = RoomManager.instance()


class Client(object):
    def __init__(self, req_handler, room):
        self.req_handler = req_handler
        room.add_client(self)
        self.room = room
        self.subs = room.subs
        self.styles = room.styles
        self.locked_line = None

    @property
    def remote_address(self):
        return self.req_handler.request.remote_ip

    def send(self, msg):
        self.req_handler.write_message(json.dumps(msg))

    def close(self):
        if self.locked_line:
            self.locked_line['locked'] = 0

        self.room.del_client(self)
        if not self.room.has_clients:
            room_manager.delete(self.room.name)
