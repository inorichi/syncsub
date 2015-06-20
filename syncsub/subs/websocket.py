# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

import importlib

from tornado.websocket import WebSocketHandler
from tornado.ioloop import PeriodicCallback
from tornado.log import app_log
from django.contrib import auth
from django.conf import settings as django_settings

from .messages import MessageHandler 
from .client import Client
from .room import Room, RoomManager
from explorer.models import Item


message_handler = MessageHandler()
room_manager = RoomManager.instance()


class PermissionDenied(Exception):
    pass


class SubsWebSocketHandler(WebSocketHandler):
    def open(self):
        # Check that a room is given and this user can open a connection to the room
        try:
            room_name = self.get_argument('room')

            user = self.get_django_user()
            item = Item.objects.get_subclass(id=int(room_name))
            if not item.is_visible(user):
                raise PermissionDenied
        # Always close the connection if something fails
        except:
            app_log.warning("Invalid connection. Closing")
            self.close()
            return None

        # Create a new room if it doesn't exist
        room = room_manager.get_or_create(room_name)

        # Create a client associating his room
        self.client = Client(self, room)

    def on_message(self, msg):
        message_handler.process_message(self.client, msg)

    def on_close(self):
        if hasattr(self, 'client'):
            self.client.close()

    def check_origin(self, origin):
        return True

    def get_django_user(self):
        if not hasattr(self, '_user'):
            engine = importlib.import_module(django_settings.SESSION_ENGINE)
            session_key = self.get_cookie(django_settings.SESSION_COOKIE_NAME)

            class Dummy(object):
                pass

            django_request = Dummy()
            django_request.session = engine.SessionStore(session_key)
            self._user = auth.get_user(django_request)

        return self._user


class SubsSavePeriodicCallback(PeriodicCallback):
    def __init__(self, interval):
        super(SubsSavePeriodicCallback, self).__init__(room_manager.save, interval * 1000)
