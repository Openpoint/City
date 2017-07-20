var dmAtix = angular.module("dmAtix", ['ngMaterial'])
.config(['$provide', '$mdThemingProvider', function($provide, $mdThemingProvider) {

		/**
         * Of form:
         * {
         *  'blue':{ // Palette name
         *      '50': #abcdef, // Color name: color value
         *      '100': #abcdee,
         *          ...
         *      },
         *      ...
         * }
         * @type {{}}
         */
        var colorStore = {};

        //fetch the colors out of the themeing provider
        Object.keys($mdThemingProvider._PALETTES).forEach(
            // clone the pallete colors to the colorStore var
            function(palleteName) {
                var pallete = $mdThemingProvider._PALETTES[palleteName];
                var colors  = [];
                colorStore[palleteName]=colors;
                Object.keys(pallete).forEach(function(colorName) {
                    // use an regex to look for hex colors, ignore the rest
                    if (/#[0-9A-Fa-f]{6}|0-9A-Fa-f]{8}\b/.exec(pallete[colorName])) {
                        colors[colorName] = pallete[colorName];
                    }
                });
            });

        /**
         * mdThemeColors service
         *
         * The mdThemeColors service will provide easy, programmatic access to the themes that have been configured
         * So that the colors can be used according to intent instead of hard coding color values.
         *
         * e.g.
         *
         * <span ng-style="{background: mdThemeColors.primary['50']}">Hello World!</span>
         *
         * So the theme can change but the code doesn't need to.
         */
        $provide.factory('mdThemeColors', [
            function() {
				
                var service = {};

                var getColorFactory = function(intent){
					
                    return function(){
                        var colors = $mdThemingProvider._THEMES['default'].colors[intent];
                        var name = colors.name
                        // Append the colors with links like hue-1, etc
                        colorStore[name].default = colorStore[name][colors.hues['default']]
                        colorStore[name].hue1 = colorStore[name][colors.hues['hue-1']]
                        colorStore[name].hue2 = colorStore[name][colors.hues['hue-2']]
                        colorStore[name].hue3 = colorStore[name][colors.hues['hue-3']]
                        return colorStore[name];
                    }
                }

                /**
                 * Define the getter methods for accessing the colors
                 */
					
                Object.defineProperty(service,'primary', {
                    get: getColorFactory('primary')
                });

                Object.defineProperty(service,'accent', {
                    get: getColorFactory('accent')
                });

                Object.defineProperty(service,'warn', {
                    get: getColorFactory('warn')
                });

                Object.defineProperty(service,'background', {
                    get: getColorFactory('background')
                });
                
                return service;
            }
        ]);
    }]);

dmAtix.factory("dmContent", function () {
	var chap=0;
	var verse=0;
	var items={};
	return {
		make:function(id,type,toggle,open,fixheight,getheight){
			if(!items[type]){
				items[type]=[];
			}
			items[type].push({id:id,toggle:toggle,open:open,fixheight:fixheight,getheight:getheight});
		},
		vheight:function(id,height){
			items.verse.forEach(function(verse){
				if(verse.id===id){
					verse.getheight=height;
				}				
			});
		},
		chap:function(add){
			if(add){
				chap++;
				verse=0;
			}
			return 'chap_'+chap;						
		},
		verse:function(add){
			if(add){
				verse++;
			}
			return 'chap_'+chap+'_verse'+verse;						
		},
		click:function(id,type){
			var parent=id.split('_verse')[0];
			for(var i = 0; i < items[type].length; i++){
				if(items[type][i].id===id){					
					var target = items[type][i];
					
				}								
			}
			if(parent===id){
				return target;
			}else{
				return {parent:parent,target:target}
			}
			
		},
		hide:function(type){
			if(items[type]){
				items[type].forEach(function(container){
					if(container.open){
						container.toggle(true);
						container.open=false;
					}
				});
			}
		}
		
	}
})

.directive("dmSidemen",["dmContent", function(dmContent){

    return {
        link: function () {

        },
    };
}])
.directive("dmChapterTitle",["dmContent", function(dmContent){
	var dm = dmContent;
    return {
		transclude: true,
        template:"<h1 class='md-title' layout layout-padding style='background:{{color.primary.default}}; position:relative; border-bottom:1px solid {{color.primary.hue2}}' md-ink-ripple>"+
					"<div ng-transclude flex></div>"+
					"<div class='material-icons state' style='color:{{color.primary.hue3}}'>arrow_drop_down_circle</div>"+
				"</h1>",		
        link: function (scope, element) {
			
			var id=dm.chap(true);
			element.on('click',function(){
				var container = dm.click(id,'chap');
				if(container.open){
					container.toggle(true);
					container.open=false;
					dm.hide('verse');
				}else{
					dm.hide('verse');
					dm.hide('chap');
					container.toggle(false);
					container.open=true;
					var players=dm.click(id+'_verse1','verse');					
					container=players.target;
					if(container){
						container.toggle(false);
						container.open=true;
						dm.click(id,'chap').fixheight(container.getheight);
					}
				}
			})			
        }

    };
}])
.directive("dmVerseTitle",["dmContent","$timeout", function(dmContent,$timeout){
	var dm = dmContent;
    return {
		transclude: true,		
        link: function (scope, element) {
			var id=dm.verse(true);
			element.on('click',function(){
				var players=dm.click(id,'verse');
				console.log(players);
				var container = players.target;
				var parent = players.parent;
				if(container.open){
					container.toggle(true);
					container.open=false;
				}else{
					dm.hide('verse');
					container.toggle(false);
					container.open=true;
					dm.click(parent,'chap').fixheight(container.getheight);
				}
			})			
        },
        template: "<h2 style='background:{{color.primary.hue1}}; position:relative;' layout layout-padding class='md-subhead md-whiteframe-1dp' md-ink-ripple>"+
						"<div ng-transclude flex ></div>"+
						"<div class='material-icons state' style='color:{{color.primary.hue2}}'>expand_more</div>"+
					"</h2>"
						

    };
}])
.directive("dmChapterDeep",["dmContent", function(dmContent){
	var dm = dmContent;
    return {
		transclude: true,
        link: function (scope, element) {
			var toggle = function (open) {
				if (open) {
					element.css("max-height", '0px');
					element.parent().removeClass('copen').addClass('cclosed');
				} else {
					element.css("max-height", element[0].scrollHeight + 'px');
					element.parent().removeClass('cclosed').addClass('copen');
				}
			};
			var fixheight=function(add){
				element.css("max-height", element[0].scrollHeight + add + 'px');
			}
			toggle(true);
			console.log(dm.chap(false));
			dm.make(dm.chap(false),'chap',toggle,false,fixheight,false);
        },
        template: "<div layout='column' flex ng-transclude></div>"
    };
}])

.directive("dmChapter",["dmContent", function(dmContent){
	var dm = dmContent;
    return {
		transclude: true,
        link: function (scope, element) {
			var toggle = function (open) {
				if (open) {
					element.css("max-height", '0px');
					element.parent().removeClass('copen').addClass('cclosed');
				} else {
					element.css("max-height", element[0].scrollHeight + 'px');
					element.parent().removeClass('cclosed').addClass('copen');
				}
			};
			toggle(true);
			dm.make(dm.chap(false),'chap',toggle,false,false,false);
        },
        template: "<div layout='column' layout-padding flex ng-transclude></div>"
    };
}])

.directive("dmVerse",["dmContent","$timeout", function(dmContent,$timeout){
	var dm = dmContent;
    return {
		transclude: true,
        link: function (scope, element) {
			
			var toggle = function (open) {
				
				if (open) {
					element.css("max-height", '0px');
					element.parent().removeClass('vopen').addClass('vclosed');
				} else {
					element.css("max-height", element[0].scrollHeight + 'px');
					element.parent().removeClass('vclosed').addClass('vopen');
				}
			};
			
			toggle(true);
			var id = dm.verse(false);
			dm.make(id,'verse',toggle,false,false,0);
			$timeout(function(){
				var getheight = element[0].scrollHeight;
				dm.vheight(id,getheight);				
			});	
			
					
        },
        template: "<div layout='column' layout-padding flex ng-transclude></div>"
    };
}])
.directive("dmItemWrapper",function(){
    return {
		transclude: true,
        template: "<div layout='column' style='background:{{color.primary.hue3}}' ng-transclude></div>"
    };
})
.directive("dmMenulink",function(){
    return {
		transclude: true,
        template: "<div ng-transclude></div>"
    };
})
