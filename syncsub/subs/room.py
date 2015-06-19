# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

from os.path import join
import json

from tornado.log import app_log

from settings import subtitles_dir

class Room(object):
    def __init__(self, name):
        self.name = name
        self.subs = {}
        self.subs_order = []
        self.styles = []
        self.clients = set()
        self.next_id = max(self.subs.keys()) if self.subs else 0
        self.subs_path = join(subtitles_dir, self.name + '.txt')
        self.modified = False

        if not self.subs:
            self.add_line(self.create_line())

    def add_client(self, client):
        self.clients.add(client)

    def del_client(self, client):
        self.clients.remove(client)

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

    def get_next_id(self):
        self.next_id += 1
        return self.next_id

    def create_line(self, content={}):
        # Default values
        line = {
            'id': self.get_next_id(),
            'layer': 0,
            'start': '0:00:00.00',
            'end': '0:00:02.00',
            'comment': 0,
            'style': '',
            'name': '',
            'margin_left': 0,
            'margin_right': 0,
            'margin_vertical': 0,
            'effect': '',
            'txt': '',
        }
        # Update and override if necessary
        line.update(content)
        return line

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

    def create_style(self, name, content={}):
    # Styles: dict(name -> style)
    # Style attributes:
    # name (str) Also the key of the dict
    # font (str)
    # size (float) Max 4 decimals
    # primary_color (hex) Uses 8 digit RGBA. Ex: 00ff00ff
    # secondary_color (hex) Same as primary_color
    # outline_color (hex) Same as primary_color
    # back_color (hex) Same as primary_color
    # bold (int) 1 digit. 1 means activated, 0 deactivated
    # italic (int) Same as bold
    # underline (int) Same as bold
    # strike_out (int) Same as bold
    # scale_x (float) Max 4 decimals. It must be positive or 0
    # scale_y (float) Same as scale_x
    # spacing (float) Max 4 decimals. Can be negative
    # angle (float) Max 4 decimals
    # border_style (?)
    # outline (float) Max 4 decimals. It must be positive or 0
    # shadow (float) Same as outline
    # alignment (int) Range 1-9
    # margin_left (int) Must be >= 0
    # margin_right (int) Must be >= 0
    # margin_vertical (int) Must be >= 0
    # encoding (int) Must be one of the following
    #       0, 1, 2, 77, 128, 129, 130, 134, 136, 161, 162
    #       163, 177, 178, 186, 204, 222, 238, 255

        # Default values
        style = {
            'name': name,
            'font': 'Arial',
            'size': 40.,
            'primary_color': 'FFFFFFFF',
            'secondary_color': 'FF0000FF',
            'outline_color': '000000FF',
            'back_color': '000000FF',
            'bold': 0,
            'italic': 0,
            'underline': 0,
            'strike_out': 0,
            'scale_x': 100.,
            'scale_y': 100.,
            'spacing': 0.,
            'angle': 0.,
            'border_style': 1,
            'outline': 2.,
            'shadow': 0.,
            'alignment': 2,
            'margin_left': 10,
            'margin_right': 10,
            'margin_vertical': 10,
            'encoding': 1,
        }
        # Update and override if necessary
        style.update(content)
        return style


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
        del self.rooms[name]

    def all(self):
        return list(self.rooms.values())

    def save(self):
        app_log.debug("Saving all files")
        for room in self.all():
            room.save()


