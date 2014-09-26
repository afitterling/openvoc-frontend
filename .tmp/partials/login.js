(function(module) {
try {
  module = angular.module('famousAngularStarter');
} catch (e) {
  module = angular.module('famousAngularStarter', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('partials/login.html',
    '<button type="submit" ng-disabled="loading" ng-click="doLogin()">login</button>');
}]);
})();
