'use strict';

// this validation store handles validation for ui business logic

angular.module('famousAngular')

  .factory('ValidationActionsStore', ['$rootScope', function ($rootScope) {

    var self = this;
    self.validationStore = $rootScope.$new();

    // register the UI element with a name we like to be considered in validation process
    self.register = function (component) {
      if (!angular.isDefined(self.validationStore[component])) {
        self.validationStore[component] = [];
      }
    };

    // push a validator for the target UI considered to change, that calles the listener with own model and UIForeignElement Model
    self.push = function (UIElementTriggersValidation, UIForeignElements, listener /* fn: (own model, foreign model) */, name) {
      self.validationStore[UIElementTriggersValidation].push({UIForeignElements: UIForeignElements, listener: {fn: listener, name: name}});
    };

    // update should be called with current model value of UI component in controller or
    // in angular directive or anything which handles the UI element state
    // on updateState triggers all listener registered as UIForeignElement on this component
    // the listener are callbacks supplied with two values: own model and foreign ui model against we want to validate
    self.updateState = function (component, currentValue) {
      self.validationStore[component].currentValue = currentValue;

      // reset validation state of component to 'true'
      self.validationStore[component].anyValidation = false;
      self.validationStore[component].anyValidationArray = [];

      // go trough all listeners and if one is set to false
      angular.forEach(self.validationStore[component], function (ForeignUIElement) {
        var fn = ForeignUIElement.listener.fn;
        fn.params = [currentValue, self.validationStore[ForeignUIElement.UIForeignElements].currentValue];
        var res = fn.apply(null, fn.params);
        if (res) {
          self.validationStore[component].anyValidation = res;
          self.validationStore[component].anyValidationArray.push(ForeignUIElement.listener.name);
        }
      });

    };

    return {
      register: self.register,
      updateState: self.updateState,
      validation: {
        push: self.push
      },
      anyValidation: function (component) {
        return self.validationStore[component].anyValidation;
      },
      anyValidationArray: function (component) {
        return self.validationStore[component].anyValidationArray;
      }
    };

  }]);