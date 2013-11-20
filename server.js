var express = require( 'express' );
var fs = require( 'fs' );
var mongodb = require( 'mongodb' );

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
// Get the environment variables we need.
var localHost = "127.0.0.1"; // for dev
var ipaddr  = process.env.OPENSHIFT_NODEJS_IP   || localHost;
var port    = process.env.OPENSHIFT_NODEJS_PORT || 8080;
var dataDir = process.env.OPENSHIFT_DATA_DIR    || "./data";
var moduleDir = dataDir + "/farfunction";
var authUsername = "admin";
var authPassword = "admin";
var authFile = dataDir + "/.auth";

var dbHost  = process.env.OPENSHIFT_MONGODB_DB_HOST || localHost;
var dbPort  = process.env.OPENSHIFT_MONGODB_DB_PORT || 27017;
var dbName  = process.env.OPENSHIFT_MONGODB_DB_NAME || "farfunction";
var dbUser  = process.env.OPENSHIFT_MONGODB_DB_USERNAME || "";
var dbPass  = process.env.OPENSHIFT_MONGODB_DB_PASSWORD || "";


var dbServer = new mongodb.Server( dbHost, parseInt( dbPort ) );
var db = new mongodb.Db( dbName, dbServer, { auto_reconnect: true, safe: false } );

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

/* Get Authentication Setting */
fs.readFile( authFile, "utf8", function ( err, data ) {
  if ( ! err ) {
    var lines = data.split( /\n/ );
    authUsername = lines[ 0 ];
    authPassword = lines[ 1 ];
  }
} );

/* Response Wrapper */
var wrapper = function ( req, res ) { 

  var moduleName = req.params[0];
  var method     = req.params[1];

  // responser
  res.return = function ( reply ) {
    if ( Object.prototype.toString.apply( reply ) == "[object Object]" ) {
      res.setHeader( 'Content-Type', 'application/json' );
      if ( req.query.callback ) { // as JSONP
        res.setHeader( 'Content-Type', 'text/javascript' );
        reply = req.query.callback + "(" + JSON.stringify( reply ) + ");";
      }
    }
    res.send( reply );
  }

  var module  = require( moduleDir + "/" + moduleName );
  var reply   = module[ method ]( req, res, mdb );

}

/* GET & POST Module */
app.all( /^\/call\/(.+)\/([^\/]+)$/, function ( req, res ) { wrapper( req, res ) } );

/* Admin Tools */

/* Need Basic Authentication */

app.all( '/admin/*', express.basicAuth( function ( user, pass ) {

    return user === authUsername && pass === authPassword;

}));

/* Write Module */
app.post( /^\/admin\/post\/([^\/]+)$/, function ( req, res ) { 

  var moduleName = req.params[0];

  fs.writeFile( moduleDir + "/" + moduleName + ".js", req.body.source, function ( err ) {
    if (err) {
      res.send( { status: 0 } ); 
    }
    else {
      res.send( { status: 1 } );
    }
  } );

  return false;  

} );

/* Check Exist Module */
app.get( /^\/admin\/exists\/(.+)$/, function ( req, res ) { 

  var moduleName = req.params[0];
  var exists = 1;

  try {
    var module = require.resolve( moduleDir + "/" + moduleName ); 
  } catch ( e ) {
    exists = 0;
  }
  
  res.send( { status: exists } );

} );

/* Read Module */
app.get( /^\/admin\/get\/([^\/]+)$/, function ( req, res ) { 

  var moduleName = req.params[0];

  fs.readFile( moduleDir + "/" + moduleName + ".js", "utf8", function ( err, data ) {
    if ( err ) {
      res.send( { status: 0 } ); 
    }
    else {
      res.send( { 
        status: 1, 
        source: data
      } );
    }
  } );

  return false;  

} );


/* Module Cache Clear */
app.get( /^\/admin\/refresh\/(.+)$/, function ( req, res ) { 

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

/* Set Authentication  */
app.post( /^\/admin\/setAuth/, function ( req, res ) {

  var auth = req.body.username + "\n" + req.body.password;

  fs.writeFile( authFile, auth, function ( err ) {
    if ( err ) {
      res.send( { status: 0 } ); 
    }
    else {
      authUsername = req.body.username;
      authPassword = req.body.password;
      res.send( { status: 1 } );
    }
  } );

  return false;  
  
} );

/* Rear Guard ! */
process.on( 'uncaughtException', function ( error ) {
  console.log( 'error: ' + error );
} );

// server start with mongodb

var mdb;

var connectDb = function( callback ){
  db.open( function( err, db ){
    if( err ){ throw err };
    mdb = db;
    if ( dbUser ) {
      db.authenticate( dbUser, dbPass, { authdb: "admin" }, function( err, res ){
        if( err ){ throw err };
        callback();
      } );
    }
    else {
      callback();
    }
  } );
};

connectDb( function () { app.listen( port, ipaddr ) } );




