# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

from tornado.log import gen_log

from .base import BaseHandler, Request
from ..utils import create_style


def get_style_or_error(func):
    def wrapper(handler, req, style=None):
        for style in req.client.styles:
            if req.content['name'] == style['name']:
                return func(handler, req, style)

        req.reply_error("The style doesn't exist")

    return wrapper


class StyleHandler(BaseHandler):
    def __init__(self):
        self.name = 'style'

    def add(self, req):
        if self.get_style(req):
            req.reply_error("The style already exist")
            gen_log.info('Style %s already exists' % req.content['name'])
            return

        style = create_style(req.content['name'])
        req.client.styles.append(style)
        req.content['style'] = style

        req.send_to_all(style)
        return True

    @get_style_or_error
    def update(self, req, style):
        for key, value in req.content['style'].items():
            # Only save allowed attributes
            if key in style:
                style[key] = value

        req.content['style'] = style

        req.reply_and_send_to_partners(req.content)
        return True

    @get_style_or_error
    def rename(self, req, style):
        for key, value in req.content['style'].items():
            # Only save allowed attributes
            if key in style:
                style[key] = value

        req.content['style'] = style

        req.reply_and_send_to_partners(req.content)
        return True

    @get_style_or_error
    def delete(self, req):
        req.client.styles.remove(style)

        req.reply_and_send_to_partners(req.content)

        if not client.styles:
            self.add(Request(req.client, {
                'service': self.name,
                'action': 'add',
                'content': {'name': 'Default'}
            }))
        return True

    def init(self, req):
        if not req.client.styles:
            style = create_style('Default')
            req.client.styles.append(style)

            # FIXME temporary style
            another_style = create_style('Test')
            req.client.styles.append(another_style)

        req.reply(req.client.styles)

