"use strict";


var City=angular.module('City', ['ngMaterial','city','crud','map','tabs','ngScrollbar']);

var controller={};


angular.module('city',[])
.factory('$city', function($controller,$injector) {
	
	
	// global methods and values for the "city" module
	var city={};
	
	/*------------------------------------------------ City module injector */
	

	// scope for all injected controllers
	city.extensions={};
			
	city.extend=function(controllerName,$scope){
		
		$scope.controllerName=controllerName;
		var modules=$injector.annotate(controller[controllerName]);
		
		
		/*-------------------------------------------------Add in core extensions and methods */
		if(isInArray('$tabs',modules)){
			$injector.invoke(function($tabs){
				angular.extend($scope,$tabs);				
			});
			angular.extend(this,$controller('core_shared_tabs', {$scope:$scope}));		
		};
		
		
		/*-------------------------------------------------END add in core extensions and methods */		
				
		if(city.extensions[controllerName]){
			
			for(var i=0; i < city.extensions[controllerName].length; i++){
				angular.extend(this,$controller(city.extensions[controllerName][i], {$scope:$scope}));
			}
		}				
	}
	city.inject=function(target,controller){
		if(!city.extensions[target]){
			city.extensions[target]=[];
		}
		city.extensions[target].push(controller);		
	}

	return city;
});
