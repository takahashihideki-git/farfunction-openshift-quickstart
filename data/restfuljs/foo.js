var request = require("request");

exports.get = function( req, res ) {

  res.send( { foo: "bar" } )

}