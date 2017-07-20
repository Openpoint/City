"use strict";

angular.module('map',[])
.factory('$map', function() {
	var map={};
	map.make=function(){
		return new ol.Map({
			layers: [
				new ol.layer.Tile({
					source: new ol.source.OSM()
				})

			],
			target: 'map',
			controls: ol.control.defaults({
				attributionOptions: /** @type {olx.control.AttributionOptions} */ ({
					collapsible: true
				})
			}),
			view: new ol.View({
				center: [0, 0],
				zoom: 2,
			})
		});		
	}
	return map;
});
