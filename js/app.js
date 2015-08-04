'use strict';

var deployStackApp = angular.module('deployStackApp', ['ngRoute', 'deployStackControllers']);

deployStackApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/', {
        templateUrl: 'partials/stack-new.html',
        controller: 'StackNewCtrl'
      }).
      when('/stacks', {
        templateUrl: 'partials/stack-detail.html',
        controller: 'StackDetailsCtrl'
      }).
      when('/settings', {
        templateUrl: 'partials/settings.html',
        controller: 'StackNewCtrl'
      }).
      otherwise({
        redirectTo: '/'
      });
	}
]);
