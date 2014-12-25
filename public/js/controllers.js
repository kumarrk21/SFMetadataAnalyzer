'use strict';

/* Controllers */

var sfControllers = angular.module('sfControllers',[]);
var PROFILEBATCHSIZE = 10;

sfControllers.controller('main',['$scope', '$q', '$location', '$ionicLoading' , 'mainSvc', 
    function($scope,$q, $location, $ionicLoading, mainSvc){
        
        var globalValues = mainSvc.getGlobalValues();
    	$scope.showLogin = false;

    	if(!$scope.apex){
    		mainSvc.getAuthStatus().then(function(authStatusReturn){
                console.log('Auth Return', authStatusReturn);
    			if(!authStatusReturn.data.data.authorized) $scope.showLogin = true;
    			if(authStatusReturn.data.data.authorized && !authStatusReturn.data.data.authenticated){
    				mainSvc.authenticate().then(function(authReturn){
    					console.log('Authenticate Return', authReturn);
                        mainSvc.describeService().then(function(describeReturn){
                            console.log('Service Description',describeReturn);
                        })
    				})
    			}
    		})
    			
    	};

    	$scope.login = function(){
    		mainSvc.getOAuthURL($scope.instance).then(function(returnData){
    			console.log(returnData.data);
    			window.location = returnData.data.data;
    		});
    	};

        $scope.logout = function(){
            mainSvc.logout().then(function(returnData){
                console.log(returnData);
                $location.path( "/main" );
            })
        };

        $scope.refreshSession = function(){
            mainSvc.refreshSession().then(function(returnData){
                console.log("Refresh session", returnData);
            });
        };


    	$scope.getProfiles = function(){

            $ionicLoading.show({template: 'Reading Profiles...'});

            var profileData = new Array();

            var input = {};
            input.queries = new Array();
            input.queries.push({type:'Profile'});
            input.asOfVersion = '32.0';

            mainSvc.listMetadata(JSON.stringify(input)).then(function(profilesResult){
    
                console.log('Profiles', profilesResult);
              
                if(profilesResult.data.success){
                  //Get the profile data in batches
                    var batchSize = 0;
                    var names = new Array();
                    var profiles = new Array();
                    globalValues.profiles = profilesResult.data.data;
                    mainSvc.setGlobalValues(globalValues);

                    _(profilesResult.data.data).forEach(function(profile){
                        batchSize++;
                        names.push(decodeURI(profile.fullName));
                        if(batchSize == PROFILEBATCHSIZE){
                            profiles.push(names);
                            names = new Array();
                            batchSize = 0;
                        }
                    })


                    if(names.length>0){
                        profiles.push(names);
                    }

                    console.log('Profiles',profiles);
                    batchSize = 0;

                    _(profiles).forEach(function(profile){
                            var inputData = {};
                            inputData.type = 'Profile';
                            inputData.fullNames = profile;

                        mainSvc.readMetaData(JSON.stringify(inputData)).then(function(profileDataResult){   
                             console.log('Profile Data Result',profileDataResult);
                            batchSize++;
            
                            _(profileDataResult.data.data).forEach(function(records){
                                profileData.push(records);
                            })

                            if(batchSize == profiles.length){
                                //$ionicLoading.hide();    
                                globalValues.profilesData = profileData;
                                mainSvc.setGlobalValues(globalValues);
                                $ionicLoading.hide();
                                console.log('Scope data',profileData);
                                $location.path( "/profileDetails" );

                            }

                        });
                    })

                }else{
                    $ionicLoading.hide();
                    // errror;
                }
                


            });
    		  
    	};

}]);

sfControllers.controller('profileDetails',['$scope', '$q', '$location', '$ionicLoading' , 'mainSvc', 
    function($scope,$q, $location, $ionicLoading, mainSvc){

        var profileAttribs = new Array();
        profileAttribs.push({name:'---Select a Filter---',id:null});
        profileAttribs.push({name:'Applications',id:'applicationVisibilities'});
        profileAttribs.push({name:'Apex Classes',id:'classAccesses'});
        profileAttribs.push({name:'Field Permissions',id:'fieldPermissions'});
        profileAttribs.push({name:'Layout Assignments',id:'layoutAssignments'});
        profileAttribs.push({name:'Object Permissions',id:'objectPermissions'});
        profileAttribs.push({name:'Page Access',id:'pageAccesses'});
        profileAttribs.push({name:'Record Types',id:'recordTypeVisibilities'});
         profileAttribs.push({name:'Tabs',id:'tabVisibilities'});
          profileAttribs.push({name:'Permissions',id:'userPermissions'});

        $scope.profileAttribs = profileAttribs;
        $scope.profileAttrib = $scope.profileAttribs[0];
        console.log('Global Values', mainSvc.getGlobalValues());


        $scope.getFilterTable = function(attrib){ 
            if(attrib.id){
                $ionicLoading.show({template: 'Reading ' + attrib.name + '...'});
                 mainSvc.getProfileTable(attrib.id).then(function(returnTable){
                        $scope.profileTable = returnTable;
                        console.log('ProfileTable',returnTable);
                        $ionicLoading.hide();
                 })

            }

        }

        $scope.downloadData = function(){
            var data = $scope.profileTable;
            //$ionicLoading.show({template: 'Downloading Data'});
            if($scope.filterResults) data = $scope.filterResults;
            mainSvc.downloadData().then(function(returnData){

            })
        }
        
 }]);       
   