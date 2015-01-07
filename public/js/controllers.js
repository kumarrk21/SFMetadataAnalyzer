'use strict';

/* Controllers */

var sfControllers = angular.module('sfControllers',[]);
//var PROFILEBATCHSIZE = 1;

sfControllers.controller('main',['$scope', '$q', '$location', '$ionicLoading' , '$ionicModal', 'mainSvc', 
    function($scope,$q, $location, $ionicLoading, $ionicModal, mainSvc){
        
        var globalValues = mainSvc.getGlobalValues();
    	$scope.showLogin = false;
        $scope.message = '';

        $scope.profileBatchSize = globalValues.profileBatchSize;
        if(!$scope.profileBatchSize) $scope.profileBatchSize = 1;

        $scope.apiVersion = globalValues.apiVersion;
        if(!$scope.apiVersion) $scope.apiVersion = '32.0';

      
        $ionicModal.fromTemplateUrl(PARTIALS_ROOT + 'settingsModal.html', function(modal) {
          $scope.settingsModal = modal;
        }, {
          scope: $scope,
          animation: 'slide-in-up'
        });

    	if(!$scope.apex){
    		mainSvc.getAuthStatus().then(function(authStatusReturn){
    			if(!authStatusReturn.data.data.authorized) $scope.showLogin = true;
    			if(authStatusReturn.data.data.authorized && !authStatusReturn.data.data.authenticated){
    				mainSvc.authenticate().then(function(authReturn){
    				})
    			}
    		})
    			
    	};
       

    	$scope.login = function(){
    		mainSvc.getOAuthURL($scope.instance).then(function(returnData){
    			window.location = returnData.data.data;
    		});
    	};

        $scope.logout = function(){
            mainSvc.logout().then(function(returnData){
                window.location = returnData.data.data;
            })
        };


        $scope.settings = function(){
            $scope.settingsModal.show();
        };

        $scope.settingsChange = function(profileBatchSize,apiVersion){
            globalValues.profileBatchSize = $scope.profileBatchSize = profileBatchSize;
            globalValues.apiVersion = $scope.apiVersion = apiVersion;
            mainSvc.setGlobalValues(globalValues);
        };    

    	$scope.getProfiles = function(type){

            $ionicLoading.show({template: 'Reading Metadata...'});

            var profileData = new Array();

            var input = {};
            input.queries = new Array();
            if($scope.apex){
                input.queries.push({type_x:type});
            }else{
                input.queries.push({type:type});
            }    
            input.asOfVersion = $scope.apiVersion;

            mainSvc.listMetadata(JSON.stringify(input),$scope.apex).then(function(profilesResult){
              
                if(profilesResult.data.success){
                    var batchSize = 0;
                    var names = new Array();
                    var profiles = new Array();
                    globalValues.profiles = profilesResult.data.data;
                    mainSvc.setGlobalValues(globalValues);

                    _(profilesResult.data.data).forEach(function(profile){
                        batchSize++;
                        names.push(decodeURI(profile.fullName));
                        if(batchSize == $scope.profileBatchSize){
                            profiles.push(names);
                            names = new Array();
                            batchSize = 0;
                        }
                    })


                    if(names.length>0){
                        profiles.push(names);
                    }

                    batchSize = 0;

                    if(_.size(profiles)<=0) $ionicLoading.hide();

                    _(profiles).forEach(function(profile){
                            var inputData = {};
                            if($scope.apex){
                                inputData.type_x = type;
                            }else{
                                inputData.type = type;
                            }    
                            inputData.fullNames = profile;

                        mainSvc.readMetaData(JSON.stringify(inputData),$scope.apex).then(function(profileDataResult){   
                            batchSize++;
            
                            _(profileDataResult.data.data.records).forEach(function(records){
                                profileData.push(records);
                            })

                            if(batchSize == profiles.length){
                                globalValues.profilesData = profileData;
                                mainSvc.setGlobalValues(globalValues);
                                $ionicLoading.hide();
                                $location.path( "/profileDetails").search({type:type});

                            }

                        });
                    })

                }else{
                    $ionicLoading.hide();
                }
                


            });
    		  
    	};

}]);

sfControllers.controller('profileDetails',['$scope', '$q', '$location', '$routeParams', '$ionicLoading' , 'mainSvc', 
    function($scope,$q, $location, $routeParams, $ionicLoading, mainSvc){

        var initialMessage = 'Reading in Batch mode, click the download button to download the data in .cvs format';
        $scope.batch = true;
        $scope.message = initialMessage;

        var profileAttribs = new Array();

        profileAttribs.push({name:'---Select a Filter---',id:null});
        profileAttribs.push({name:'Applications',id:'applicationVisibilities'});
        profileAttribs.push({name:'Apex Classes',id:'classAccesses'});
        profileAttribs.push({name:'Custom Permissions',id:'customPermissions'});
        profileAttribs.push({name:'Ext. Datasource Access',id:'externalDataSourceAccesses'});
        
        profileAttribs.push({name:'Field Permissions',id:'fieldPermissions'});

        if($routeParams.type=='Profile'){ 
            profileAttribs.push({name:'Fld Levl sec.',id:'fieldLevelSecurities'});
            profileAttribs.push({name:'Layout Assignments',id:'layoutAssignments'});
            profileAttribs.push({name:'Login Hours',id:'loginHours'});
            profileAttribs.push({name:'Login IP Ranges',id:'loginIpRanges'});
        }

        profileAttribs.push({name:'Object Permissions',id:'objectPermissions'});
        profileAttribs.push({name:'Page Access',id:'pageAccesses'});
        profileAttribs.push({name:'Record Types',id:'recordTypeVisibilities'});
        if($routeParams.type=='Profile'){ 
            profileAttribs.push({name:'Tab Visibility',id:'tabVisibilities'});
        }else{
            profileAttribs.push({name:'Tab Settings',id:'tabSettings'});
        }
        profileAttribs.push({name:'User Permissions',id:'userPermissions'});

        $scope.profileAttribs = profileAttribs;
        $scope.profileAttrib = $scope.profileAttribs[0];


        $scope.getFilterTable = function(attrib){ 
            if(attrib.id){
                $ionicLoading.show({template: 'Reading ' + attrib.name + '...'});
                 mainSvc.getProfileTable(attrib.id).then(function(returnTable){
                        $scope.profileTableHolder = returnTable;
                        var totalRecords = 0;
                        if(_.isArray($scope.profileTableHolder.data)) totalRecords = $scope.profileTableHolder.data.length;
                        $scope.message = 'Selected ' + totalRecords + ' records. ';
                        if(!$scope.batch){
                            $scope.profileTable = _.clone($scope.profileTableHolder,true);
                        }else{
                            $scope.message += 'Click the download button to download the data in .cvs format';
                        }
                        $ionicLoading.hide();
                 })

            }

        }

        $scope.toggleBatch = function(){
            if($scope.batch){
                $scope.profileTable = null;
                if(!$scope.profileTableHolder) $scope.message = initialMessage;
            }else{
                $scope.profileTable = _.clone($scope.profileTableHolder,true);
                if(!$scope.profileTableHolder) $scope.message = '';
            }
        }

        $scope.downloadData = function(){
            var data = $scope.profileTableHolder.data;
            if($scope.filterResults) data = $scope.filterResults;
            mainSvc.downloadData(data,',',$scope.profileTableHolder.fieldTexts);
        }


        
 }]);  

 
