
/*
 * GET home page.
 */

exports.main = function(req, res){
  var code = req.param('code');
  if(code!=null) req.session.authCode = code;
  res.render('main');
};
