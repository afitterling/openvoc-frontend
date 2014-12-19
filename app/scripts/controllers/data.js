'use strict';

angular.module('famousAngular')
  .controller('DataCtrl', ['ValidationActionsStore', '$rootScope', '$timeout', '$log', '$scope', '$resource', '$http', 'Words', 'AppStore',
    function (ValidationActionsStore, $rootScope, $timeout, $log, $scope, $resource, $http, Words, AppStore) {

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

      $scope.predicate = 'updated_at';
      $scope.reverse = true;

      //@TODO
      $scope.sortMode = {
        updated_at: { false: '' }
      };

      self.words = $scope.words; // comes from resolve
      $scope.words = null;

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

      $scope.updateWord  = function (word) {
        word.targetlang_id = $scope.lang.to.id;
        words.update(word, function (success) {
          self.words[self.words.indexOf(word)] = success;
        });
      };

      $scope.updateTranslation  = function (word, translation) {
        words.update(translation, function (success) {
          word.translations[word.translations.indexOf(translation)] = success;
        });
      };

      $scope.deleteWord = function (word) {
        words.delete({id: word.id}, function(){
          // word delete
          self.words.splice(self.words.indexOf(word),1 );
        });
      };

      $scope.deleteTranslation = function (word, trans) {
        words.delete({id: trans.id}, function () {
          word.translations.splice(word.translations.indexOf(trans), 1);
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

      var first = 0;
      $scope.updateTableItems = function (lang) {
        if (first < 2) {
          first += 1;
          return;
        }
        self.words = null; // reset
        $scope.$digest();

        words.query({language_id: lang.from.id, targetlang_id: lang.to.id, user_id: $scope.profile.user_id}, function (words) {
          AppStore.set('words', {}); // empty as we don't need to resolve
          self.words = words;
        });

      };

      // swap languages
      $scope.swapLanguages = function () {
        var temp = $scope.lang.from;
        $scope.lang.from = $scope.lang.to;
        $scope.lang.to = temp;
        // and refetch!
        $scope.updateTableItems($scope.lang);
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

    }]);
