'use strict';

/* Services */
var sfServices = angular.module('sfServices',[]);

/* Global variables */
var globalValues = {};

sfServices.factory('mainSvc',['$q','$http',function($q,$http){
	return{
		
		logout:function(){
			var defer = $q.defer();
			apiCalls($http,'/api/refreshSession','GET',defer,null,null,null);
			return defer.promise;
		},

		getOAuthURL:function(instance){
			var defer = $q.defer();
			apiCalls($http,'/api/getOAuthURL','GET',defer,{instance:instance},null,null);
			return defer.promise;
		},

		authenticate:function(){
			var defer = $q.defer();
			apiCalls($http,'/api/authenticate','GET',defer,null,null,null)
			return defer.promise;
		},

		getAuthStatus:function(){
			var defer = $q.defer();
			apiCalls($http,'/api/getAuthStatus','GET',defer,null,null,null)
			return defer.promise;

		},

		describeService:function(){
			var defer = $q.defer();
			apiCalls($http,'/api/describeService','GET',defer,null,null,null)
			return defer.promise;

		},

		listMetadata:function(input){
			var defer = $q.defer();
			apiCalls($http,'/api/listMetadata','POST',defer,null,input,{'Content-Type': 'text/plain'});
			return defer.promise;
		},

		readMetaData:function(input){
			var defer = $q.defer();
			apiCalls($http,'/api/readMetadata','POST',defer,null,input,{'Content-Type': 'text/plain'});
			return defer.promise;
		},

		getProfileTable:function(attribId){
			var defer = $q.defer();
			_.delay(frameProfileTable,1000,defer,attribId);
			return defer.promise;
		
		},

		downloadData:function(data){
			var defer = $q.defer();
			downloadFile(defer,data);
			return defer.promise;
		},

		getGlobalValues:function(){
			return globalValues;
		},

		setGlobalValues:function(data){
			globalValues = data;
		}

	}
}])


function downloadFile(defer,data){
	window.requestFileSystem(window.TEMPORARY, 1024*1024, onInitFs, errorHandler);
	defer.resolve('done');
}


function frameProfileTable(defer,rootObjectName){
	var returnTable = {};
	//returnTable.fieldTexts = new Array('profileName','profileId');
	//returnTable.fieldNames = new Array('profileName','profileId');
	returnTable.fieldTexts = new Array();
	returnTable.fieldNames = new Array();
	returnTable.data = new Array();

	_(globalValues.profilesData).forEach(function(profileData){
		var profile = _.find(globalValues.profiles,function(selectedProfile){
			return selectedProfile.fullName == profileData.fullName
		})
		var recordTypeTable = new Array();
		var rootObject = eval('profileData.'+rootObjectName);

		if(_.isArray(rootObject)){
			recordTypeTable = rootObject;
		}else{
			recordTypeTable.push(rootObject);
		}
		_(recordTypeTable).forEach(function(recordType){
			var data = {};
			data.profileName = profileData.fullName;
			data.profileId = '';
			if(profile){
				data.profileId = profile.id;
			}
			//data.recordType = recordType;
			_(_.keys(recordType)).forEach(function(fieldName){
				data[fieldName] = recordType[fieldName];
			})
			returnTable.data.push(data);
		})

	})
	try{
		//var data = returnTable.data[0].recordType;	
		var data = returnTable.data[0];
		_(_.keys(data)).forEach(function(fieldName){
			//returnTable.fieldNames.push('recordType.'+fieldName);
			returnTable.fieldNames.push(fieldName);
			returnTable.fieldTexts.push(fieldName);
		})
	}catch(err){

	}
	

	defer.resolve(returnTable);
}


function apiCalls($http,url,method,defer,params,body,headers){
	var returnData = {};
	var config = {url:url,method:method,params:params,data:body,headers:headers};
	$http(config).success(function(data,status){
		returnData.data = data;
		returnData.success = true;
		defer.resolve(returnData);
		
	}).error(function(data,status){
		returnData.success = false;
		returnData.data = status;
		defer.resolve(returnData);
	});

}

function apexCalls(){

}









