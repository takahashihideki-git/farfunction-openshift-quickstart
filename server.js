var express = require( 'express' );
var fs = require( 'fs' );

/* Express */
var app = express.createServer();
app.use( express.bodyParser() );
app.use( express.cookieParser() );
app.use( 
  express.session( {
    secret: "saginomiya"
  } )
);
app.use( express.static( __dirname + '/static' ) );


/* Server */
//Get the environment variables we need.
var ipaddr  = process.env.OPENSHIFT_NODEJS_IP   || "127.0.0.1";
var port    = process.env.OPENSHIFT_NODEJS_PORT || 8080;
var dataDir = process.env.OPENSHIFT_DATA_DIR    || "./data";
var moduleDir = dataDir + "/farfunction";

/* Far Function */

/* Make Writable Module Directory */
try {
  fs.statSync( moduleDir )
} catch ( e ) {
  fs.mkdirSync( moduleDir, 0777 );
}
/* Make Symbolic Link of "node_modules" on Module Directory */
try {
  fs.statSync( moduleDir + "/node_modules" )
} catch ( e ) {
  fs.symlinkSync(
    __dirname + "/node_modules",
    moduleDir + "/node_modules",
    "dir"
  );
}

/* Response Wrapper */
var wrapper = function ( req, res ) { 

  var moduleName = req.params[0];
  var method     = req.params[1];

  // responser
  var responser = {
    send: function ( reply ) {
      if ( req.query.callback ) { // as JSONP
        reply = req.query.callback + "(" + JSON.stringify( reply ) + ");";
      }
      res.send( reply );
    },
    redirect: function ( to ) {
      res.redirect( to );
    }
  }

  var module  = require( moduleDir + "/" + moduleName );
  var reply   = module[ method ]( req, responser );

  if ( reply ) {
    responser.send( reply );
  }

}

/* GET & POST Module */
app.get( /^\/module\/(.+)\/([^\/]+)$/, function ( req, res ) { wrapper( req, res ) } );
app.post( /^\/module\/(.+)\/([^\/]+)$/, function ( req, res ) { wrapper( req, res ) } );

/* Write Module */
app.post( /^\/post\/([^\/]+)$/, function ( req, res ) { 

  var moduleName = req.params[0];

  fs.writeFile( moduleDir + "/" + moduleName + ".js", req.body.source, function ( err ) {
    if (err) {
      res.send( { status: 0 } ); 
    }
    else {
      res.send( { status: 1 } );
    }
  });

  return false;  

} );

/* Check Exist Module */


/* Read Module */


/* Module Cache Clear */
app.get( /^\/refresh\/(.+)$/, function ( req, res ) { 

  var moduleName = req.params[0];
  var module = require.resolve( moduleDir + "/" + moduleName ); 
  var status = 1;
  try {
    delete require.cache[ module ];
  } catch ( e ) {
    status = 0;   
  }
  res.send( { 
    status: status,
    module: module  
  } );

} );

/* Document Root */
app.get( '/', function( req, res ) {
  res.redirect( '/index.html' );
} );

// server start
app.listen( port, ipaddr );
