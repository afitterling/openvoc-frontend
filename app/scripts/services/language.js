'use strict';

angular.module('famousAngular')

  .factory('Languages', ['$resource', function ($resource) {

    return function (conf) {
      return $resource(conf.API_BASEURL + '/languages/:id', {id: '@id'},
        { update: { method: 'PATCH', headers: { 'Content-Type': 'application/json' } } });
    };

  }]);