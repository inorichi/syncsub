// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

module.exports = function($scope, $sce, VideoService) {

    $scope.videoUrl = null;
    $scope.isVideoOpen = false;

    var urlPattern = /^http(s)?:\/\/(www\.)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*\.(mp4|mkv))?$/;

    $scope.$on('open-video', function(ev, url) {
        if ($scope.isVideoOpen || !url)
            return;

        if (url.startsWith('blob:')) {
            $scope.isVideoOpen = true;
            $scope.videoUrl = $sce.trustAsResourceUrl(url);
            $scope.$digest();
        }
        else {
            if (!$scope.isValidUrl(url))
                return;

            $scope.videoUrl = $sce.trustAsResourceUrl(url);
            $scope.isVideoOpen = true;
        }
    });

    $scope.$on('close-video', function() {
        $scope.videoUrl = null;
        $scope.isVideoOpen = false;
    });

    $scope.isValidUrl = function(url) {
        //FIXME
        return true;
    }

};

