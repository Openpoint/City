"use strict";


controller.core_shared_tabs=function($scope,$tabs){
	/*
	 * Provides a scope function to process a click action from the tabs repeater in the scope.
	 * 
	 * @param {array} data The data to be passed with the click.
	 * */
	$scope.tabsClick=function(data){
		if(data){
			var obj=data[0].split('.');
			
			var fnc=$scope;
			if(obj.length > 1){
				for(var i = 0; i < obj.length; i++){
					fnc=fnc[obj[i]];					
					if(i === obj.length-2){
						var vari=fnc;
						console.log(vari);
					}
				}				
				if(typeof fnc === 'function'){					
					fnc.apply(this,data[1]);					
				}else{
					vari[obj[obj.length-1]]=data[1];
						
				}
			}else{

				if(typeof fnc[obj[0]]==='function'){										
					fnc[obj[0]].apply(this,data[1]);
				}else{
					fnc[obj[0]]=data[1];
				}
				
			}
		}else{
			var warn = new makeWarning('Tab action not defined','There is no function or value defined for a tab in controller "'+this.controllerName+'"');
			log(warn);
		}		
	}	
}

City.controller('core_shared_tabs',controller.core_shared_tabs);

angular.module('tabs',[]).factory('$tabs', function($timeout) {

	var tabs={};
	
		
	tabs.tabsAdd=function(controller,data){
		
		if(!this.tabsAll){
			this.tabsAll={};
			this.tabsAll[this.controllerName]=[];
		}
		
		if (!Array.isArray(data)){
			this.tabsAll[this.controllerName].push(data);
		}else{					
			this.tabsAll[this.controllerName]=this.tabsAll[this.controllerName].concat(data);
		}
		
	}	

	return tabs;
});
