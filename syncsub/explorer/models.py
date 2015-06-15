# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

from django.db import models
from django.db.models import Q
from django.contrib.auth.models import Group

from model_utils.managers import InheritanceManager
from guardian.shortcuts import get_users_with_perms, assign_perm, remove_perm

from .utils import slugify
from users.models import User


class Item(models.Model):
    name = models.CharField(max_length=50)
    parent = models.ForeignKey('Folder', null=True, related_name='items')
    path = models.SlugField(unique=True)

    objects = InheritanceManager()

    def __str__(self):
        return self.name

    @property
    def get_path(self):
        path = []
        current = self
        while current.parent != None:
            path.append((current.name, current.path))
            current = current.parent

        path.reverse()
        return path

    @property
    def is_root_folder(self):
        return self.parent == None

    def save(self, *args, **kwargs):
        self.path = slugify('/'.join([x[0] for x in self.get_path]))
        super(Item, self).save(*args, **kwargs)

    class Meta:
        unique_together = ('name', 'parent')


class Folder(Item):
    class Meta:
        permissions = (
            ("view_folder", "View folder"),
        )

    def is_visible(self, user):
        if self.parent is not None and not user.has_perm('view_folder', self):
            return False

        return True

    def users(self, with_groups=True):
        q = Q(userobjectpermission__permission__codename='view_folder', 
                userobjectpermission__object_pk=self.pk)

        if with_groups:
            q = q | Q(groups__groupobjectpermission__permission__codename='view_folder', 
                groups__groupobjectpermission__object_pk=self.pk)

        return User.objects.filter(q).distinct()

    def available_users(self):
        return User.objects.exclude(id__in=self.users().values_list('id', flat=True))

    def groups(self):
        return Group.objects.filter(groupobjectpermission__permission__codename='view_folder', 
                groupobjectpermission__object_pk=self.pk)

    def available_groups(self):
        return Group.objects.exclude(id__in=self.groups().values_list('id', flat=True))

    def add_view_list(self, users):
        for user in users:
            assign_perm('view_folder', user, self)

    def del_view_list(self, users):
        for user in users:
            remove_perm('view_folder', user, self)

    def subfolders(self):
        return Folder.objects.filter(parent=self)

    def files(self):
        return File.objects.filter(parent=self)


class File(Item):
    def is_visible(self, user):
        if not self.parent.is_root_folder and not user.has_perm('view_folder', self.parent):
            return False

        return True

