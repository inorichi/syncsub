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
from tornado.options import define, options, parse_command_line
from tornado.log import app_log, gen_log

from syncsub.subs.websocket import SubsWebSocketHandler, room_manager

from settings import *


def define_arguments():
    define("port", default=PORT, help="run on the given port", type=int)
    define("debug", default=DEBUG, help="debug mode")


def main():
    # Parse command line arguments
    define_arguments()
    parse_command_line()

    # Set django settings module and get the wsgi app
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", get_django_settings(options.debug))
    from syncsub.wsgi import application as django_app

    # Apply settings after django is configured
    set_from_django_settings()

    handlers = [
        (r'/ws', SubsWebSocketHandler),
        (r'.*', tornado.web.FallbackHandler, {
            'fallback': tornado.wsgi.WSGIContainer(django_app)
        }),
    ]

    application = tornado.web.Application(handlers, **TORNADO_SETTINGS)

    http_server = tornado.httpserver.HTTPServer(application, xheaders=True)
    http_server.listen(options.port)

    main_loop = tornado.ioloop.IOLoop.instance()

    if options.debug:
        app_log.setLevel(logging.DEBUG)
        tornado.autoreload.start(main_loop)

    subtitles_interval_ms = SUBTITLES_SAVE_INTERVAL * 1000 # in milliseconds
    main_loop = tornado.ioloop.IOLoop.instance()
    scheduler = tornado.ioloop.PeriodicCallback(room_manager.save, subtitles_interval_ms, io_loop=main_loop)
    scheduler.start()
    main_loop.start()


if __name__ == "__main__":
    main()

