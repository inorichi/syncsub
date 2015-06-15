# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

from django.shortcuts import render, redirect
from django.views.generic import TemplateView
from django.http import HttpResponseForbidden

from rest_framework import viewsets
from guardian.shortcuts import get_objects_for_user

from . import serializers
from .models import Folder, File, Item


class MultiSerializerViewSetMixin(object):
    def get_serializer_class(self):
        try:
            return self.serializers[self.action]
        except (KeyError, AttributeError):
            return super(MultiSerializerViewSetMixin, self).get_serializer_class()


class FolderView(TemplateView):
    template_name = 'explorer/list.html'
    item = None

    def get_context_data(self, **kwargs):
        context = super(FolderView, self).get_context_data(**kwargs)
        context['item'] = self.item
        context['folders'] = get_objects_for_user(self.request.user, 'explorer.view_folder',
                Folder.objects.filter(parent=self.item))
        context['files'] = File.objects.filter(parent=self.item)
        context['can_create_folder'] = self.request.user.can_create_folder(self.item)

        # TODO permission to create files
        context['can_create_file'] = self.request.user.can_create_file(self.item)
        return context


class FileView(TemplateView):
    template_name = 'subs/index.html'
    item = None

    def get_context_data(self, **kwargs):
        context = super(FileView, self).get_context_data(**kwargs)
        context['file'] = self.item
        return context


def item_view(request, slug):
    item = Item.objects.get_subclass(path=slug)
    if isinstance(item, Folder):
        if not item.is_visible(request.user):
            return HttpResponseForbidden()

        return FolderView.as_view(item=item)(request)
    else:
        if not item.is_visible(request.user):
            return HttpResponseForbidden()

        return FileView.as_view(item=item)(request)


class FolderViewSet(MultiSerializerViewSetMixin, viewsets.ModelViewSet):
    queryset = Folder.objects.all()
    serializer_class = serializers.FolderSerializer
    serializers = {
        'create': serializers.FolderCreateSerializer,
    }


class FileViewSet(MultiSerializerViewSetMixin, viewsets.ModelViewSet):
    queryset = File.objects.all()
    serializer_class = serializers.FileSerializer
    serializers = {
        'create': serializers.FileCreateSerializer,
    }


class FolderViewPermsSet(viewsets.ModelViewSet):
    queryset = Folder.objects.all()
    serializer_class = serializers.FolderViewPermsSerializer

