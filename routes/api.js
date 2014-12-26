/*
 * All APIs
 */

var CLIENTID = process.env.CLIENTID;
var SECRET = process.env.SECRET;

var httpClient = require('request');
var soap = require('soap');
var q = require('q');
var _ = require('lodash');
var PRODURL = process.env.PRODURL;
var SBXURL = process.env.SBXURL;
//var soapClient;
var apiVersion = process.env.APIVERSION;
var profileBatchSize = process.env.PROFILEBATCHSIZE;

exports.refreshSession = function(req, res){
	var response = {};
	var logoutURL = req.session.sfdcurl + '/secur/logout.jsp';
	//Revoke the oAuthToken first
	var url = determineURL(req) + '/revoke?token=' + req.session.oAuthToken;
	
	httpClient.get({url:url},function(e,r){
		req.session.destroy(function(err){
			if(err){
				response.success = false;
				response.data = err.body;
			}else{
				response.success = true;
				response.data = logoutURL;
			}
			res.json(response);
		})	
		
	})
	
	
};


exports.oAuthURL = function (req, res) {
	var response = {};
  	var sfinstance = req.query.instance;
  	if(sfinstance!=null){
  		req.session.sfinstance = sfinstance;
  	}	
  	var url = determineURL(req) + '/authorize?response_type=code&client_id=' + CLIENTID + '&redirect_uri=' + req.protocol + '://' + req.headers.host;
  	response.success = true;
  	response.data = url;
  	res.json(response);
};

exports.authenticate = function (req, res) {
	var response = {};
	var url = determineURL(req) + '/token?';
	var form = { client_id: CLIENTID, 
				 client_secret:SECRET, 
				 code:req.session.authCode, 
				 grant_type:'authorization_code',
		 		redirect_uri: req.protocol + '://' + req.headers.host
 	};
 
 	httpClient.post({url:url,form:form},function(error,response,body){
 		//Get the auth code
 		if(error){
 			response.success = false;
 			response.data = {authenticated:false,error:error};
 		}else{
 			var authenticated = false;
 			var jsonBody = JSON.parse(body);
 			req.session.authToken = jsonBody.access_token;
 			req.session.sfdcurl = jsonBody.instance_url;
 			if(jsonBody.access_token!=null) authenticated = true;
 			response.success = true;
 			response.data = {authenticated:true};
 		}
 		
 		res.json(response);
	});

};

exports.authStatus = function(req,res){
	var response = {};
	var authorized = false;
	var authenticated = false;
	if(req.session.authCode!=null) authorized = true;
    if(req.session.authToken!=null) authenticated = true;
    response.success = true;
    response.data = {authorized:authorized,authenticated:authenticated};
    res.json(response);
};

exports.getWSDL = function(req,res){
	var response = {};
	var fs = require('fs'); 
	fs.readFile('./wsdl/metadata.xml','UTF-8',function(err,body){
		if(err){
			response.success = false;
			response.data = error;
			res.json(response);
		}else{
			response.success = true;
			response.data = body;
			res.send(body);
		}
	})	
};

exports.describeService = function(req,res){
	var response = {};
	createSOAPClient(req).then(function(returnData){
		response.success = returnData.success;
		response.data = soapClient.describe();
		res.json(response);
	})


};


exports.listMetadata = function(req,res){
	var input = JSON.parse(req.body);
	var response = {};

	createSOAPClient(req).then(function(returnData){

		var client = returnData.data;
		var soapHdr = {"SessionHeader":{"sessionId":req.session.authToken}};
		client.addSoapHeader(soapHdr,'name','tns','http://soap.sforce.com/2006/04/metadata');

		client.MetadataService.Metadata.listMetadata(input,function(error,result){
			var response = {};
			if(error){
				response.success = false;
				response.data = error.body;
			}else{
				response.success = true;
				response.data = result.result;
			}
			res.json(response);
		})
	})
};


exports.readMetadata = function(req,res){
	var input = JSON.parse(req.body);
	var response = {};

	createSOAPClient(req).then(function(returnData){
		var client = returnData.data;
		var soapHdr = {"SessionHeader":{"sessionId":req.session.authToken}};
		client.addSoapHeader(soapHdr,'name','tns','http://soap.sforce.com/2006/04/metadata');

		client.MetadataService.Metadata.readMetadata(input,function(error,result){
			if(error){
				response.success = false;
				response.data = error.body;
			}else{
				response.success = true;
				response.data = result.result.records;
			}
			res.json(response);
		})
	})	

	
};


function createSOAPClient(req){
	var soapClient;
	var defer = q.defer();
	var response = {};
	response.success = true;
	

	if(soapClient){
		defer.resolve(response);
	}else{
		var url = req.protocol + '://' + req.headers.host + '/api/getWSDL';
		var options = {endpoint:req.session.sfdcurl + '/services/Soap/m/32.0'};
		soap.createClient(url,options,function(err,client){
			if(err){
				response.success = false;
				response.data = err;

			}else{
				soapClient = client;
				var soapHdr = {"SessionHeader":{"sessionId":req.session.authToken}};
				soapClient.addSoapHeader(soapHdr,'name','tns','http://soap.sforce.com/2006/04/metadata');
				response.data = soapClient;
			}
			defer.resolve(response);
		})
	}	

	return defer.promise;
	
}



function determineURL(req){
  var url = PRODURL;
  if(req.session.sfinstance == 'S') url = SBXURL;
  return url;
}