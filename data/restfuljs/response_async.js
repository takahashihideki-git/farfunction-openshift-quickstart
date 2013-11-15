var request = require("request");

exports.get = function( req, res ) {

  var requestedUrlRoot = 'http://' + req.headers.host;

	var args = {
		"method": "GET",
			"url": requestedUrlRoot + "/sample.json",
	};
	request( args, function( error, response, body ){
		res.send( body )
	});

	return false;

};