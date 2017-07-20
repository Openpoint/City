"use strict";

var fs = require("fs");


/*------------------------------------------------------------- global log constructor */
var qpath=__root+'/log/server.log';
log=function(data){
	var date=new Date();
	var stamp = date.getHours()+":"+date.getMinutes()+":"+date.getSeconds();
	if(!fs.existsSync(qpath)){
		fs.writeFileSync(qpath,date+'\n\n');
	}
	var file = fs.readFileSync(qpath, 'utf8');
	var lines = file.split("\n");
		

			
	// rename files incrementally if log file is full
	if(lines.length > 100){
		
		var dir = __root+'/log/';
		var files = fs.readdirSync(dir);
		var x=[];
		files.forEach(function(file){
			if(file.split('.')[0].split('_')[0]==='server'){
					x.push(file);
			};
		})
		files=x;
		
		var k = files.length
		for (var i = files.length-1; i >= 0 ; i--) {
			var newname='server_'+i+'.log';
			fs.renameSync(dir+files[i], dir+newname)
		}
		fs.writeFileSync(qpath,date+'\n\n');
	}
	var text=stamp+' | '+data.severity+' | '+data.name+' : '+data.message+'\n\t'+data.stack+'\n\n';
	fs.appendFileSync(qpath,text);	
	console.error(text);
}



