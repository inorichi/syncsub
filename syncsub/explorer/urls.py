# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

from django.conf.urls import url

from utils.router import SharedRouter
from . import views


router = SharedRouter()
router.register(r'folders', views.FolderViewSet)
router.register(r'folders-view-perm', views.FolderViewPermsSet, 'view-perm')
router.register(r'files', views.FileViewSet)


urlpatterns = [
    url(r'^$', views.item_view, {'slug': ''}, name='item-view'),
    url(r'^(?P<slug>[\w/ -]+)/$', views.item_view, name='item-view'),
]
