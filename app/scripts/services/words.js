'use strict';

angular.module('famousAngular')

  .factory('Words', ['$resource', function ($resource) {

    return function (conf) {
      return $resource(conf.API_BASEURL + '/words/:id', {id: '@id'},
        { update: { method: 'PATCH', headers: { 'Content-Type': 'application/json' } } });
    };

  }]);