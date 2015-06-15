# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

from collections import OrderedDict
import json

from tornado.log import gen_log

from .base import BaseHandler, Request


refs = {
    'Name': 'name',
    'Fontname': 'font',
    'Fontsize': 'size',
    'PrimaryColour': 'primary_color',
    'SecondaryColour': 'secondary_color',
    'OutlineColour': 'outline_color',
    'BackColour': 'back_color',
    'Bold': 'bold',
    'Italic': 'italic',
    'Underline': 'underline',
    'StrikeOut': 'strike_out',
    'ScaleX': 'scale_x',
    'ScaleY': 'scale_y',
    'Spacing': 'spacing',
    'Angle': 'angle',
    'BorderStyle': 'border_style',
    'Outline': 'outline',
    'Shadow': 'shadow',
    'Alignment': 'alignment',
    'MarginL': 'margin_left',
    'MarginR': 'margin_right',
    'MarginV': 'margin_vertical',
    'Encoding': 'encoding',
    'Layer': 'layer',
    'Start': 'start',
    'End': 'end',
    'Style': 'style',
    'Effect': 'effect',
    'Text': 'txt',
}

class ImportHandler(BaseHandler):
    def __init__(self):
        self.name = 'import'

    def ass(self, req):
        script = req.content.splitlines()

        if '[Script Info]' != script[0]:
            req.reply_error('Invalid script')
            return

        i = 1
        while not script[i].startswith('['):
            i += 1

        properties = self._parse_properties(script[1:i])

        if '[V4+ Styles]' != script[i]:
            req.reply_error('Invalid script')
            return

        j = i + 1
        while not script[j].startswith('['):
            j += 1

        styles = self._parse_styles(script[i+1], script[i+2:j])

        if '[Events]' != script[j]:
            req.reply_error('Invalid script')
            return

        lines = self._parse_lines(req, script[j+1], script[j+2:])


        #print(json.dumps(properties, indent=4, sort_keys=True))
        #print(json.dumps(styles, indent=4, sort_keys=True))
        #print(json.dumps(lines, indent=4, sort_keys=True))

        for style in styles:
            found = False
            for script_style in req.client.styles:
                if style['name'] == script_style['name']:
                    for key, value in style.items():
                        script_style[key] = value
                    found = True
                    break

            if not found:
                req.client.styles.append(style)

        for x in lines.keys():
            req.client.room.add_line(lines[x])

        req.send_to_all({ 
            'lines': [lines[x] for x in lines.keys()],
            'styles': req.client.styles
        })


    def srt(self, req):
        raise NotImplemented


    def _parse_properties(self, properties):
        properties_dict = {}

        for prop in properties:
            if prop and not prop.startswith(';'):
                key, value = self._parse_property(prop)
                properties_dict[key] = value

        return properties_dict

    def _parse_styles(self, template, styles):
        try:
            pattern = [refs[attr.rstrip(',')] for attr in template.split(' ')[1:]]
        except KeyError:
            gen_log.error('Unsupported attribute found in styles')

        styles_arr = []

        for style in styles:
            if style:
                styles_arr.append(self._parse_style(pattern, style))

        return styles_arr

    def _parse_lines(self, req, template, lines):
        try:
            pattern = [refs[attr.rstrip(',')] for attr in template.split(' ')[1:]]
        except KeyError:
            gen_log.error('Unsupported attribute found in events')

        lines_dict = OrderedDict()

        for line in lines:
            if line:
                line_id = req.client.room.get_next_id()
                lines_dict[line_id] = self._parse_line(pattern, line, line_id)

        return lines_dict

    def _parse_property(self, prop):
        key, value = prop.split(':')
        return key.strip(), value.strip()

    def _parse_style(self, pattern, style):
        style = style[style.find(':')+1:].strip()

        style_dict = {}

        for key, value in zip(pattern, style.split(',')):
            if 'color' in key:
                style_dict[key] = self._parse_color(value)
            else:
                style_dict[key] = value

        return style_dict

    def _parse_line(self, pattern, line, line_id):
        line_dict = {}
        line_dict['id'] = line_id
        line_dict['comment'] = 1 if line.startswith('Comment') else 0

        line = line[line.find(':')+1:].strip()

        attrs = line.split(',', len(pattern) - 1)

        for key, value in zip(pattern, attrs):
            line_dict[key] = value

        return line_dict

    def _parse_color(self, color):
        parts = color[2:]
        a = 255 - int(parts[:2], 16)
        b = parts[2:4]
        g = parts[4:6]
        r = parts[6:]

        return r + g + b + "%0.2X" % a
        


