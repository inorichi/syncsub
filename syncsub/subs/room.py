# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

from os.path import join
import json

from tornado.log import app_log

from .utils import create_line, create_style
from settings import SUBTITLES_DIR

class Room(object):
    def __init__(self, name):
        self.name = name
        self.subs = {}
        self.subs_order = []
        self.styles = []
        self.clients = set()
        self.next_id = max(self.subs.keys()) if self.subs else 0
        self.subs_path = join(SUBTITLES_DIR, self.name + '.txt')
        self.modified = False

        if not self.subs:
            self.add_line(create_line(self.get_next_id))

    def add_client(self, client):
        self.clients.add(client)

    def del_client(self, client):
        self.clients.remove(client)

    @property
    def has_clients(self):
        return len(self.clients) > 0

    def add_line(self, line, position=None):
        if position is None:
            position = len(self.subs_order)

        self.subs_order.insert(position, line['id'])
        self.subs[line['id']] = line

    def del_line(self, line):
        del self.subs_order[self.subs_order.index(line['id'])]
        del self.subs[line['id']]

    @property
    def get_next_id(self):
        self.next_id += 1
        return self.next_id

    def load(self):
        with open(self.subs_path, 'r') as f:
            styles, subs = f.readlines()

        styles = json.loads(styles)['styles']
        subs = json.loads(subs)['lines']

        self.styles = styles

        self.subs.clear()
        self.subs_order.clear()

        for i in range(len(subs)):
            self.subs_order.append(subs[i]['id'])
            self.subs[self.subs_order[i]] = subs[i]

        self.next_id = max(self.subs_order)

    def save(self):
        if not self.modified:
            return

        app_log.debug("Room %s modified, saving changes" % self.name)

        with open(self.subs_path, 'w') as f:
            f.write(json.dumps({'styles': self.styles}))
            f.write('\n')
            f.write(json.dumps({'lines': [self.subs[x] for x in self.subs_order]}))

        self.modified = False


class RoomManager(object):
    rooms = {}

    @staticmethod
    def instance():
        if not hasattr(RoomManager, "_instance"):
            RoomManager._instance = RoomManager()
        return RoomManager._instance

    def get(self, name):
        return self.rooms.get(name)

    def create(self, name):
        if self.get(name) is None:
            room = Room(name)
            self.rooms[name] = room
            try:
                room.load()
            except IOError:
                pass

            return room

        return None

    def get_or_create(self, name):
        room = self.get(name)
        if room is None:
            return self.create(name)

        return room

    def delete(self, name):
        app_log.debug("Deleting room: %s" % name)
        self.rooms[name].save()
        del self.rooms[name]

    def all(self):
        return list(self.rooms.values())

    def save(self):
        app_log.debug("Saving all files")
        for room in self.all():
            room.save()

