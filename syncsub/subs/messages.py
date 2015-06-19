# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

import json

from tornado.log import gen_log

from .services.line import LineHandler
from .services.style import StyleHandler
from .services.file_import import ImportHandler


services = [LineHandler, StyleHandler, ImportHandler]

class MessageHandler(object):
    def __init__(self):
        self.services = {}

        for service in services:
            instance = service()
            self.register_service(instance)

    def register_service(self, service):
        self.services[service.name] = service

    def unregister_service(self, service):
        del self.services[service.name]

    def process_message(self, client, msg):
        try:
            gen_log.debug("Received from WS: %s" % msg)
            msg = json.loads(msg)
        except ValueError:
            gen_log.warning("Received message not in json from client %s: %s"
                            % (client.remote_address, msg))
            return

        try:
            service_name = msg['service']
        except KeyError:
            gen_log.warning("Malformed message from client %s: %s"
                           % (client.remote_address, msg))
            return

        try:
            service = self.services[service_name]
        except KeyError:
            gen_log.warning(
                'Message for non existing service "%s" from client %s'
                % (service_name, client.remote_address))
            return

        service.process_message(client, msg)
