exports.get = function( req, res ) {
	return obj = { value: "日本語", param: req.params }; 
};

exports.printq = function( req, res ) {
	return req.query; 
};