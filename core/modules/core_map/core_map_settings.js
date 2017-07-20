var settings={
	'isPage':true,
	'required':true,
	'depends':[],
	'extends':[],
	'page':{
		'title':'City Map',
		'description':'Web GIS for the masses',
		'url':'map',
		'jsModules':['openlayers/dist/ol.js'],
		'angular':true,
		'angularModules':['/ng-scrollbar/dist/ng-scrollbar.min.js'],
		'css':['openlayers/dist/ol-debug.css','ng-scrollbar/dist/ng-scrollbar.min.css']
	}
}

module.exports = settings;
