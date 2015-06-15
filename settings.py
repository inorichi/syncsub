# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

import os
import logging

from tornado.options import define, options

define("port", default=8000, help="run on the given port", type=int)
define("debug", default=True, help="debug mode")

root = os.path.dirname(__file__)
settings = {}

settings["static_path"] = os.path.join(root, 'syncsub', 'assets')
settings["template_path"] = os.path.join(root, 'syncsub', 'templates')
settings["cookie_secret"] = "secret!"
settings["login_url"] = "/login"
settings["xsrf_cookies"] = False

