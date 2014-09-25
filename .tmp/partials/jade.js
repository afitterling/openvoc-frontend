(function(module) {
try {
  module = angular.module('famousAngularStarter');
} catch (e) {
  module = angular.module('famousAngularStarter', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('partials/jade.html',
    '<fa-app class="full-screen"><fa-modifier fa-origin="[.5, .5]" fa-rotate-y="rotateY.get()"><fa-surface fa-size="[true, true]" fa-color="\'rgb(255,255,250)\'"><img src="images/famous-logo.svg" style="width: 200px; height: 200px;" class="logo"></fa-surface><fa-modifier fa-rotate-y="3.14159"><fa-surface fa-size="[true, true]" fa-color="\'rgb(255,255,250)\'"><img src="images/famous-logo.svg" style="width: 200px; height: 200px;" class="logo"></fa-surface></fa-modifier></fa-modifier><fa-modifier fa-origin="[.5, .9]" fa-size="[200, 100]"><fa-surface><input style="width: 100%; text-align: center;" type="range" min="10" max="100" ng-model="spinner.speed"></fa-surface></fa-modifier></fa-app>');
}]);
})();
