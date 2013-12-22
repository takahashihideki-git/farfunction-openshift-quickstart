farfunction-openshift-quickstart
================================

OpenShift quickstart for "Far Function ( js )".


Far Function ( js ) is
=======================

"Far function ( js )" provides a "Web function" instead of "Web application".

Developer will develop the "Web function" as a module for node.js.

Developers can register to server "Web function" using a Web form.

The user will be able to call in RESTful URL "Web function".

For example ...


<h4>Hello World!</h4>

<pre><code>exports.func1 = function ( request, response ) {

  response.return( { text: "Hello World!" } );

}

exports.func2 = function ( request, response ) {

    response.return( "&lt;html&gt;&lt;body&gt;&lt;h1&gt;Hello World!&lt;/h1&gt;&lt;/body&gt;&lt;/html&gt;" );

}
  
// e.g.
// module name: helloworld

// url: http://example.com/call/helloworld/func1
// response body is JSON: { "text": "Hello World"}

// url: http://example.com/call/helloworld/func1?callback=cb
// response body is JSONP: cb( { "text": "Hello World"} )

// url: http://example.com/call/helloworld/func2
// response body is HTML:&lt;html&gt;&lt;body&gt;&lt;h1&gt;Hello World!&lt;/h1&gt;&lt;/body&gt;&lt;/html&gt;
</code></pre>

<h4>In the <a href="http://expressjs.com/">express</a></h4>

<pre><code>// The "request" and "response" parameter is an object in express ( response.return method is extension by far function ).

// get query parameters of GET request
exports.func1 = function ( request, response ) {

  response.return( { text: request.query.text } );

}

// get parameters in request body of POST request
exports.func2 = function ( request, response ) {

  response.return( { text: request.body.text } );

}
</code></pre>

<h4>With the <a href="http://mongodb.github.io/node-mongodb-native/">mongodb</a></h4>

<pre><code>// the "db" parameter is mongodb handler. 

exports.insert = function ( request, response, db ) {

  var collection = db.collection( "test" );
  collection.insert( { text: request.query.text }, function ( err, result ) {
    if ( err ) {
      response.return( { status: 0, error: err } );
    }
    else {
      response.return( { status: 1, result: result } );
    }
  } );

}

exports.find = function ( requst, response, db ) {

  var collection = db.collection( "test" );

  collection.find().toArray( function( err, docs ) {
    if ( err ) {
      response.return( { status: 0, error: err } );
    }
    else {
      response.return( docs );
    }
  } );

}
</code></pre>

<h4>You can load some useful modules.</h4>

<pre><code>// <a href="https://github.com/mikeal/request">request</a>
var request = require( "request" );
// <a href="https://github.com/Leonidas-from-XIV/node-xml2js">xml2js</a>
var parseXML = require( "xml2js" ).parseString;
// <a href="https://github.com/cho45/node-here.js">here</a>
var here = require( 'here' ).here;
// <a href="https://github.com/visionmedia/ejs">ejs</a>
var ejs = require( 'ejs' );
</code></pre>


Default Credentials
=================== 

username=admin, password=admin


Demo
====

https://demo-farfunction.rhcloud.com/
