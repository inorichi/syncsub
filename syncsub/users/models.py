# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.models import UserManager


class User(AbstractUser):
    class Meta:
        db_table = 'auth_user'

    objects = UserManager()

    def can_create_folder(self, folder):
        if self.is_staff or self.is_superuser \
            or self.has_perm('can_create_folder', folder):
                return True

        return False

    def can_create_file(self, folder):
        if self.is_staff or self.is_superuser \
            or self.has_perm('can_create_file', folder):
                return True

        return False
