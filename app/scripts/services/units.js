'use strict';

angular.module('famousAngular')

  .factory('Units', ['$resource', function ($resource) {

    return function (conf) {
      return $resource(conf.API_BASEURL + '/units/:id', {id: '@id'},
        { update: { method: 'PATCH', headers: { 'Content-Type': 'application/json' } } });
    };

  }]);