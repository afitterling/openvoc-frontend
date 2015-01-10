'use strict';

angular.module('famousAngular')
  .controller('DataCtrl', ['ValidationActionsStore', '$rootScope', '$timeout', '$log', '$scope', '$resource', '$http', 'Units', 'Words', 'AppStore',
    function (ValidationActionsStore, $rootScope, $timeout, $log, $scope, $resource, $http, Units, Words, AppStore) {

//      // validator
//      var equalsForeign = function (own, foreign) {
//        if (own === foreign) {
//        $scope.status = false;
//          return true;
//        }
//        $scope.status = true;
//        return false;
//      };
//
//      ValidationActionsStore.validation.push('dropdown.lang.to', 'dropdown.lang.from', equalsForeign, 'Equals Foreign', {both: true});
////      ValidationActionsStore.validation.push('dropdown.lang.from', 'dropdown.lang.to', equalsForeign, 'Equals Foreign');
//
//      ValidationActionsStore.validation.push('dropdown.lang.to', 'dropdown.lang.from', function (own, foreign) {
//        if (own.name === 'Thai') {
//          return true;
//        }
//      }, 'isThai', {both: true});
//
//      ValidationActionsStore.validation.push('dropdown.lang.to', ['dropdown.lang.from', 'dropdown.lang.to'], function (own, foreignObj) {
//        $log.debug('triggered', own, foreignObj);
//        return angular.equals(foreignObj['dropdown.lang.from'], foreignObj['dropdown.lang.to']);
//      }, 'ArrayTest');

      var self = this;

//      $scope.predicate = 'updated_at';
//      $scope.reverse = true;

      $scope.stapleSort = true;

      $scope.translationFilterValue = '';
      $scope.filterValue = '';

      $scope.setSortMode = function (predicate, reverse) {
        $scope.predicate = predicate;
        $scope.reverse = reverse;
        if ($scope.stapleSort === true) {
          $scope.predicateT = predicate;
          $scope.reverseT = reverse;
        }
      };

      // init stable sort at beginning
      $scope.setSortMode('updated_at', true);

      $scope.sortMode = {
        updated_at: {
          false: 'U+',
          true: 'U-'
        },
        created_at: {
          false: 'C+',
          true: 'C-'
        },
        name: {
          false: 'a-z',
          true: 'z-a'
        }
      };

//      self.words = $scope.words; // comes from resolve
//      $scope.words = null;

      $log.debug('words:', self.words);

      $scope.submitTest = function (data) {
        return true;
      };

      /* jshint constructor: false */
      var words = Words($scope.conf);

      $scope.saveWord = function (word, language_id, successCB) {
        $scope.success = null;
        /* jshint camelcase: false */
        word.user_id = $scope.profile.user_id;
        word.language_id = language_id || $scope.lang.from.id;
        words.save({word: word}, function (success) {
          // if parameter not given we know it is added as a word not as a translation
          if (!language_id) {
            $scope.words.push(success);
          }
          $scope.success = true;
          if (angular.isDefined(successCB)) {
            successCB(success);
          }
        }, function (error) {
          $scope.success = false;
          $scope.word = word;
        });
      };

      $scope.updateWord = function (word) {
        word.targetlang_id = $scope.lang.to.id;
        words.update(word, function (success) {
          $scope.words[$scope.words.indexOf(word)] = success;
        });
      };

      $scope.updateTranslation = function (word, translation) {
        words.update(translation, function (success) {
          // as item got already tagged beforehand, we simulate re-tagging!
          if (translation.unit_id) {
            success.unit_id = translation.unit_id;
          }
          angular.forEach($scope.words, function (w) {
            angular.forEach(w.translations, function (t) {
              if (t.id === translation.id) {
                w.translations[w.translations.indexOf(t)] = success;
              }
            });
          });
        });
      };

      $scope.deleteWord = function (word) {
        words.delete({id: word.id}, function () {
          // word delete
          $scope.words.splice($scope.words.indexOf(word), 1);
        });
      };

      $scope.deleteTranslation = function (word, trans) {
        words.delete({id: trans.id}, function () {
          angular.forEach($scope.words, function (w) {
            angular.forEach(w.translations, function (t) {
              if (t.id === trans.id) {
                w.translations.splice(w.translations.indexOf(t), 1);
              }
            });
          });
        });
      };

      $scope.saveTranslation = function (word, translation) {
        var exists = null;
        angular.forEach(word.translations, function (trans) {
          exists = angular.equals(trans.id, translation.id);
        });
        if (!exists) {
          $scope.saveWord({name: translation.name, language_id: $scope.lang.to.id}, $scope.lang.to.id, function (translation) {
            // success
            var Translations = $resource($scope.conf.API_BASEURL + '/words/' + translation.id + '/conversion', {id: '@id'},
              { update: { method: 'PATCH', headers: { 'Content-Type': 'application/json' } } });

            Translations.save({word_id: word.id}, function () {
              // success
              if (angular.isUndefined(word.translations)) {
                word.translations = [];
              }
              word.translations.push(translation);
            });

          });
        }
      };

      // $timeout fetch
      /////////////////////////////////////////////////////
      var promise, newpromise, hidePendingFetch, countdown;
      promise = [];
      $scope.fetch_timeout = 5000;

//      function countDown () {
//        if (countdown) {
//          $timeout.cancel(countdown);
//        }
//        if ($scope.pendingFetch){
//          countdown = $timeout(countDown, $scope.fetch_timeout/100);
//        }
//        $scope.timer -= 50;
//      };

      $scope.$watch('lang', function (newVal, oldVal) {
        // if promise pending delete
        newpromise = $timeout(function () {
          $scope.updateTableItems(newVal, function(){
            $scope.pendingFetch = null;
          });
        }, $scope.fetch_timeout);
        if (oldVal) {
//          console.log('pr', promise);
          var sub = [];
          promise.map(function (p) {
            $timeout.cancel(p);
          });
          promise = sub;
//          console.log('pr after', promise);
          promise.push(newpromise);
//          $scope.pendingFetch = false;
          $scope.timer = $scope.fetch_timeout;
//          countDown();
          $scope.pendingFetch = true;
          $scope.pendingFetchMsg = true;
          if (hidePendingFetch) {
            $timeout.cancel(hidePendingFetch);
          }
          hidePendingFetch = $timeout(function () {
            $scope.pendingFetchMsg = null;
          }, $scope.fetch_timeout / 4);

          $scope.words = [];
//          console.log('called', promise);
        }
      }, true);

      /////////////////////////////////////////////////////

      var first = 0;
      $scope.updateTableItems = function (lang, cb) {
        if (first < 2) {
          first += 1;
          return;
        }

        $scope.words = null;

        words.query({language_id: lang.from.id, targetlang_id: lang.to.id, user_id: $scope.profile.user_id}, function (words) {
          AppStore.set('words', {}); // empty as we don't need to resolve
          $scope.words = words;
          if (angular.isDefined(cb)) {
            cb();
            $timeout(function () {
              $('[data-toggle="tooltip"]').tooltip();
            }, 1000);
          }
        });

      };

      // swap languages
      $scope.swapLanguages = function () {
        $('button#swap').blur();
        var temp = $scope.lang.from;
        $scope.lang.from = $scope.lang.to;
        $scope.lang.to = temp;
        // and refetch! // see the on change
//        $scope.updateTableItems($scope.lang);
      };

      // dummy
      $scope.dummy = function () {
        //
      };

      $scope.bingTranslate = function (word) {
        $http.get($scope.conf.API_BASEURL + '/bing_translation/?source=' + word.name + '&from=' +
            $scope.lang.from.locale_string + '&to=' + $scope.lang.to.locale_string).success(function (success) {
            var translation = { name: success.result };
            $scope.saveTranslation(word, translation);
          });
      };

      $scope.tag = function (word, trans) {
        var Tags = $resource($scope.conf.API_BASEURL + '/translations/tag_unit');
        Tags.save({word_id: word.id, conversion_id: trans.id, unit_id: $scope.selectedUnit.id}, function () {
          trans.unit_id = $scope.selectedUnit.id;
        });
      };

      $scope.untag = function (word, trans) {
        var Tags = $resource($scope.conf.API_BASEURL + '/translations/tag_unit');
        Tags.save({word_id: word.id, conversion_id: trans.id, unit_id: null}, function () {
          trans.unit_id = null;
        });
      };

      $scope.openUnitModal = function () {
        $('#unitModal').modal({});
      };

      $scope.defaultUnit = {id: 0, name: 'All'};

      $scope.selectedUnit = $scope.defaultUnit;

      $scope.selectUnit = function (unit) {
        $scope.selectedUnit = unit;
        $scope.setUnitFilter();
      };

      var units = Units($scope.conf);

      $scope.saveUnit = function (unit) {
        /* jshint camelcase: false */
        unit.user_id = $scope.profile.user_id;
        units.save({unit: unit}, function (success) {
            $scope.units.push(success);
          },
          // err callback
          function () {
            //
        });
      };

      $scope.updateUnit = function (unit) {
        /* jshint camelcase: false */
        units.update({id: unit.id, name:unit.name}, function (success) {
            $scope.units[$scope.units.indexOf(unit)] = success;
            if (angular.equals(unit.id, $scope.selectedUnit.id)) {
              $scope.selectedUnit = success;
            };
          },
          // err callback
          function (err) {
//            console.error(err);
            //
        });
      };

      $scope.deleteUnit = function (unit) {
        /* jshint camelcase: false */
        units.delete(unit, function (success) {
            $scope.units.splice($scope.units.indexOf(unit),1);
            if (angular.equals(unit.id, $scope.selectedUnit.id)) {
              $scope.selectedUnit = $scope.defaultUnit;
            };
          },
          // err callback
          function () {
            //
          });
      };

      $scope.setUnitFilter = function () {
        if ($scope.filterUnitItems) {
          $scope.filterUnitId = $scope.selectedUnit.id;
        } else {
          $scope.filterUnitId = undefined;
        }

      };

      $timeout(function () {
        $('[data-toggle="tooltip"]').tooltip();
      }, 5000);

      $scope.openLangModal = function(word, trans){
        $('#changeLangModal').modal({});
        $scope.langModal = true;
        $scope.langModal = {
          model: {
            word: word,
            trans: trans
          }
        };
      };

      // move to different lang over modal changeLang
      $scope.moveToLang = function(lang_id){
        $scope.langModal.model.trans.language_id = lang_id;
        words.update($scope.langModal.model.trans, function (success) {
          //$scope.words[$scope.words.indexOf(word)] = success;
          if (lang_id !== $scope.lang.from.id) {
            $scope.langModal.model.word.translations.splice($scope.langModal.model.word.translations.indexOf($scope.langModal.model.trans), 1);
          }
        });

        $('#changeLangModal').modal('hide');
      };

    }])

.directive('unitName', ['$parse', function ($parse) {
    return {
      scope: false,
      link: function (scope, ele, attrs) {

        var unit_id;
        var unitName;

        // parse on change
        scope.$watch(attrs.unitName, function (newVal, oldVal) {
          if (newVal === oldVal) return;
          parse();
        });

        var parse = function () {
          unit_id = $parse(attrs.unitName)(scope);
          scope.$parent.units.some(function (unit) {
            if (unit.id === unit_id) {
              unitName = unit.name;
              return;
            }
          });
          ele.html(unitName);
        };

        // parse when link function triggers first time
        parse();

      }
    };
}])

;
