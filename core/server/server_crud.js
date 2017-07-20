"use strict";

/**
 * # Helper functions to process and route CRUD (Create, Read, Update, Delete) requests to the database using {@link http://socket.io/ socket.io} socket connections.
 * This forms part of "City"'s modular architecture. All sql queries are maintained on the server side and referenced by a JSON library with associated callback functions. A reference to the library is called from the client side and the callback delivers the requested data.
 * @module crud
 * @chapter server
 * @example
 * <caption>Callback functions are defined in the module's "server/module_name_queries.js" file. <br>Functions are called from the client side in the form of:</caption>
 * 	socket.emit('crud_type',{
 * 		module:'the_module',
 * 		task:'the_task',
 * 		tokens:[token1 , token, ....],
 * 		callback:[
 * 			{function_name:[param1, param2, ...]},
 * 			{function_name:[param1, param2, ...]}
 * 		]
 * 	});
 * */

var fs = require("fs");
var pg = require('pg');
var helpers=require(__root + "/core/server/server_helpers.js");



/*--------------------------------------------------------- get the database connection details */

var settings = helpers.get_settings();
var conString = helpers.makestring(settings.db);

exports.db = settings.db;

//inject the connection string back on successful install
exports.fixstring =  function(string){
	conString=string;
}

/*--------------------------------------------------------- load the query library from modules as a JSON object */
var q; //the query library object

var f=require(__root + "/core/server/server_moduleLoader.js");
f.fetch(["/core/modules","/contrib/modules"],'queries').then(function(data){
	q=data;
});



/**
 * connect to the database pool (called from {@link module:crud~process}, not to be used independantly)
 *
 * @param {string} query - the sql query
 * @param {array} keys - the replacement tokens for the query
 * @returns {object} The query result
 * */
var query=function(query,keys){
	var promise = new Promise(function(resolve, reject){
		pg.connect(conString, function(err, client, done) {
			
			if(err) {
				console.error(err)
				reject(err);
				return;
			}
			client.query(query,keys,function(err, result) {
				done(); // release the client back to the pool
				if(err) {
					reject(err);
				}else{
					resolve(result);
				}
			})
		});

	});
	return promise;
}

/**
 * Processes the CRUD request to the database, gets a result and runs callbacks
 *
 * @param {string} crud - The name of the type of crud operation
 * @param {string} cmd - The index name of the sql query to run
 * @param {object} socket - pass the active socket object
 * */
var process=function(crud,cmd,socket){
		if(cmd.module==='user'){
			cmd.module='core_user';
		}
		var sql=q[cmd.module][crud][cmd.task].sql;
		if(q[cmd.module][crud][cmd.task].tokens){
			var tokens=q[cmd.module][crud][cmd.task].tokens;
		}else if(cmd.tokens){
			var tokens = cmd.tokens;
		}else{
			var tokens = [];
		}
		query(sql,tokens).then(function(data){

			if(cmd.callback){
				//inject the socket to the module's query library
				q[cmd.module].socket(socket);
				//inject the query result to the module's query library
				q[cmd.module].result(data);
				//run the module's query library callback functions
				cmd.callback.forEach(function(foo){
					var comm = Object.keys(foo)[0];
					if(q[cmd.module][crud][cmd.task].callback[comm]){
						var action =q[cmd.module][crud][cmd.task].callback[comm];
						action.apply(this,foo[comm]);
					}else{
						var warn = new makeWarning('Function not found in crud '+crud,'The module callback function "'+cmd.task+'.'+comm+'" was not found in module '+'"'+cmd.module+'". Check what is calling it on the client side.');
						log(warn);
					}
				})
			}
		},function(err){
			log(err);
		});
}

/*--------------------------------------------------------- Export the CRUD commands to the html socket server @ "_root_/server.js" */


/**
 * CRUD Create
 *
 * @listens module:CORE~socket
 *
 * */
exports.create=function(socket){

	socket.on('create', function(cmd){
		process('create',cmd,socket);

	})
}
/**
 * CRUD Read
 *
 * @listens module:CORE~socket
 *
 * */
exports.read=function(socket){
	socket.on('read', function(cmd){
		console.log(cmd);
	})
}
/**
 * CRUD Update
 *
 * @listens module:CORE~socket
 *
 * */
exports.update=function(socket){
	socket.on('update', function(cmd){
		console.log(cmd);
	})
}
/**
 * CRUD Delete
 *
 * @listens module:CORE~socket
 *
 * */
exports.delete=function(socket){
	socket.on('delete', function(cmd){
		console.log(cmd);
	})
}
