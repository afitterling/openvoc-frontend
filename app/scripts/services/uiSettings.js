'use strict';

angular.module('famousAngular')

  .factory('UISettings', ['$resource', function ($resource) {

    return function (conf) {
      return $resource(conf.API_BASEURL + '/settings/:id', {id: '@id'},
        { update: { method: 'PATCH', headers: { 'Content-Type': 'application/json' } } });
    };

  }]);