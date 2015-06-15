// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

app = angular.module('explorer', ['restangular', 'ngDialog', 'ngCookies','dual-select']);

app.config(function(RestangularProvider, $cookiesProvider) {

    RestangularProvider.setBaseUrl('/api');
    RestangularProvider.setRequestSuffix('/');
    RestangularProvider.setDefaultHeaders({
        'X-CSRFToken': $cookiesProvider.$get()["csrftoken"],
    });
});


app.factory('apiService', function(Restangular, currentFolder) {
    var service = {};

    service.getFolder = function() {
        return Restangular.one('folders', currentFolder).get();
    }

    service.getViewAccess = function() {
        return Restangular.one('folders-view-perm', currentFolder).get();
    }

    service.saveUsers = function(users) {
        return Restangular.one('folders-view-perm', currentFolder).customPUT({
            'users': users
        });
    }

    service.saveGroups = function(groups) {
        return Restangular.one('folders-view-perm', currentFolder).customPUT({
            'groups': groups
        });
    }

    service.createFolder = function(name) {
        return Restangular.all('folders').post({
            'name': name,
            'parent': currentFolder
        });
    }

    service.createFile = function(name) {
        return Restangular.all('files').post({
            'name': name,
            'parent': currentFolder
        });
    }

    return service;
});

app.controller('folderCtrl', function($scope, apiService) {
    apiService.getFolder().then(function(folder) {
        $scope.folder = folder;
    });
});

app.controller('itemCtrl', function($scope) {
    $scope.go = function(url) {
        location.href = url
    }
});

app.controller('managementCtrl', function($scope, apiService, ngDialog) {
    $scope.openUserPerms = function() {
        ngDialog.openConfirm({
            template: 'userPermTemplate',
            controller: 'userPermCtrl',
            className: 'ngdialog-theme-plain'
        });
    }

    $scope.openGroupPerms = function() {
        ngDialog.openConfirm({
            template: 'groupPermTemplate',
            controller: 'groupPermCtrl',
            className: 'ngdialog-theme-plain'
        });
    }

    $scope.newFolder = function() {
        ngDialog.open({
            template: 'newFolderTemplate',
            controller: 'newFolderCtrl',
            className: 'ngdialog-theme-plain'
        })
    }

    $scope.newFile = function() {
        ngDialog.open({
            template: 'newFileTemplate',
            controller: 'newFileCtrl',
            className: 'ngdialog-theme-plain'
        })
    }
});

app.controller('userPermCtrl', function($scope, apiService) {
    apiService.getViewAccess().then(function(response) {
        $scope.folder = response;
        $scope.users = response.users
        $scope.availableUsers = response.available_users;
    });

    $scope.save = function() {
        return apiService.saveUsers($scope.users).then(function(resp) {
            return true;
        });
    };

});

app.controller('groupPermCtrl', function($scope, apiService) {
    apiService.getViewAccess().then(function(response) {
        $scope.folder = response;
        $scope.groups = response.groups
        $scope.availableGroups = response.available_groups;
    });

    $scope.save = function() {
        return apiService.saveGroups($scope.groups).then(function(resp) {
            return true;
        });
    };
});

app.controller('newFolderCtrl', function($scope, apiService) {
    $scope.folder = { 'name': null };

    $scope.save = function() {
        return apiService.createFolder($scope.folder.name).then(function(resp) {
            location.reload();
        }, function(resp) {
            if ("non_field_errors" in resp.data) {
                $scope.error = "This folder already exists";
            }
        })
    }
});

app.controller('newFileCtrl', function($scope, apiService) {
    $scope.file = { 'name': null };

    $scope.save = function() {
        return apiService.createFile($scope.file.name).then(function(resp) {
            location.reload();
        }, function(resp) {
            if ("non_field_errors" in resp.data) {
                $scope.error = "This file already exists";
            }
        })
    }
});
