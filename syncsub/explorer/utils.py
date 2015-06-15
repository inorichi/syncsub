# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

import re
import unicodedata

from django.utils import six
from django.utils.encoding import force_text
from django.utils.functional import allow_lazy
from django.utils.safestring import SafeText, mark_safe

def slugify(value):
    """
    Converts to ASCII. Converts spaces to hyphens. Removes characters that
    aren't alphanumerics, underscores, or hyphens. Converts to lowercase.
    Also strips leading and trailing whitespace.
    """
    value = force_text(value)
    value = unicodedata.normalize('NFKD', value).encode('ascii', 'ignore').decode('ascii')
    value = re.sub('[^/\w\s-]', '', value).strip().lower()
    return mark_safe(re.sub('[-\s]+', '-', value))

slugify = allow_lazy(slugify, six.text_type, SafeText)
