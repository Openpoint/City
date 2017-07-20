"use strict";

/**
 * @module install
 * @chapter client
 *
 * */




/**
 * @ngdoc controller
 * @name main
 * @attribute testatt
 * */
City.controller('main', function($scope,$timeout,$window,$sce) {


	/*
	$timeout(function(){
		$scope.html=$sce.trustAsHtml('<div>test2</div>');
	},1000);
	* */
/**
 * Test value
 * @name module:client/install~main~test
 * */
 var test='test';
	$scope.tabs={};
	$scope.tabs.tab2=false;
	$scope.tabs.tab3=false;
	$scope.tabs.saved=true;

	//prepopulate forms with defaults
	$scope.con={}
	$scope.con.host='localhost';
	$scope.con.port='5432';

	$scope.admin={};
	$scope.admin.pass1=null;
	$scope.admin.pass2=null;

	$scope.node={}
	$scope.node.portnum=8082;

	// live check database connection details
	$scope.$watch('con',function(){
		socket.emit('installcheck',$scope.con);
	},true)

	// switch tab when database is connected

	socket.on('installcheck',function(data){
		$timeout(function(){
			$scope.message = data;
			if(!data){
				$scope.tabs.tab2=true;
			}
		});
	})

	// switch tab when settings are saved and complete form after user is saved
	socket.on('saved',function(data){
		switch (data) {
			case 'settings':
				$timeout(function(){
					$scope.tabs.tab2=false;
					$scope.tabs.tab3=true;
					$scope.tabs.saved=false;
				})
				break;

			case 'user':
				window.location=window.location.origin+'/admin';
				break;
		}

	})

	$scope.save=function(){
		var settings={};
		settings.db=$scope.con;
		settings.nodeport=$scope.node.portnum;
		socket.emit('installsave',settings);
		socket.emit('create',{
			module:'user',
			task:'table'
		});
	}

	$scope.newuser=function(){
		socket.emit('create',{
			module:'user',
			task:'newuser',
			tokens:[$scope.admin.name,$scope.admin.pass1],
			callback:[
				{saved:[]},
				{installed:[]}
			]
		});
	}
})

/**
 * validates the database form when details are correct
 * @ngdoc directive
 * @name dbase
 * */
City.directive('dbase', function($q, $timeout) {
	return {
		require: 'ngModel',
		link: function(scope, elm, attrs, ctrl) {

			ctrl.$asyncValidators.dbase = function(modelValue, viewValue) {
				console.log(modelValue,viewValue)
				var def = $q.defer();
				$timeout(function() {
					if(!modelValue){
						def.resolve();
					}else{
						def.reject();
					}
				});
				return def.promise;
			};
		}
	}
});
