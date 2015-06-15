# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

from django import forms
from django.contrib import admin

from guardian.admin import GuardedModelAdmin

from . import models


@admin.register(models.File)
class FileAdmin(GuardedModelAdmin):
    pass


class FolderAdminForm(forms.ModelForm):
    class Meta:
        model = models.Folder
        fields = ('name', 'parent')


@admin.register(models.Folder)
class FolderAdmin(GuardedModelAdmin):
    pass

