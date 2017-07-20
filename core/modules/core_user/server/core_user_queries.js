"use strict";

/**
 * # Provides queries for the user module
 * 
 * Table columns:
 * uuid
 * name
 * password
 * date_added
 * 
 * @namespace module:server/crud~userqueries
 * 
 * 
 * 
 * */




/**
 * The sql query library
 * */
var q={};

q.create={};
q.read={};
q.update={};
q.delete={};

//pass in the active socket and query results(handy for callbacks)
var socket;
var result;
q.socket=function(sock){
	socket=sock;
}
q.result=function(data){
	result=data;
}


/*------------------------------------Create-------------------------------------------------------*/

//------------------------------------table
q.create.table={};

q.create.table.sql=`
	CREATE TABLE users (
		uuid bigserial primary key,
		name text NOT NULL,
		password text NOT NULL,
		date_added timestamp default NULL
	)
`;

q.create.table.tokens=[];

//------------------------------------new user
q.create.newuser={};
// query
q.create.newuser.sql=`
	INSERT INTO users (name,password,date_added)
	VALUES ($1,$2,NOW());
`;

// callbacks
q.create.newuser.callback={};
q.create.newuser.callback.saved=function(){
	socket.emit('saved','user');
}

//tell the router that the system is installed after the adminuser has been created
q.create.newuser.callback.installed=function(){
	install=false;
}
/*------------------------------------Read-------------------------------------------------------*/
module.exports = q;
