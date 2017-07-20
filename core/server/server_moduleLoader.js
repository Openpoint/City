"use strict";


/* README
 * 
 * Helper module to read in server libraries from the modules. Libraries are in the naming convention of "moduleName_libraryType.js"
 * 
 * format for calling the instruction is:
 * modules.fetch([dir1,dir2,...],"libraryType");
 * 
 * Directories are generally "/core/modules" and "contrib/modules" but the array can expand if the needed in the future.
 * All subdirectories are scanned for files in "./server".
 * 
 * returns a promise object of the module library 
 * 
 * */

var fs = require("fs");

var f = {};
var modules={};

// load the library from files
f.loader=function(dir,module,type){
	var qpath=__root+dir+"/"+module+"/server/"+module+"_"+type+".js";
	if(fs.existsSync(qpath)){
		return require(qpath);
	}
	return false;	
}


/*-------------------------------------------------------------------- Creates the promise containing the library as a JSON object */
modules.fetch=function(location,type){
	var lib={};
	var len=location.length;
	var promise=new Promise(function(resolve, reject){
		location.forEach(function(dir){
			fs.readdir(__root + dir, function (err, files) {
				if (err) {
					log(err);
				}
				len--
				files.forEach(function(module){
					if(f.loader(dir,module,type)){
						lib[module]=f.loader(dir,module,type);
					}
				})
				if(len === 0){
					resolve(lib);
				}
			});
		})
	})
	return promise;
}

module.exports = modules;

