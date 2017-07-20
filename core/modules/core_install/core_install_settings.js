"use strict";
/**
 * @module install
 * @chapter server
 * */

/**
 * settings for the module
 * 
 * @namespace
 * */
var settings={
	'isPage':true,
	'required':true,
	'depends':[],
	'extends':[],
	'page':{
		'title':'Install',
		'description':'Install page for City',
		'url':'install',
		'source':[
			'core_install',
			'test'
		],
		'jsModules':[],
		'angular':true,
		'angularModules':['/angular-ui-bootstrap/ui-bootstrap-tpls.min.js'],
		'css':[]
	}
}

module.exports = settings;
