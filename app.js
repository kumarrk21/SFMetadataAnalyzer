
/**
 * Module dependencies
 */

var express = require('express');
var index = require('./routes/index');
var api = require('./routes/api')
var http = require('http');
var path = require('path');
var session = require('express-session');
var bodyParser = require('body-parser');

var app = module.exports = express();
var cookie = {secret:true};
if(process.env.UNSECURE) cookie = {secret:false};

app.use(session({ resave: false,
                  saveUninitialized: true,
                  secret: 'SFMetaDataAnalyzer',
                  unset:null,
                  cookie: cookie }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.text());
app.use(bodyParser.urlencoded({extended:true}));
app.set('port', process.env.PORT);
app.set('views', __dirname + '/public');
app.engine('.html', require('ejs').__express);
app.set('view engine', 'html');


// serve index and view partials
app.get('/', index.main);
app.get('/api/getOAuthURL',api.oAuthURL);
app.get('/api/authenticate',api.authenticate);
app.get('/api/getAuthStatus',api.authStatus);
app.get('/api/getWSDL',api.getWSDL);
app.get('/api/describeService',api.describeService);
app.post('/api/listMetadata',api.listMetadata);
app.post('/api/readMetadata',api.readMetadata);
app.get('/api/refreshSession',api.refreshSession)
// redirect all others to the index (HTML5 history)
app.get('*', index.main);

http.createServer(app).listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});
