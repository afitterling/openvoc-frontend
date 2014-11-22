'use strict';

angular.module('famousAngular')

  .factory('Items', ['$resource', function ($resource) {

    return function (conf) {
      return $resource(conf.API_BASEURL + '/items/:id', {id: '@id'},
        { update: { method: 'PATCH', headers: { 'Content-Type': 'application/json' } } });
    };

  }]);