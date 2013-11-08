var express = require( 'express' );

/* Express */
var app = express.createServer();
app.use( express.bodyParser() );
app.use( express.cookieParser() );
app.use( express.session({
  secret: "saginomiya"
}));
app.use( express.static( __dirname + '/static' ) );


/* Server */
//Get the environment variables we need.
var ipaddr  = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";
var port    = process.env.OPENSHIFT_NODEJS_PORT || 8080;


/* RESTful JS */

app.get( /^\/module\/(.+)\/([^\/]+)$/, function ( req, res ) { 

  var moduleName = req.params[0];
  var method     = req.params[1];

  // cleare cache of RESTful JS
  for( var path in require.cache ) {
    if( path.match(/\\node_modules\\restfuljs\\/) ) {
      delete require.cache[ path ];
    }
  }

  // responder
  var responser = {
    send: function ( reply ) {
      if ( req.query.callback ) { // as JSONP
        reply = req.query.callback + "(" + JSON.stringify( reply ) + ");";
      }
      res.send( reply );
    }
  }

  var module  = require( "restfuljs/" + moduleName );
  var reply   = module[ method ]( req, responser );

  if ( reply ) {
    responser.send( reply );
  }

});

/* document root */
app.get( '/', function( req, res ) {
  res.redirect( '/index.html' );
});


// Server Start
app.listen( port, ipaddr );
