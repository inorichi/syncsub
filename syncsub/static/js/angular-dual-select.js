(function(angular) {
  'use strict';

  angular.module('dual-select', ["template/dualSelect.html"])
    .directive('dualSelect', ['$q', '$parse', function($q, $parse) {

      return {
        restrict: 'E',
        scope: {
          leftItems: "=",
          rightItems: "=",
          display: "@",
          height: "@",
          width: "@",
          leftWidth: "@",
          rightWidth: "@",
          leftTitle: "@",
          rightTitle: "@"
        },
        templateUrl: "template/dualSelect.html",
        link: function(scope, elm, attrs, controllers) {
          scope.selected = {left: [], right: []};

          scope.moveRight = function() {
            Array.prototype.push.apply(scope.rightItems, scope.selected.left);

            scope.selected.left.forEach(function(sel) {
              var index = scope.leftItems.indexOf(sel);
              scope.leftItems.splice(index, 1);
            })

            scope.selected.left = []
          }

          scope.moveLeft = function() {
            Array.prototype.push.apply(scope.leftItems, scope.selected.right);

            scope.selected.right.forEach(function(sel) {
              var index = scope.rightItems.indexOf(sel);
              scope.rightItems.splice(index, 1);
            })

            scope.selected.right = []
          }

          scope.moveAllRight = function() {
            Array.prototype.push.apply(scope.rightItems, scope.leftItems);
            scope.leftItems.length = 0;
            scope.selected.left = [];
          }

          scope.moveAllLeft = function() {
            Array.prototype.push.apply(scope.leftItems, scope.rightItems);
            scope.rightItems.length = 0;
            scope.selected.right = [];
          }

          scope.renderItem = function(display) {
            if (scope.display !== undefined) {
              return "item." + scope.display;
            }
            if (display === undefined || display == "") {
              return "item";
            }
            return "item." + display;
          };

          scope.setHeight = function(height) {
            if (scope.height !== undefined) {
              return scope.height;
            }
            return "200px";
          }

          scope.setWidth = function(width) {
            if (scope.width !== undefined) {
              return scope.width;
            }
            if (width !== undefined) {
              return width;
            }
            return "300px";
          }
        }
      };
    }]);

  angular.module("template/dualSelect.html", []).run(["$templateCache", function($templateCache) {
    $templateCache.put("template/dualSelect.html",
        '<div class="dualSelect">' +
        '<div class="select">' +
        '<label class="control-label" for="multiSelectSelected">{{ selectedLabel }} ' +
        '({{ model.length }})</label>' +
        '<ul>' +
        '<li ng-repeat="entity in model">' +
        '<label class="checkbox" title="{{ renderTitle(entity) }}">' +
        '<input type="checkbox" ng-model="selected.current[$index].selected"> ' +
        '{{ renderItem(entity) }}' +
        '</label>' +
        '</li>' +
        '</ul>' +
        '</div>' +
        '<div class="select buttons">' +
        '<button class="btn mover left" ng-click="add()" title="Add selected" ' +
        'ng-disabled="!selected(selected.available).length">' +
        '<i class="icon-arrow-left"></i>' +
        '</button>' +
        '<button class="btn mover right" ng-click="remove()" title="Remove selected" ' +
        'ng-disabled="!selected(selected.current).length">' +
        '<i class="icon-arrow-right"></i>' +
        '</button>' +
        '</div>' +
        '<div class="select">' +
        '<label class="control-label" for="multiSelectAvailable">{{ availableLabel }} ' +
        '({{ available.length }})</label>' +
        '<ul>' +
        '<li ng-repeat="entity in available">' +
        '<label class="checkbox" title="{{ renderTitle(entity) }}">' +
        '<input type="checkbox" ng-model="selected.available[$index].selected"> ' +
        '{{ renderItem(entity) }}' +
        '</label>' +
        '</li>' +
        '</ul>' +
        '</div>' +
        '<input type="number" name="numSelected" ng-model="numSelected" ' +
        'style="display: none">' +
        '</div>'
        );
  }])
  ;
})(angular);
