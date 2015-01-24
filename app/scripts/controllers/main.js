'use strict';

angular.module('famousAngular')
  .controller('MainCtrl', ['$log', '$scope', '$resource', '$http',
    function ($log, $scope, $resource, $http) {
      $scope.dummy = '';
    }])

  .controller('FeedbackCtrl', ['$log', '$scope', '$resource', '$http', '$rootScope', 'auth', 'Settings', '$timeout',
    function ($log, $scope, $resource, $http, $rootScope, auth, Settings, $timeout) {

      var self = this;

      Settings.then(function (data) {
        self.conf = data;
      });

      $scope.postFeedback = function () {
        $http.post(self.conf.API_BASEURL + '/mail/feedback', {feedback_text: $scope.feedback.text}).then(function () {
          $scope.success = true;
          $timeout(function () {
            $scope.feedbackForm.$setPristine();
            $scope.feedback.text = null;
            $scope.success = null;
          }, 5000);
        });
      };

    }])

  .controller('LearnCtrl', ['$log', '$scope', '$resource', '$http', '$rootScope', 'auth', '$timeout',
    function ($log, $scope, $resource, $http, $rootScope, auth, $timeout) {

      var AutoUnit = $resource($scope.conf.API_BASEURL + '/unit_items/auto_generate');
      var Unit = $resource($scope.conf.API_BASEURL + '/unit_items/get_unit');

      var tipDefaultLength = 2;

      $scope.dots = '..................................................';

      $scope.unitEmpty = true;
      $scope.unitMode = 'lang';
      $scope.swapMode = false;


      // mode helper
      $scope.modeHelpers = {
        all: {
          pickFilter: function (filter) {
            $scope.modeHelpers.all.filterSelected = filter;
          },
          availableFilters: [
            {
              identifier: 'random',
              name: 'Random Pick'
            },
            {
              identifier: 'learned-',
              name: 'Less Learned'
            },
            {
              identifier: 'missed-',
              name: 'Mostly Missed'
            },
            {
              identifier: 'learned+',
              name: 'Last Learned'
            },
            {
              identifier: 'updated+',
              name: 'Last Edited'
            },
            {
              identifier: 'created+',
              name: 'Last Created'
            }
          ]
        }
      };

      $scope.modeHelpers.all.filterSelected = $scope.modeHelpers.all.availableFilters[0];

      // @TODO resolve
      $scope.$watch('units', function (newVal) {
        if (angular.isDefined(newVal)) {
          if ($scope.units.length > 0) {
            $scope.queryUnit = $scope.units[0];
            $scope.preFetchUnit($scope.queryUnit);
          }
        }
      });

      $scope.n_items = 12;
      $scope.shuffle = true;
      $scope.sort_least_learned = false;

      $scope.startUnit = function () {
        $scope.noItems = false;
        $scope.show = false;
        $scope.interactive = true;
        $scope.variant = false;
        $scope.tipLength = tipDefaultLength;
        switch ($scope.unitMode) {
          case 'lang':
            $scope.request = {pending: true};
            // fetch the custom unit
            AutoUnit.get({
                shuffle: true,
                // choose the selected filter
                filter: $scope.modeHelpers.all.filterSelected.identifier,
                n_items: $scope.n_items, // works but in ui missing or commented out
                user_id: auth.profile.user_id,
                language_id: $scope.lang.from.id,
                targetlang_id: $scope.lang.to.id
              },
              function (success) {
                $log.debug('unit/lang:', success);
                $scope.request = {pending: false};
                $scope.unit_items = success.data.unit_items;
                if (!$scope.unit_items.length) {
                  $scope.noItems = true;
                  $('#noItems').modal();
                  $timeout(function () {
                    $scope.noItems = false;
                    $scope.stopUnit();
                    $('#noItems').modal('hide');
                    return;
                  }, 3000);
                } else {
                  $scope.unit = { inProgress: true, idx: 0, finished: false };
                }
              });
            break;
          case 'unit':
            $scope.unit = { inProgress: true, idx: 0, finished: false };
            break;
        }
        $scope.tooltips();
      };

      $scope.preFetchUnit = function (unit) {
        $scope.queryUnit = unit;

        Unit.get({
            shuffle: $scope.shuffle,
            unit_id: $scope.queryUnit.id
          },

          function (success) {
            $scope.request = {pending: false};
            $scope.unit_items = success.data.unit_items;
            $scope.unitEmpty = !$scope.unit_items.length;
            $scope.containing_langs = null;
            $scope.containing_langs = success.data.langs;
            $log.debug($scope.containing_langs);
          });

      };

      $scope.stopUnit = function () {
        $scope.unit = { inProgress: false, idx: 0 };
        $scope.tipLength = tipDefaultLength;
        $scope.show = false;
        $scope.swapMode = false;
        $scope.containing_langs = null;
        $scope.unit_items = null;
        $scope.queryUnit = $scope.units[0];
        $scope.preFetchUnit($scope.queryUnit);
      };

      $scope.swap = function () {
        $scope.swapMode = !$scope.swapMode;
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
        //console.log(event);
      };

      function proceed(){
        // downgrade "learn need" score
        $scope.input = null;
        if ($scope.unit.idx !== $scope.unit_items.length - 1) {
          $('[name="inputForm"] #query').focus();
          $scope.next();
        } else {
          $scope.unit.finished = true;
        }
      }

      $scope.validator = function (input, model) {
        if (angular.equals(input, model.to.name)) {

          // tag translation as learned
          if (!$scope.variant) {
            $('#match').modal({});
            $timeout(function () {
              $('#match').modal('hide');
              proceed();
            }, 2000);
          }

          if ($scope.variant) {
            $scope.match = true;
            $timeout(function () {
              $scope.match = false;
              proceed();
            }, 2000);
          }

          return;
        }

        if (!$scope.variant) {
          $('#noMatch').modal({});
          $timeout(function () {
            $('#noMatch').modal('hide');
            $('[name="inputForm"] #query').focus();
          }, 2000);
        }

        if ($scope.variant) {
          $scope.noMatch = true;
          $timeout(function () {
            $scope.noMatch = false;
            if ($scope.tipLength < $scope.unit_items[$scope.unit.idx].to.name.length) {
              $scope.tipLength += 1;
            }
          }, 2000);
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
