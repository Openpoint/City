"use strict";

/*------------------------------------------------------------- global custom error constructors */

// error

var makeError=function(name, message) {
	this.name = name || 'Undefined Error';
	this.message = message || 'No Message';
	this.severity = 'ERROR';
	this.stack = (new Error()).stack;
}
makeError.prototype = Object.create(Error.prototype);
makeError.prototype.constructor = makeError;

// warning

var makeWarning=function(name, message) {
	this.name = name || 'Undefined Warning';
	this.message = message || 'No Message';
	this.severity = 'WARNING';
	this.stack = (new Error()).stack;
}
makeWarning.prototype = Object.create(Error.prototype);
makeWarning.prototype.constructor = makeWarning;

if(typeof require==='function'){
	var makelog={};
	makelog.makeError=makeError;
	makelog.makeWarning=makeWarning;
	module.exports = makelog;
	
}else{
	
	var log=function(data){
		switch (data.severity){
			case 'ERROR':
				console.error(data.name+' : '+data.message);
			break;
			case 'WARNING':
				console.warn(data.name+' : '+data.message);
			break;
			default:
				console.log(data.name+' : '+data.message);
		}
	}
}
