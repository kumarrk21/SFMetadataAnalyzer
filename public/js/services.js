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

		listMetadata:function(input,isApex){
			var defer = $q.defer();
			if(isApex){
				apexCalls(apexListMetadata,defer,input);
			}else{
				apiCalls($http,'/api/listMetadata','POST',defer,null,input,{'Content-Type': 'text/plain'});
			}	
			return defer.promise;
		},

		readMetaData:function(input,isApex){
			var defer = $q.defer();
			if(isApex){
				apexCalls(apexReadMetadata,defer,input);
			}else{	
				apiCalls($http,'/api/readMetadata','POST',defer,null,input,{'Content-Type': 'text/plain'});
			}	
			return defer.promise;
		},

		getProfileTable:function(attribId){
			var defer = $q.defer();
			_.delay(frameProfileTable,1000,defer,attribId);
			return defer.promise;
		
		},

		downloadData:function(data,separator,fieldTexts){
			//Assume that the data will always be an array
			var fileContent = _.values(fieldTexts).join(separator) + '\n';
			_(data).forEach(function(content){
				fileContent += _.values(content).join(separator) + '\n';
			})

			var blob = new Blob([fileContent],{type:"data:text/csv;charset=utf-8"});
			saveAs(blob, "ProfileData.csv");
		},

		getGlobalValues:function(){
			return globalValues;
		},

		setGlobalValues:function(data){
			globalValues = data;
		}

	}
}])


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

function apexCalls(module,defer,input){
	 var returnData = {};
	 returnData.data = {};
	 Visualforce.remoting.Manager.invokeAction(module,input,function(result,event){
	 		if(event.status){
	 			returnData.data.success = true;
	 			returnData.data.data = JSON.parse(result);
	 			defer.resolve(returnData);
	 		}else{
	 			returnData.data.success = false;
	 			returnData.data.data = event.message;
	 			defer.resolve(returnData);
	 		}
	 	},
	 	{escape:false}
	 );
}


function frameProfileTable(defer,rootObjectName){
	var returnTable = {};
	returnTable.fieldTexts = new Array();
	returnTable.fieldNames = new Array();
	returnTable.data = new Array();

	_(globalValues.profilesData).forEach(function(profileData){
		var profile = _.find(globalValues.profiles,function(selectedProfile){
			return selectedProfile.fullName == profileData.fullName
		})
		var recordTypeTable = new Array();
		var rootObject = eval('profileData.'+rootObjectName);

		if(rootObject){
			if(_.isArray(rootObject)){
				recordTypeTable = rootObject;
			}else{
				recordTypeTable.push(rootObject);
			}
		}

		_(recordTypeTable).forEach(function(recordType){
			var data = {};
			data.Name = profileData.fullName;
			data.ID = '';
			if(profile){
				data.ID = profile.id;
			}
			_(_.keys(recordType)).forEach(function(fieldName){
				if(!fieldName.endsWith("_type_info")) //for Apex
				data[fieldName] = recordType[fieldName];
			})
			returnTable.data.push(data);
		})

	})
	try{
		var data = returnTable.data[0];
		_(_.keys(data)).forEach(function(fieldName){
			returnTable.fieldNames.push(fieldName);
			returnTable.fieldTexts.push(fieldName);
		})
	}catch(err){

	}
	

	defer.resolve(returnTable);
}

if ( typeof String.prototype.startsWith != 'function' ) {
  String.prototype.startsWith = function( str ) {
    return str.length > 0 && this.substring( 0, str.length ) === str;
  }
};

if ( typeof String.prototype.endsWith != 'function' ) {
  String.prototype.endsWith = function( str ) {
    return str.length > 0 && this.substring( this.length - str.length, this.length ) === str;
  }
};












