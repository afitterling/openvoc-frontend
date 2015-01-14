'use strict';

angular.module('famousAngular')
  .controller('MainCtrl', ['$log', '$scope', '$resource', '$http',
    function ($log, $scope, $resource, $http) {
      $scope.dummy = '';
    }])

  .controller('FeedbackCtrl', ['$log', '$scope', '$resource', '$http', '$rootScope', 'auth', 'Settings', '$timeout',
    function ($log, $scope, $resource, $http, $rootScope, auth, Settings, $timeout) {

      var self = this;

      Settings.then(function(data) {
        self.conf = data;
      });

      $scope.postFeedback = function () {
        $http.post(self.conf.API_BASEURL + '/mail/feedback', {feedback_text: $scope.feedback.text}).then(function () {
          $scope.success = true;
          $timeout(function () {
            $scope.feedbackForm.$setPristine();
            $scope.feedback.text = null;
            $scope.success = null;
          }, 3000);
        });
      };

    }])

  .controller('LearnCtrl', ['$log', '$scope', '$resource', '$http', '$rootScope', 'auth',
    function ($log, $scope, $resource, $http, $rootScope, auth) {

      var AutoUnit = $resource($scope.conf.API_BASEURL + '/unit_items/auto_generate');
      var Unit = $resource($scope.conf.API_BASEURL + '/unit_items/get_unit');

      var tipDefaultLength = 2;

      $scope.dots = '..................................................';

      $scope.unitMode = 'lang';
      $scope.swapMode = false;

      // @TODO resolve
      $scope.$watch('units', function (newVal) {
        if (angular.isDefined(newVal)) {
          $scope.queryUnit = $scope.units[0];
        }
      });

      $scope.n_items = 12;
      $scope.shuffle = true;
      $scope.sort_least_learned = false;

      $scope.startUnit = function () {
        switch ($scope.unitMode) {
          case 'lang':
            $scope.request = {pending: true};
            // fetch the custom unit
            AutoUnit.get({
                shuffle: $scope.shuffle,
                n_items: $scope.n_items, // works but in ui missing or commented out
                user_id: auth.profile.user_id,
                language_id: $scope.lang.from.id,
                targetlang_id: $scope.lang.to.id
              },
              function (success) {
                $scope.request = {pending: false};
                $scope.unit_items = success.data.unit_items;
                $scope.unit = { inProgress: true, idx: 0, finished: false };
                $scope.show = false;
                $scope.interactive = true;
                $scope.variant = true;
                $scope.tipLength = tipDefaultLength;
              });
            break;
          case 'unit':
            Unit.get({
                shuffle: true,
                unit_id: $scope.queryUnit.id
              },
              function (success) {
                $scope.request = {pending: false};
                $scope.unit_items = success.data.unit_items;
                $scope.containing_langs = null;
                $scope.containing_langs = success.data.langs;
                $log.debug($scope.containing_langs);
                $scope.unit = { inProgress: true, idx: 0, finished: false };
                $scope.show = false;
                $scope.interactive = true;
                $scope.variant = true;
                $scope.tipLength = tipDefaultLength;
              });
            break;
        }
        ;
        $(function () {
          $('[data-toggle="tooltip"]').tooltip();
        })
      };

      $scope.stopUnit = function () {
        $scope.unit = { inProgress: false, idx: 0 };
        $scope.tipLength = tipDefaultLength;
        $scope.show = false;
        $scope.swapMode = false;
        $scope.containing_langs = null;
      };

      $scope.swap = function () {
        $scope.swapMode = !$scope.swapMode;
        console.log($scope.swapMode);
        var swappedItems = [];
        angular.forEach($scope.unit_items, function (item) {
          var tmp = item.from;
          item.from = item.to;
          item.to = tmp;
          swappedItems.push(item);
        }, swappedItems);
        $scope.unit_items = swappedItems;

        // swap containinglangs
        if ($scope.containing_langs) {

          var swapped_langs = [];
          angular.forEach($scope.containing_langs, function (item) {
            this.push({from: item.to, to: item.from});
          }, swapped_langs);
          $scope.containing_langs = swapped_langs;
        }
//        console.log($scope.containing_langs, swapped_langs);
      };

      var reverseModeCounter = 0;
      $scope.next = function () {
        if ($scope.reverseMode && reverseModeCounter === 0) {
          reverseModeCounter += 1;
          $scope.tipLength = tipDefaultLength;
          var tmp = $scope.unit_items[$scope.unit.idx].from;
          $scope.unit_items[$scope.unit.idx].from = $scope.unit_items[$scope.unit.idx].to;
          $scope.unit_items[$scope.unit.idx].to = tmp;
          $scope.show = false;
          return;
        }
        //
        if (!$scope.reverseMode || reverseModeCounter > 0) {
          reverseModeCounter = 0;
          $scope.unit.idx += 1;
          $scope.tipLength = tipDefaultLength;
          $scope.show = false;
        }
      };

      $scope.prev = function () {
        $scope.unit.idx -= 1;
        $scope.tipLength = tipDefaultLength;
        $scope.show = false;
      };

      $scope.showItem = function () {
        $scope.show = !$scope.show;
      };

      $scope.keyTrigger = function (event) {
        console.log(event);
      };

      $scope.validator = function (input, model) {
        if (angular.equals(input, model.to.name)) {
          $scope.input = null;
          // tag translation as learned

          // downgrade "learn need" score
          if ($scope.unit.idx !== $scope.unit_items.length - 1) {
            $scope.next();
          } else {
            $scope.unit.finished = true;
          }
          return;
        }

        if ($scope.tipLength < $scope.unit_items[$scope.unit.idx].to.name.length) {
          $scope.tipLength += 1;
        }
      };

      // monkey patch swapLanguages as we are in a sub scope
      $scope.swapLanguages = function () {
        var temp = $scope.lang.from;
        $scope.lang.from = $scope.lang.to;
        $scope.lang.to = temp;
      };

      $scope.getLang = function (lang_id) {
        var lang = null;
        angular.forEach($scope.languages, function (ll) {
          if (angular.equals(lang_id, ll.id)) {
            lang = ll;
          }
        });
        return lang;
      };

    }])
;
