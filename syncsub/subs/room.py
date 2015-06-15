# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

class Room(object):
    def __init__(self, name):
        self.name = name
        self.subs = {}
        self.subs_order = []
        self.styles = []
        self.clients = set()
        self.next_id = max(self.subs.keys()) if self.subs else 0

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

    @classmethod
    def get(cls, name):
        return cls.rooms.get(name)

    @classmethod
    def create(cls, name):
        if cls.get(name) is None:
            room = Room(name)
            cls.rooms[name] = room
            return room

        return None

    @classmethod
    def get_or_create(cls, name):
        room = cls.get(name)
        if room is None:
            return cls.create(name)

        return room

    @classmethod
    def delete(cls, name):
        del cls.rooms[name]


