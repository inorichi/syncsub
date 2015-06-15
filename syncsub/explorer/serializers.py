# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

from django.core.serializers import serialize
from django.contrib.auth.models import Group

from rest_framework import serializers

from .models import File, Folder, Item
from users.models import User


class ItemUrlField(serializers.HyperlinkedIdentityField):
    def __init__(self, *args, **kwargs):
        kwargs['lookup_field'] = 'path'
        kwargs['lookup_url_kwarg'] = 'slug'
        kwargs['read_only'] = True
        kwargs['view_name'] = 'item-view'
        super(ItemUrlField, self).__init__(*args, **kwargs)


class FileSerializer(serializers.ModelSerializer):
    path = ItemUrlField()

    class Meta:
        model = File
        fields = ('id', 'name', 'path')


class SubfolderSerializer(serializers.ModelSerializer):
    path = ItemUrlField()

    class Meta:
        model = Folder
        fields = ('id', 'name', 'path')


class FolderSerializer(serializers.HyperlinkedModelSerializer):
    subfolders = SubfolderSerializer(many=True, read_only=True)
    parent = SubfolderSerializer(read_only=True)
    files = FileSerializer(many=True, read_only=True)

    class Meta:
        model = Folder
        fields = ('id', 'name', 'parent', 'subfolders', 'files')


class FileCreateSerializer(serializers.ModelSerializer):
    parent = serializers.PrimaryKeyRelatedField(queryset=Folder.objects.all())

    class Meta:
        model = File
        fields = ('name', 'parent')


class FolderCreateSerializer(serializers.ModelSerializer):
    parent = serializers.PrimaryKeyRelatedField(queryset=Folder.objects.all())

    class Meta:
        model = Folder
        fields = ('name', 'parent')


class UserSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = User
        fields = ('url', 'username')


class FolderViewPermsSerializer(serializers.HyperlinkedModelSerializer):
    users = serializers.SlugRelatedField(slug_field='username', many=True, required=False, queryset=User.objects.all())
    groups = serializers.SlugRelatedField(slug_field='name', many=True, required=False, queryset=Group.objects.all())

    add_users = serializers.SlugRelatedField(slug_field='username', many=True, queryset=User.objects.all(), required=False, write_only=True)
    del_users = serializers.SlugRelatedField(slug_field='username', many=True, queryset=User.objects.all(), required=False, write_only=True)
    add_groups = serializers.SlugRelatedField(slug_field='name', many=True, queryset=Group.objects.all(), required=False, write_only=True)
    del_groups = serializers.SlugRelatedField(slug_field='name', many=True, queryset=Group.objects.all(), required=False, write_only=True)

    available_users = serializers.SlugRelatedField(slug_field='username', many=True, read_only=True, required=False)
    available_groups = serializers.SlugRelatedField(slug_field='name', many=True, read_only=True, required=False)

    class Meta:
        model = Folder
        fields = ('users', 'groups', 'add_users', 'del_users', 'add_groups', 'del_groups', 'available_users', 'available_groups')

    def update(self, instance, validated_data):
        instance.name = validated_data.get('name', instance.name)
        instance.parent = validated_data.get('parent', instance.parent)

        if 'users' in validated_data.keys():
            new_users = set(validated_data.get('users', instance.users))
            users_to_delete = set(instance.users()) - new_users

            instance.del_view_list(users_to_delete)
            instance.add_view_list(new_users)
        else:
            if 'add_users' in validated_data.keys():
                instance.add_view_list(validated_data.get('add_users', instance.users))

            if 'del_users' in validated_data.keys():
                instance.del_view_list(validated_data.get('del_users', instance.users))

        if 'groups' in validated_data.keys():
            new_groups = set(validated_data.get('groups', instance.groups))
            groups_to_delete = set(instance.groups()) - new_groups

            instance.del_view_list(groups_to_delete)
            instance.add_view_list(new_groups)
        else:
            if 'add_groups' in validated_data.keys():
                instance.add_view_list(validated_data.get('add_groups', instance.groups))

            if 'del_groups' in validated_data.keys():
                instance.del_view_list(validated_data.get('del_groups', instance.groups))

        return instance

