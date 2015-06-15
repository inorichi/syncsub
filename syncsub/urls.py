# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

from django.conf.urls import include, url
from django.conf import settings
from django.contrib import admin

from utils.router import SharedRouter

import users.urls
import explorer.urls

def api_urls():
    return SharedRouter.shared_router.urls


urlpatterns = [
    url(r'^explorer/', include(explorer.urls)),
#    url(r'^users/', include('users.urls')),
    url(r'^admin/', include(admin.site.urls)),
    url(r'^api/', include(api_urls())), 
    url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework'))
]
