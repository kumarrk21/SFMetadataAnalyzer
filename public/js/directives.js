'use strict';
/* Directives */

var sfDirectives = angular.module('sfDirectives',[]);

/*
moneyDirectives.directive('processingIndicator',[function(){
	function link(scope, element, attrs) {
		element.modal('toggle');
		scope.$watch('isBusy', function(value) {
			if(value){
				element.modal('show');
			}else{
				element.modal('hide');
			}		
		});
		
	}
	return{
		restrict: 'AE',
		link: link,
		templateUrl: 'partials/processing_indicator.html'
	}
}]);

moneyDirectives.directive('highCharts',[function(){
	function link(scope, element, attrs) {
		//element.highcharts(scope.chartOptions);		
		scope.$watch('chartOptions', function(value) {
			Highcharts.charts = new Array();
			element.highcharts(scope.chartOptions);					
		});
		
	}
	return{
		restrict: 'AE',
		link: link
	}
}]);
*/
