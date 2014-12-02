'use strict';

angular.module('famousAngular')
  .controller('DataCtrl', ['ValidationActionsStore', '$rootScope', '$timeout', '$log', '$scope', '$resource', '$http', 'Words', 'AppStore',
    function (ValidationActionsStore, $rootScope, $timeout, $log, $scope, $resource, $http, Words, AppStore) {

      var conf = $scope.conf;

      // validator
      var equalsForeign = function (own, foreign) {
        if (own === foreign) {
        $scope.status = false;
          return true;
        }
        $scope.status = true;
        return false;
      };

      ValidationActionsStore.validation.push('dropdown.lang.to', 'dropdown.lang.from', equalsForeign, 'Equals Foreign', {both: true});
//      ValidationActionsStore.validation.push('dropdown.lang.from', 'dropdown.lang.to', equalsForeign, 'Equals Foreign');

      ValidationActionsStore.validation.push('dropdown.lang.to', 'dropdown.lang.from', function (own, foreign) {
        if (own.name === 'Thai') {
          return true;
        }
      }, 'isThai', {both: true});

      ValidationActionsStore.validation.push('dropdown.lang.to', ['dropdown.lang.from', 'dropdown.lang.to'], function (own, foreignObj) {
        $log.debug('triggered', own, foreignObj);
        return angular.equals(foreignObj['dropdown.lang.from'], foreignObj['dropdown.lang.to']);
      }, 'ArrayTest');

      var self = this;

      self.words = $scope.words;

      $scope.submitTest = function (data) {
        console.log(data);
        return true;
      };

      /* jshint constructor: false */
      var words = Words(conf);

      $scope.saveWord = function (word, language_id, successCB) {
        $scope.success = null;
        /* jshint camelcase: false */
        word.user_id = $scope.profile.user_id;
        console.log(word.user_id);
//        word.user_id = null;
        word.language_id = language_id || $scope.lang.from.id;
        words.save({word: word}, function (success) {
          // if parameter not given we know it is added as a word not as a translation
          if (!language_id) {
            self.words.push(success);
          }
          $scope.success = true;
          if (angular.isDefined(successCB)){
            successCB(success);
          }
        }, function (error) {
          $scope.success = false;
          $scope.word = word;
        });
      };

      $scope.saveTranslation = function (word, translation) {
        var exists = null;
        angular.forEach(word.translations, function (trans) {
          exists = angular.equals(trans.id, translation.id);
        });
        console.log('exists', exists);
        console.log(word, translation);
        if (!exists) {
          $scope.saveWord({name: translation.name, language_id: $scope.lang.to.id}, $scope.lang.to.id, function (translation) {
            // success

            console.log('translation', translation);

            console.log('translation_id', translation.id);
            var Translations = $resource(conf.API_BASEURL + '/words/' + translation.id + '/conversion', {id: '@id'},
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

      var first = 0;
      $scope.updateTableItems = function (lang) {
        if (first < 2) {
          first += 1;
          return;
        }

        words.query({language_id: lang.from.id, targetlang_id: lang.to.id, user_id: $scope.profile.user_id}, function (words) {
          AppStore.set('words', words);
          self.words = words;
        });

      };

      // swap languages
      $scope.swapLanguages = function () {
        var temp = $scope.lang.from;
        $scope.lang.from = $scope.lang.to;
        $scope.lang.to = temp;
        $scope.updateTableItems($scope.lang);
      };

      // dummy
      $scope.dummy = function () {
        //
      };

    }]);
