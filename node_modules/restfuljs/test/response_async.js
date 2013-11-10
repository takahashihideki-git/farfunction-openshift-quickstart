var request = require("request");

exports.get = function( req, res ) {

console.log( req )

    var requestedUrlRoot = 'http://' + req.headers.host;

console.log( requestedUrlRoot );

	var args = {
		"method": "GET",
			"url": requestedUrlRoot + "/sample.json",
	};
	request( args, function( error, response, body ){
		res.send( body )
	});

	return false;

};