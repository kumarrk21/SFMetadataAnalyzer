# SF Metadata Analyzer

Have you ever wanted to audit your Salesforce Profiles and Permission sets? For e.g., you want to know which record types are visible to a particular profile. Or you may want to know what applications and tabs are used in which profiles and permission sets. Unfortunately, there is no out of the box capability in the platform to readily access this information. Yes, you could use the Force.com eclipse plug-in or the Ant migration tool to download the metadata as XML files and parse through the XML data to get this information but that's boring manual work. 

This package for created to address just that need. This is a Nodejs application which accessess your Salesforce instance using OAuth and once authorized, will use the <a hef='https://www.salesforce.com/us/developer/docs/api_meta/'>Metadata API</a> to access all the Profile or Permission set information. Once the data is pulled from your Salesforce instance, this app enables you to view specific information or download it as CSV files.

This package uses the following technologies and frameworks
- NodeJS 	(http://nodejs.org/)
- ExpressJS (http://expressjs.com/)
- A bunch of utility node modules (lodash, q, soap, rqeuest etc., look at the package.json for more information)
- AngularJS (https://angularjs.org/)
- Ionic Framework (http://ionicframework.com/)
- Filesaver.js (https://github.com/eligrey/FileSaver.js/)

