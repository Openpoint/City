"use strict";

/* README
 *
 * returns a library as a JSON object of functions to call to construct
 * html as a string. This is returned to the router to serve for each route.
 *
 * Route settings are defined in the settings file for each individual module
 *
 * All css and JS is optionally concatenated and minified as flagged in the
 * global settings
 *
 * */

var fs=require('fs');
var compressor = require('node-minify');
var Pointer = require('object-pointer');

/* ---------------------------------------------------------------------- get a library of page related module resources */
var f={};

// recursively scan the modules directories and build a JSON library object
f.libBuild=function(qpath,p,deep){

	var files = fs.readdirSync(qpath);
	files.forEach(function(file){
		var rpath=qpath+'/'+file;
		if(fs.lstatSync(rpath).isDirectory() && file!='server'){
			p.create(file);
			if(!deep){
				p.set([file,'root'],qpath+'/');
			}
			var x = new Pointer(p,file);
			f.libBuild(rpath,x,true);
		}else if(file!='server'){
			var xfile=file.split('.');
			var yfile=xfile[0].split('_');
			switch (yfile[yfile.length-1]){
				case 'settings':
					var poo=require(rpath);
					p.set(['settings'],poo);
				break;
				default:
					var spath=rpath.split('/modules/');
					spath.shift();
					spath = spath.join('/modules/');
					p.set([xfile[0]],spath);
			}
		}
	})
}

var lib={};

// use NPM 'object-pointer' module to keep track of object recursion position relative to file structure
var p = new Pointer(lib, []);
f.libBuild(__root+"/core/modules",p);
p = new Pointer(lib,[]);
f.libBuild(__root+"/contrib/modules",p);

//console.log(JSON.stringify(lib,null,'\t'));

/* ---------------------------------------------------------------------- Javascript and CSS minifier */
f.minify=function(type,mod,files){

	var promise=new Promise(function(resolve,reject){
		switch(type){
			case 'clean-css':
				var fo=__root+'/static/cache/css/'+mod+'/'+mod+'.min.css';
				var rs='cache/css/'+mod+'/'+mod+'.min.css';
			break;
			case 'uglifyjs':

				var fo=__root+'/static/cache/js/'+mod+'/'+mod+'.min.js';
				var rs='cache/js/'+mod+'/'+mod+'.min.js';
			break;
			default:
				var err=new makeError('Minifier not specified','"'+type+'" is not a recognised minifier');
				reject(err);
		}
		new compressor.minify({
			type: type,
			fileIn: files,
			fileOut: fo,
			tempPath: '/tmp/',
			callback: function(err, min){
				if(err){
					reject(err);
				}else{
					resolve(rs);
				}
			}
		});
	})
	return promise;
}

/* ---------------------------------------------------------------------- HTML section constructors */
//Head

// feeds in 'title' and 'description' from the module's settings.js
f.head=function(title,description){
	var head=fs.readFileSync(lib.core_shared.root+lib.core_shared.client.page.html.head,'UTF8');
	head=head.replace(/{{title}}/g,title);
	head=head.replace(/{{description}}/g,description);
	return head;
}

// Javascript for head
f.js=function(mod){
	// The short paths for static dir root ref
	var js=[];
	// The long paths to send to minifier
	var f_js=[];

	// Constructor for different Angular controller types
	function parts(type){
		// get system required js from "core_shared" module first
		for(var path in lib.core_shared.client.page[type]) {
			if(lib.core_shared.client.page[type].hasOwnProperty(path)){
				js.push(lib.core_shared.client.page[type][path]);
				f_js.push(__root+'/core/modules/'+lib.core_shared.client.page[type][path]);
			}
		}

		// get additional js from modules
		for(var path in lib[mod].client.page[type]) {
			if(lib[mod].client.page[type].hasOwnProperty(path)){
				js.push(lib[mod].client.page[type][path]);
				f_js.push(lib[mod].root+lib[mod].client.page[type][path]);
			}
		}
	}

	// promise of the js locations in HTML
	var promise=new Promise(function(resolve,reject){
		if(lib[mod].settings.js && Settings.performance.compress.js){
			// serve the cached resource if it exists
			resolve('\t<script src="'+lib[mod].settings.js+'"></script>\n');
		}else{
			// construct a new resource to cache or serve

			// add socket.io and shared common js
			js.push('/socket.io/socket.io.js');
			js.push('/system/common.js');
			f_js.push(__root+'/node_modules/socket.io/node_modules/socket.io-client/socket.io.js');
			f_js.push(__root+'/static/system/common.js');

			// add 3rd party npm modules
			if(lib[mod].settings.page.jsModules.length > 0){
				var root=__root+'/node_modules';
				lib[mod].settings.page.jsModules.forEach(function(script){
					if(fs.existsSync(root+'/'+script)){
						js.push(script);
						f_js.push(root+'/'+script);
					}else{
						var err=new makeError('html build error','The script "'+root+'/'+script+'" could not be found');
						log(err);
					}
				})
			}

			// add angular.js if required
			if(lib[mod].settings.page.angular){
				js.push('/angular/angular.js');
				f_js.push(__root+'/node_modules/angular/angular.min.js');
				js.push('/angular-material/angular-material.js');
				f_js.push(__root+'/node_modules/angular-material/angular-material.min.js');
				js.push('/angular-animate/angular-animate.js');
				f_js.push(__root+'/node_modules/angular-animate/angular-animate.min.js');
				js.push('/angular-aria/angular-aria.js');
				f_js.push(__root+'/node_modules/angular-aria/angular-aria.min.js');
				js.push('/ng-scrollbar/dist/ng-scrollbar.min.js');
				f_js.push(__root+'/ng-scrollbar/dist/ng-scrollbar.min.js');
				if(lib[mod].settings.page.angularModules.length > 0){
					var root=__root+'/node_modules';
					lib[mod].settings.page.angularModules.forEach(function(script){
						if(fs.existsSync(root+script)){
							js.push(script);
							f_js.push(root+script);
						}else{
							var err=new makeError('html build error','The script "'+root+script+'" could not be found');
							log(err);
						}
					})
				}
			}

			// add angular modules
			if(lib[mod].settings.page.angular && lib[mod].settings.page.angularModules.length > 0){
				var root=__root+'/node_modules';
				lib[mod].settings.page.angularModules.forEach(function(script){
					if(fs.existsSync(root+'/'+script)){
						js.push(script);
						f_js.push(root+'/'+script);
					}else{
						var err=new makeError('html build error','The script "'+root+'/'+script+'" could not be found');
						log(err);
					}
				})
			}

			//create the JS refs for the application(s)
			parts('apps');

			// get global js from "core_shared" module first
			for(var path in lib.core_shared.client.js) {
				if(lib.core_shared.client.js.hasOwnProperty(path)){
					js.push(lib.core_shared.client.js[path]);
					f_js.push(__root+'/core/modules/'+lib.core_shared.client.js[path]);
				}
			}

			// get global js from this module
			for(var path in lib[mod].client.js) {
				if(lib[mod].client.js.hasOwnProperty(path)){
					js.push(lib[mod].client.js[path]);
					f_js.push(lib[mod].root+lib[mod].client.js[path]);
				}
			}

			// inject global js from all other modules that extend this module
			if(extension[mod]){
				extension[mod].forEach(function(ext){
					for(var path in lib[ext].client.js) {
						if(lib[ext].client.js.hasOwnProperty(path)){
							js.push(lib[ext].client.js[path]);
							f_js.push(lib[ext].root+lib[ext].client.js[path]);
						}
					}
				})
			}

			//create the JS refs for each angular MVC type
			parts('directives');
			parts('filters');
			parts('controllers');

			// construct the uncompressed js refs
			var js2='';
			js.forEach(function(code){
				js2=js2+'\t<script src="'+code+'"></script>\n';
			})

			if(!Settings.performance.compress.js){
				// return the uncompressed js refs
				resolve(js2);
			}else{
				// compress and return the compressed js ref
				f.minify('uglifyjs',mod,f_js).then(function(data){
					lib[mod].settings.js=data;
					resolve('\t<script src="'+lib[mod].settings.js+'"></script>\n');
				},function(err){
					reject(err);
				})
			}
		}

	})
	return promise;

}

// CSS for head
f.css=function(mod){
	// The short paths for static dir root ref
	var css=[];
	// The long paths to send to minifier
	var f_css=[];

	// promise of the CSS HTML refs string
	var promise=new Promise(function(resolve,reject){
		if(lib[mod].settings.css && Settings.performance.compress.css){
			// serve the cached resource if it exists

			resolve('\t<link rel="stylesheet" href="'+lib[mod].settings.css+'" />\n');
		}else{
			// construct a new resource to cache or serve

			// add bootstrap
			//css.push("bootstrap/dist/css/bootstrap.css");
			//f_css.push(__root+"/node_modules/bootstrap/dist/css/bootstrap.css");
			// add angular.js if required
			if(lib[mod].settings.page.angular){
				css.push("angular-material/angular-material.css");
				f_css.push(__root+"/node_modules/angular-material.min.css");
				css.push("ng-scrollbar/dist/ng-scrollbar.min.css");
				f_css.push(__root+"/node_modules/ng-scrollbar/dist/ng-scrollbar.min.css");
			}
			// add 3rd party npm CSS
			if(lib[mod].settings.page.css.length > 0){
				var root=__root+'/node_modules';
				lib[mod].settings.page.css.forEach(function(cssf){
					if(fs.existsSync(root+'/'+cssf)){
						css.push(cssf);
						f_css.push(root+'/'+cssf);
					}else{
						var err=new makeError('html build error','The css file "'+root+'/'+cssf+'" could not be found');
						log(err);
					}
				})
			}

			// add system required CSS fom 'core_shared' module
			for(var path in lib.core_shared.client.css) {
				if(lib.core_shared.client.css.hasOwnProperty(path)){
					css.push(lib.core_shared.client.css[path]);
					f_css.push(lib.core_shared.root+lib.core_shared.client.css[path])
				}
			}
			// add CSS from modules
			for(var path in lib[mod].client.css) {
				if(lib[mod].client.css.hasOwnProperty(path)){
					css.push(lib[mod].client.css[path]);
					f_css.push(lib[mod].root+lib[mod].client.css[path])
				}
			}
			// construct the uncompressed CSS refs
			var css2='';
			css.forEach(function(code){
				css2=css2+'\t<link rel="stylesheet" href="'+code+'" />\n';
			})

			if(!Settings.performance.compress.css){
				// return the uncompressed CSS refs
				resolve(css2);
			}else{
				// compress and return the compressed CSS ref
				f.minify('clean-css',mod,f_css).then(function(data){
					lib[mod].settings.css=data;
					resolve('\t<link rel="stylesheet" href="'+lib[mod].settings.css+'" />\n');
				},function(err){
					reject(err);
				})
			}
		}
	})
	return promise;
}

// HTML Body
f.body=function(mod){

	var body='';
	for(var html in lib[mod].client.page.html) {
		if(lib[mod].client.page.html.hasOwnProperty(html)){
			body=body+fs.readFileSync(lib[mod].root+lib[mod].client.page.html[html],'UTF8');
		}
	}
	return body;
}


/* ---------------------------------------------------------------------- Parse the library object and export constructor functions */
var html={}
html.page={};
html.pages=[];

var extension={};

// Map module extensions to an object
for(var prop in lib) {
	if(lib.hasOwnProperty(prop) && lib[prop].settings && lib[prop].settings.extends.length > 0){

		lib[prop].settings.extends.forEach(function(module){
			if(!extension[module]){
				extension[module]=[];
			}
			extension[module].push(prop);
		})
	}
}

for(var prop in lib) {
    if(lib.hasOwnProperty(prop))
		// check if module defines a page
        if(lib[prop].settings && lib[prop].settings.isPage){
			var code;
			// Get an array of page references as module names
			html.pages.push(prop);

			// Build a page constructor function to export. Named by module name
			html.page[prop]=function(prop){
				var promise=new Promise(function(resolve,reject){
					code=f.head(lib[prop].settings.page.title,lib[prop].settings.page.description)+'\n\n';
					f.css(prop).then(function(data){
						code=code+data+'\n\n';
						return f.js(prop);
					},function(err){
						reject(err);
					}).then(function(js){
						code=code+js+'\n\n';
						code=code+'</head>\n\t<body>\n';
						code=code+f.body(prop);
						code=code+'\t</body>\n</html>';

						// send the page code
						resolve(code);

					},function(err){
						reject(err);
					})
				})
				return promise;
			}
		}
}
html.lib=lib;
module.exports = html;
