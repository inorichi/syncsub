# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

import os
import logging

import tornado.httpserver
import tornado.ioloop
import tornado.autoreload
import tornado.web
import tornado.wsgi
from tornado.options import options, parse_command_line
from tornado.log import app_log


from settings import settings
from wsgi import application as django_app
from syncsub.subs.subs import SubsWebSocketHandler


def main():
    handlers = [
        (r'/ws', SubsWebSocketHandler),
        (r'.*', tornado.web.FallbackHandler, {
            'fallback': tornado.wsgi.WSGIContainer(django_app)
        }),
    ]

    if options.debug:
        app_log.setLevel(logging.DEBUG)
        settings["static_path"] = os.path.join(os.path.dirname(__file__), 'syncsub', 'static')

    application = tornado.web.Application(handlers, **settings)

    http_server = tornado.httpserver.HTTPServer(application, xheaders=True)
    http_server.listen(options.port)
    ioloop = tornado.ioloop.IOLoop.instance()
    if options.debug:
        tornado.autoreload.start(ioloop)
        
    ioloop.start()

if __name__ == "__main__":
    parse_command_line()
    main()

