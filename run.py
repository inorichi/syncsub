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
from django.core.wsgi import get_wsgi_application

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
    django_app = get_wsgi_application()

    # Only load syncsub after django is initialized
    from syncsub.subs.websocket import SubsWebSocketHandler, SubsSavePeriodicCallback

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

    subtitles_save_scheduler = SubsSavePeriodicCallback(SUBTITLES_SAVE_INTERVAL)
    subtitles_save_scheduler.start()
    main_loop.start()


if __name__ == "__main__":
    main()

