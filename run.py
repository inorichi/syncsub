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

from settings import settings, save_time
from wsgi import application as django_app
from syncsub.subs.websocket import SubsWebSocketHandler, room_manager


def main():
    parse_command_line()

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
    main_loop = tornado.ioloop.IOLoop.instance()
    if options.debug:
        tornado.autoreload.start(main_loop)

    interval_ms = save_time * 60 * 1000 # in milliseconds
    main_loop = tornado.ioloop.IOLoop.instance()
    scheduler = tornado.ioloop.PeriodicCallback(room_manager.save, interval_ms, io_loop=main_loop)
    scheduler.start()
    main_loop.start()


if __name__ == "__main__":
    main()

