# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

from tornado.websocket import WebSocketHandler
from tornado.log import gen_log

from .message_handler import MessageHandler 
from .client import Client
from .room import Room, RoomManager


message_handler = MessageHandler()
room_manager = RoomManager.instance()


class SubsWebSocketHandler(WebSocketHandler):
    def open(self):
        # Check that a room is given or close the connection
        try:
            room_name = self.get_argument('room')
        except:
            gen_log.warning("Invalid connection")
            self.close()
            return

        # Create a new room if it doesn't exist
        room = room_manager.get_or_create(room_name)
        print(room.subs)

        # Create a client associating his room
        self.client = Client(self, room)

    def on_message(self, msg):
        message_handler.process_message(self.client, msg)

    def on_close(self):
        try:
            self.client.close()
        except:
            pass

    def check_origin(self, origin):
        return True

