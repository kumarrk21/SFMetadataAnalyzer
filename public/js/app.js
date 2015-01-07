'use strict';

/* App Module */

var sfApp = angular.module('SFMetadataAnalyzer', [
		'ng',
		'ngRoute',
		'ngSanitize',
		'ionic',	
		'ngAnimate',
		'sfControllers',
		'sfServices',
		'sfFilters',
		'sfDirectives'
	]);



sfApp.config(['$routeProvider', '$locationProvider',
	function($routeProvider,$locationProvider){
		$routeProvider.

		 	when('/landing',{
				templateUrl: PARTIALS_ROOT + 'landing.html',
				controller: 'main',	

			}).
			when('/profileDetails',{
				templateUrl: PARTIALS_ROOT + 'profiledetails.html',
				controller: 'profileDetails',	

			}).
		
			otherwise({
				redirectTo: '/landing'
			});

		$locationProvider.html5Mode({
  			enabled: true,
  			requireBase: false
		});	
		//$locationProvider.html5Mode(true);	
		//$compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension):/);	
	}
	]);