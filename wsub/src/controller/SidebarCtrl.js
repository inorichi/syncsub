// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

var assUtils = require('../utils/assUtils');

module.exports = function($scope, VideoService, DataService, ImportService, ngDialog) {

    $scope.isVideoOpen = false;

    $scope.editStyles = function() {
        ngDialog.openConfirm({
            templateUrl: '/static/templates/stylesModal.html',
            controller: 'StylesModalInstance',
            className: 'ngdialog-theme-plain'
        });
    };

    $scope.$on('open-video', function() {
        $scope.$apply(function() {
            $scope.isVideoOpen = true;
        });
    });

    $scope.$on('close-video', function() {
        $scope.isVideoOpen = false;
    });

    $scope.openVideoFromFile = function(input) {
        if (input.files.length == 0) { return; }

        var file = input.files[0];
        var url = URL.createObjectURL(file);
        VideoService.openVideo(url);
    }

    $scope.openVideoFromUrl = function() {
        var url = window.prompt("Enter the url to the video");
        VideoService.openVideo(url);
    }

    $scope.closeVideo = function() {
        VideoService.closeVideo();
    }

    $scope.saveFile = function() {
        var filename = "subtitles.ass";
        
        if (VideoService.videoUrl != null) {
            var url = VideoService.videoUrl;
            var lastSlashPos = url.lastIndexOf('/');
            var extensionDotPos = url.lastIndexOf('.');

            if (lastSlashPos != -1 && extensionDotPos != -1) {
                filename = url.substring(lastSlashPos + 1, extensionDotPos) + ".ass";
            }
        }
        
        var content = assUtils.convertToAss(DataService.getData());
        var blob = new Blob([content], {type: "text/plain;charset=utf-8"});

        saveAs(blob, filename);
    }

    $scope.importFile = function(input) {
        if (input.files.length == 0) { return; }

        var file = input.files[0];
        var type = null;

        if (file.type == 'text/x-ssa') {
            type = 'ass';
        } else if (file.type == 'application/x-subrip') {
            type = 'srt';
        } else {
            alert('Invalid file');
            return;
        }

        var reader = new FileReader();
        reader.readAsText(file, "UTF-8");
        reader.onload = function(ev) {
            console.log(ev.target.result);
            ImportService.requestImport(type, ev.target.result);
        }
    }
};

