"use strict";

/**
 * Boots the application and provides server with routes to various page modules.
 *
 * @module CORE
 * @chapter server
 */

var express = require('express');
var app = express();

/**
 * The aggragated global settings object
 *
 * @global
 * @type {object}
 * */
global.Settings={};


Settings.performance={}
Settings.performance.compress={};
Settings.performance.compress.js=false;
Settings.performance.compress.css=false;

global.__root=__dirname; // set new global for the root directory
global.install=true;

var makelog=require(__root+"/static/system/common.js");

global.makeError=makelog.makeError;
global.makeWarning=makelog.makeWarning;
global.log=null;





/* ------------------------------------------------------ static file compression */


var compression = require('compression')
function shouldCompress(req, res) {
	if (req.headers['x-no-compression']) {

		// don't compress responses with this request header
		return false
	}
	// fallback to standard filter function
	return compression.filter(req, res)
}
app.use(compression({filter: shouldCompress}));


var server = require('http').Server(app);


var io = require('socket.io')(server);




/* ------------------------------------------------------ 'City' custom modules */
require(__root + "/core/server/server_logging.js");
var crud = require(__dirname + '/core/server/server_crud.js');
var helpers = require(__root + "/core/server/server_helpers.js");
var html = require(__root + "/core/server/server_htmlBuilder.js");


/* ------------------------------------------------------ Router */

/**
 * Redirects a page request
 *
 * @param {object} res Pass the response from the request
 * @param {string} url The URL to redirect to
 * @param {string} body The body content to send
 * @param {string} code The header code to send with the redirect
 * */
var redirect=function(res,url,body,code){
	res.writeHead(code, {
		'Location': url,
		'Content-Length': body.length,
		'Content-Type': 'text/plain',
		'Cache-Control': 'max-age=0, must-revalidate'
	});
	res.end(body);
}

// check if system is installed
helpers.check_db(crud.db).then(function(data){
	install=data;
});

// create the routes
html.pages.forEach(function(page){
console.log(page)
	if(page!='core_install'){
		app.get('/'+html.lib[page].settings.page.url, function(req, res){
			if(install){
				redirect(res,"/install","302 run install",302);
			}else{
				html.page[page](page).then(function(data){
					console.log(data)
					res.end(data);
				},function(err){
					log(err);
				})
			}
		})
	}else{
		app.get('/'+html.lib[page].settings.page.url, function(req, res){
			if(!install){
				redirect(res,"/admin","302 already installed",302);
			}else{
				html.page[page](page).then(function(data){

					res.end(data);
				},function(err){
					log(err);
				})
			}
		})
	}
})


app.get(['/help', '/help/*'], function(req, res){
	res.sendFile('/var/www/html/city2/static/docs/api/');
})


var oneDay = 86400000;
//app.use(express.static(__dirname + '/node_modules', { maxAge: oneDay }));
//app.use(express.static(__dirname + '/core/client', { maxAge: oneDay }));
app.use(express.static(__dirname + '/node_modules'));
app.use(express.static(__dirname + '/core/modules'));
app.use(express.static(__dirname + '/contrib/modules'));
app.use(express.static(__dirname + '/static', { maxAge: oneDay }));
app.use(express.static(__dirname + '/static/system', { maxAge: oneDay }));
app.use(express.static(__dirname + '/static/docs/api', { maxAge: oneDay }));
//app.use(express.static('/var/www/html/city2/dist', { maxAge: oneDay }));


/**
 * The socket connection container made by {@link http://socket.io/ socket.io} including listener.
 *
 * @event module:server/CORE.io
 * @property {string} connection - Listens for incoming connection to server
 * */
io.on('connection', function(socket){
	/**
	 * A client connects to the server and a new {@link http://socket.io/ socket.io} socket is created. The socket listens to the clients for named events enumerated in the properties and responds accordingly.
	 *
	 * @event module:server/CORE~socket
	 * */

	socket.on('installcheck',function(data){
		helpers.check_db(data).then(function(mess){
			socket.emit('installcheck',mess);
		});
	})


	// save the install settings to file
	socket.on('installsave',function(data){
		helpers.write_settings(data).then(function(){
			socket.emit('saved','settings');
		});
	})

	//register crud operations for each socket connection
	crud.create(socket);
	crud.read(socket);
	crud.update(socket);
	crud.delete(socket);

	socket.on('disconnect', function(){

	});

});

/* ------------------------------------------------------ Start the HTML server */
var port=process.argv[2];
if(!port){
	port=helpers.get_settings().nodeport;
}
if(!port){
	port=8082;
}
server.listen(port, function(){
	console.log('City is listening for connections on port:'+port)
});
