'use strict';

/* Filters */

var sfFilters = angular.module('sfFilters',[]);

/*
moneyFilters.filter('categoryIconFilter',[function(){
	return function (input){
		return input ? '<i class="fa fa-check-circle text-info"></i>' : '<i class="fa fa-question-circle text-warning"></i>';
	}		
}]);


moneyFilters.filter('dashIfZeroCurrency',['$filter', function($filter){
	return function (input){
		
		var currencyFilter = $filter('currency');
		if(input=='0'){
			input = '-';
		}else{
			input = currencyFilter(input);	
		}
		return input;
	}		
}]);


moneyFilters.filter('dateFromYearMonth',['$filter', function($filter){
	return function(input,reportType){
		var dateFilter = $filter('date');
		var format = 'MMM-yy';
		if(reportType=='yearly'){
			input=input+'01'+'01';
			format = 'yyyy';
		}else{	
			input=input+'01';
		}	
		return dateFilter(convertToDate(input),format)
	}
}]);
*/

