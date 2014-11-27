'use strict';

angular.module('famousAngular')

  .factory('ValidationActionsStore', ['$rootScope', '$q', function ($rootScope, $q) {

    var self = this;
    self.validationStore = $rootScope.$new();

    self.register = function (component) {
      if (!angular.isDefined(self.validationStore[component])) {
        self.validationStore[component] = [];
      }
    };

    self.updateState = function (component, currentValue) {
      self.validationStore[component].currentValue = currentValue;

      angular.forEach(self.validationStore[component], function (target) {
        var fn = target.listener;
        fn.params = [currentValue, self.validationStore[target.source].currentValue];
        self.validationStore[component].status = fn.apply(null, fn.params);
        console.log(self.validationStore[component].status);
      });

    };

    self.registerValidator = function (target, source, listener) {
      self.validationStore[target].push({source: source, listener: listener});
    };

    return {
      register: self.register,
      updateState: self.updateState,
      registerValidator: self.registerValidator
    };

  }]);