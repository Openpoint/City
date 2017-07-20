"use strict";

var pageTitle='testtitle';

var doc = angular.module('doc',['ngRoute','ngMaterial', 'dmAtix'])
.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider){
	$routeProvider.when('/', {
		templateUrl: '/global.html',
		controller: 'viewCtrl',
		controllerAs: 'view'
		
	}).when('/:partial',{
		templateUrl: function(params){ return '/'+params.partial; },
		controller: 'viewCtrl',
		controllerAs: 'view'					
	});

	$locationProvider.html5Mode(true);
	
}]).config(function($mdThemingProvider) {
	$mdThemingProvider.theme('default')
	.primaryPalette('indigo')
    .backgroundPalette('grey',{
		'default':'50'
	})
	.accentPalette('blue-grey',{
		'default':'800',
		'hue-1':'50',
		'hue-2':'100',
		'hue-3':'300'
	});
});

doc.controller('main',function($scope,$route, $routeParams, $location, $mdSidenav, mdThemeColors){
	
	$scope.color=mdThemeColors;
	$scope.g={};
	$scope.g.pageTitle='pageTitle';
	$scope.basepath=$location.protocol()+'://'+$location.host();

    $scope.index = 0;

    $scope.toggleSidenav = function (menuId) {
        $mdSidenav(menuId).toggle();
    };


})
doc.controller('viewCtrl',function($scope,$timeout, mdThemeColors){
	$scope.color=mdThemeColors;
	$timeout(function(){
		$scope.g.pageTitle=pageTitle;
	});	
})


function replaceText(str)
{
    var str1 = String(str);
    return str1.replace(/\n/g,"<br/>");
}

doc.directive('prettyprint', function() {
    return {
        restrict: 'C',
        link: function postLink(scope, element, attrs) {
              element.html(prettyPrintOne(replaceText(element.html()),'',true));
        }
    };
});
