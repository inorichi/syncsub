# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

from tornado.log import gen_log

class BaseHandler(object):
    def __init__(self, name):
        self.name = name

    def process_message(self, client, msg):
        try:
            action = msg['action']
        except KeyError:
            gen_log.warning("Malformed message from client %s: %s"
                            % (client.remote_address, msg))
            return

        method = getattr(self, action, None)
        if method is not None:
            req = Request(client, msg)
            if method(req) and not client.room.changed:
                client.room.changed = True

        else:
            gen_log.warning('Message for non existing method from client %s: %s'
                    % (client.remote_address, msg))

    def reply(self, client, msg):
        client.send({
            'callId': msg['callId'],
            'service': self.name,
            'action': msg['action']
        })

    def send_to_partners(self, client, msg):
        if 'callId' in msg:
            msg.pop('callId')

        for partner in client.room.clients:
            if partner is not client:
                partner.send(msg)

    def reply_and_send_to_partners(self, client, msg):
        self.reply(client, msg)
        self.send_to_partners(client, msg)

    def send_to_all(self, client, msg):
        if 'callId' in msg:
            msg.pop('callId')

        for a_client in client.room.clients:
            a_client.send(msg)

    def reply_error(self, client, msg, error=''):
        client.send({
            'callId': msg['callId'],
            'service': self.name,
            'action': msg['action'],
            'error': error
        })


class Request(object):
    __slots__ = ('client', 'service', 'action', 'content', 'call_id')

    def __init__(self, client, msg):
        self.client = client
        self.service = msg['service']
        self.action = msg['action']
        self.content = msg.get('content', None)
        self.call_id = msg.get('callId', None)

    def reply(self, content=None):
        msg = {
            'service': self.service,
            'action': self.action,
        }
        if self.call_id:
            msg['callId'] = self.call_id

        if content:
            msg['content'] = content

        self.client.send(msg)

    def reply_error(self, error=''):
        msg = {
            'service': self.service,
            'action': self.action,
            'error': error
        }
        if self.call_id:
            msg['callId'] = self.call_id

        self.client.send(msg)

    def send_to_partners(self, content):
        msg = {
            'service': self.service,
            'action': self.action,
            'content': content
        }

        for partner in self.client.room.clients:
            if partner is not self.client:
                partner.send(msg)

    def reply_and_send_to_partners(self, content):
        self.reply()
        self.send_to_partners(content)

    def send_to_all(self, content):
        msg = {
            'service': self.service,
            'action': self.action,
            'content': content
        }

        for client in self.client.room.clients:
            client.send(msg)

