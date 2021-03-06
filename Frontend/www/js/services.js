angular.module('app')

.factory('AuthInterceptor', function ($rootScope, $q, AUTH_EVENTS){
	return {
		responseError: function (response) {
			$rootScope.$broadcast({
				401: AUTH_EVENTS.notAuthenticated,
			}[response.status], response);
			return $q.reject(response);
		}
	};
})

.config(function ($httpProvider){
	$httpProvider.interceptors.push('AuthInterceptor');
})

.service('AuthService', function($q, $http, API_ENDPOINT){
	var LOCAL_TOKEN_KEY = 'myprecious';
	var isAuthenticated = false;
	var authToken;

	function loadUserCredentials(){
		var token = window.localStorage.getItem(LOCAL_TOKEN_KEY);
		if(token){
			useCredentials(token);
		}
	}


	function storeUserCredentials(token){
		window.localStorage.setItem(LOCAL_TOKEN_KEY, token);
		useCredentials(token);
	}

	function useCredentials(token){
		isAuthenticated = true;
		authToken = token;
		// Set the token as header for the requests. 
		$http.defaults.headers.common.Authorization = authToken;
	}

	function destroyUserCredentials(){
		authToken = undefined;
		isAuthenticated = false;
		$http.defaults.headers.common.Authorization = undefined;
		window.localStorage.removeItem(LOCAL_TOKEN_KEY);	
	}

	var login = function(user){
		return $q(function(resolve, reject){
			var parameter=JSON.stringify(user);
		  $http.post(API_ENDPOINT.url + '/login', parameter).then(function(result){
		  	console.log(parameter);
		  	if(result.data.success){
		  		storeUserCredentials(result.data.token);
		  		resolve(result.data.msg);
		  		console.log(result.data); 		
		  	}else{
		  		reject(result.data.msg);
		  	}
		  });
		});
	};

	var logout= function(){
		destroyUserCredentials();
	};

	loadUserCredentials();

	return {
		login:login,
		logout:logout,
		isAuthenticated: function () {return isAuthenticated;},
	};
});