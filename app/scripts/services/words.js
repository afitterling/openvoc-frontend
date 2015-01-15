'use strict';

angular.module('famousAngular')

  .factory('Words', ['$resource', function ($resource) {

    return function (conf) {
      return $resource(conf.API_BASEURL + '/words/:id', {id: '@id'},
        { 'query': { method: 'GET', cache: false, isArray: true }, update: { method: 'PATCH', headers: { 'Content-Type': 'application/json' }} });
    };

  }])

;