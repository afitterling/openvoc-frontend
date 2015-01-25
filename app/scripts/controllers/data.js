'use strict';

angular.module('famousAngular')
  .controller('DataCtrl', ['ValidationActionsStore', '$rootScope', '$timeout', '$log', '$scope', '$resource', '$http', 'Units', 'Words', 'Store',
    function (ValidationActionsStore, $rootScope, $timeout, $log, $scope, $resource, $http, Units, Words, Store) {

      var self = this;

      self.bypass = { tableUpdate: null };
      self.promises = {}; // promises $timeout

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

      if (Store.has('lang_selected')) {

        $scope.lang_selected = Store.get('lang_selected');
        $scope.words = Store.get('words');

        self.bypass.tableUpdate = true;
      }

      var units = Units($scope.conf);

      // init stable sort at beginning

      $scope.settings = {};

      $scope.$watch('settings', function (newVal, oldVal) {
        if (newVal === oldVal) return;
        Store.set('settings', $scope.settings);
      }, true);

      $scope.setSortMode = function (predicate, reverse) {
        $scope.settings.ui.predicateWord = predicate;
        $scope.settings.ui.reverseWord = reverse;
        if ($scope.settings.ui.stapleSort === true) {
          $scope.settings.ui.predicateTrans = predicate;
          $scope.settings.ui.reverseTrans = reverse;
        }
      };

      if (Store.has('settings')) {
        $scope.settings = Store.get('settings');
      } else {
        $scope.settings.ui = {};
        $scope.settings.ui.stapleSort = true;
        $scope.settings.ui.translationsOnly = false;
        $scope.settings.ui.autoTag = false;
        $scope.settings.ui.hideNewTranslations = false;
        $scope.setSortMode('updated_at', true);
        $scope.defaultUnit = {id: 0, name: 'Select Unit'};
        $scope.settings.ui.selectedUnit = $scope.defaultUnit;
      }

      //// debug
      $log.debug('words:', $scope.words);

      ///////////////////////////////////////////////////////////////////
      // filters

      $scope.filters = {
        translation: '',
        word: '',
        q: {translation: null, word: null},
        // view Models
        model: {
          translation: '',
          word: ''
        }
      };

      $scope.setFilterAsync = function (filterName, value) {
        $scope.filters.model[filterName] = value; // why is that: in case of externally reset or set to some value
        $timeout.cancel($scope.filters.q[filterName]);
        $scope.filters.q[filterName] = $timeout(function () {
          $log.debug('filter ' + filterName + ' set to:' + value);
          $scope.filters[filterName] = value;
        }, 400);
      };

      // filters end //

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
          $scope.tooltips();
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
        // first untag
        var remove = function () {
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
        $scope.untag(word, trans, remove);
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
              if ($scope.settings.ui.selectedUnit.id !== 0 && $scope.settings.ui.autoTag) {
                $scope.tag(word, translation);
              }
              $scope.tooltips();
            });

          });
        }
      };

      /////////////////////////////////////////////////////
      // $timeout fetch

      var promise, newpromise, hidePendingFetch, countdown;
      promise = [];
      $scope.fetch_timeout = 0;

      $scope.$watch('lang', function (newVal, oldVal) {
        // if promise pending delete
        //$log.debug(newVal, oldVal);
        if (!newVal) return;

        newpromise = $timeout(function () {
          $scope.updateTableItems(newVal, function(){
            $scope.pendingFetch = null;
          });
        }, $scope.fetch_timeout);
        $scope.fetch_timeout = 5000;
        if (oldVal) {
          var sub = [];
          promise.map(function (p) {
            $timeout.cancel(p);
          });
          promise = sub;
          promise.push(newpromise);
          $scope.timer = $scope.fetch_timeout;
          $scope.pendingFetch = true;
          $scope.pendingFetchMsg = true;
          if (hidePendingFetch) {
            $timeout.cancel(hidePendingFetch);
          }
          hidePendingFetch = $timeout(function () {
            $scope.pendingFetchMsg = null;
          }, $scope.fetch_timeout / 4);

          $scope.words = [];
        }
      }, true);


      $scope.updateTableItems = function (lang, cb) {
        if (self.bypass.tableUpdate) {
          $log.debug('bypass.tableUpdate');
          self.bypass.tableUpdate = false;
          return;
        }

        // we store lang_selected back side to restore it on ctrl initialize
        Store.set('lang_selected', {from_id: lang.from.id, to_id: lang.to.id});

        $log.debug('updateTableItems fired!');

        $scope.words = null;

        words.query({language_id: lang.from.id, targetlang_id: lang.to.id, user_id: $scope.profile.user_id}, function (words) {
          Store.set('words', words);
          $scope.words = Store.get('words', words);
          if (angular.isDefined(cb)) {
            cb();
            $scope.tooltips();
          }
        });

      };

      ///////////////////////////////////////////
      // swap languages
      $scope.swapLanguages = function () {
        $timeout.cancel(self.promises.swapLang);
        self.promises.swapLang = $timeout(function () {
          var temp = $scope.lang_selected.from_id;
          $scope.lang_selected.from_id = $scope.lang_selected.to_id;
          $scope.lang_selected.to_id = temp;
        }, 200);
      };
      // end ^^^^

      /////////////////////////////////////////////////////////////
      // translation
      $scope.bingTranslate = function (word) {
        $http.get($scope.conf.API_BASEURL + '/bing_translation/?source=' + word.name + '&from=' +
            $scope.lang.from.locale_string + '&to=' + $scope.lang.to.locale_string).success(function (success) {
            var translation = { name: success.result };
            $scope.saveTranslation(word, translation);
          });
      };

      //////////////////////////////////////////////////////////////
      // unit tagger/untaggers

      $scope.tag = function (word, trans) {
        var Tags = $resource($scope.conf.API_BASEURL + '/translations/tag_unit');
        Tags.save({word_id: word.id, conversion_id: trans.id, unit_id: $scope.settings.ui.selectedUnit.id}, function () {
          trans.unit_id = $scope.settings.ui.selectedUnit.id;
        });
      };

      $scope.untag = function (word, trans, callback) {
        var Tags = $resource($scope.conf.API_BASEURL + '/translations/untag_unit');
        Tags.save({word_id: word.id, conversion_id: trans.id}, function () {
          trans.unit_id = null;
          if (angular.isDefined(callback)) {
            callback();
          }
        });
      };

      // end

      $scope.openUnitModal = function () {
        $('#unitModal').modal({});
      };

      $scope.selectUnit = function (unit) {
        $scope.settings.ui.selectedUnit = unit;
        $scope.setUnitFilter();
        $scope.tooltips();
      };

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
            if (angular.equals(unit.id, $scope.settings.ui.selectedUnit.id)) {
              $scope.settings.ui.selectedUnit = success;
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
            if (angular.equals(unit.id, $scope.settings.ui.selectedUnit.id)) {
              $scope.settings.ui.selectedUnit = $scope.defaultUnit;
            };
          },
          // err callback
          function () {
            //
          });
      };

      $scope.setUnitFilter = function () {
        if ($scope.settings.ui.filterUnitItems) {
          $scope.filterUnitId = $scope.settings.ui.selectedUnit.id;
        } else {
          $scope.filterUnitId = undefined;
        }

      };

      $scope.openLangModal = function(word, trans, mode){
        $scope.changeLangErrorMsg = false;
        $scope.langModal = {
          model: {
            word: word,
            trans: trans,
            mode: mode
          }
        };
        $('#changeLangModal').modal({});
      };

      // move to different lang over modal changeLang
      $scope.moveTranslationToLang = function(lang_id){
        if (lang_id !== $scope.lang.to.id) {
          $scope.langModal.model.trans.language_id = lang_id;
          words.update($scope.langModal.model.trans, function (success) {
            $scope.langModal.model.word.translations.splice($scope.langModal.model.word.translations.indexOf($scope.langModal.model.trans), 1);
          });
          $('#changeLangModal').modal('hide');
        } else {
          $scope.changeLangErrorMsg = true;
        }
      };

      // move word to different lang over modal changeLang
      $scope.moveWordToLang = function(lang_id){
        if (lang_id !== $scope.lang.from.id) {
          $scope.langModal.model.word.language_id = lang_id;
          words.update($scope.langModal.model.word, function (success) {
            $scope.words.splice($scope.words.indexOf($scope.langModal.model.word), 1);
          });
          $('#changeLangModal').modal('hide');
        } else {
          $scope.changeLangErrorMsg = true;
        }
      };

      $timeout(function () {
        $scope.tooltips();
      }, 0);

    }])


/////////////////////////////////////////////////////////////////////
/// directives
/////////////////////////////////////////////////////////////////////

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
