(function(module) {
try {
  module = angular.module('famousAngularStarter');
} catch (e) {
  module = angular.module('famousAngularStarter', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('partials/main.html',
    '<header class="navigation"><div class="navigation-wrapper"><a href="javascript:void(0)" class="logo"><img ng-show="auth.profile" ng-src="{{auth.profile.picture}}" alt="Avator"></a> <a href="" class="navigation-menu-button" id="js-mobile-menu">MENU</a><div class="nav"><ul id="navigation-menu"><li class="nav-link"><a>{{auth.profile.email}}</a></li></ul></div><div class="navigation-tools"><a ng-click="handleSession()" class="button">{{sessionAction}}</a></div></div></header><div></div>');
}]);
})();
