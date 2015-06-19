# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

from tornado.log import gen_log, app_log

from .base import BaseHandler, Request


def get_selected_line(func):
    def wrapper(handler, req, line=None):
        if req.client.locked_line:
            line = req.client.locked_line
            return func(handler, req, line)

        req.reply_error("Invalid line")

    return wrapper


def get_line_by_id(func):
    def wrapper(handler, req, line={}):
        try:
            if req.client.subs:
                line = req.client.subs[req.content['id']]
            return func(handler, req, line)
        except KeyError:
            req.reply_error("Invalid line")

    return wrapper


class LineHandler(BaseHandler):
    def __init__(self):
        self.name = 'line'

    @get_line_by_id
    def add(self, req, line):
        new_line = req.client.room.create_line({
            'start': line.get('start', '0:00:00.00'),
            'end': line.get('end', '0:00:02.00'),
            'style': line.get('style', 'Default'),
        })

        line_pos = req.client.room.subs_order.index(line['id']) if line else 0

        msg = req.content

        if line and msg.get('pos') == 'after':
            line_pos += 1

        req.client.room.add_line(new_line, line_pos)
        gen_log.debug('CURRENT STATE: %s' % req.client.room.subs_order)

        msg['line'] = new_line
        req.send_to_all(msg)

    @get_selected_line
    def update(self, req, line):
        line['txt'] = req.content['txt']
        req.content['id'] = line['id']

        req.reply_and_send_to_partners(req.content)

    @get_line_by_id
    def delete(self, req, line):
        if 'locked' in line and line['locked'] == 1 and req.client.locked_line != line:
            req.reply_error("You can't delete lines edited by other")
            return

        req.client.room.del_line(line)
        req.reply_and_send_to_partners(req.content)

        gen_log.debug('CURRENT STATE: %s' % req.client.room.subs_order)
       
        if not req.client.subs:
            self.add(Request(req.client, {
                'service': self.name,
                'action': 'add',
                'content': {'id': 0},
            }))

    def init(self, req):
        content = [req.client.subs[x] for x in req.client.room.subs_order]
        req.reply(content)

    @get_line_by_id
    def lock(self, req, line):
        # TODO Allow to edit the same line?
        if 'locked' not in line or line['locked'] == 0:
            if req.client.locked_line:
                msg_unlock = {'action': 'unlock', 'id': req.client.locked_line['id']}
                self.unlock(Request(req.client, {
                    'service': self.name,
                    'action': 'unlock',
                    'content': {'id': req.client.locked_line['id']}
                }))

            line['locked'] = 1
            req.client.locked_line = line
            req.reply()

    @get_selected_line
    def unlock(self, req, line):
        if line['locked'] == 1:
            line['locked'] = 0
            req.client.locked_line = None
            # client.send(msg)

    @get_selected_line
    def updateTime(self, req, line):
        msg = req.content
        
        line[msg['pos']] = msg['time']

        msg['id'] = line['id']

        req.reply_and_send_to_partners(msg)

    @get_selected_line
    def changeStyle(self, req, line):
        msg = req.content

        if 'style' not in msg or msg['style'] == '?':
            error = "Style can't be empty"
            req.reply_error("Style can't be empty")
            return

        line['style'] = msg['style']

        msg['id'] = line['id']

        req.reply_and_send_to_partners(msg)

    @get_selected_line
    def toggleComment(self, req, line):
        line['comment'] = 0 if line['comment'] else 1

        msg = req.content
        msg['id'] = line['id']
        msg['comment'] = line['comment']

        req.reply_and_send_to_partners(msg)

