"use strict";

angular.module('crud',[])
.factory('$crud', function() {
	var crud={};
	crud.create=function(data){
		socket.emit('create',data);
	}
	return crud;
});
