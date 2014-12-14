'use strict';


angular.module('core').controller('HomeController', ['$scope', 'Authentication', '$http',
	function($scope, Authentication, $http) {
		// This provides Authentication context.
		$scope.authentication = Authentication;
		$scope.info = ''

		var validUsers = [
			'civicjobsnyc',
			'tkdtothemax1'
		];

		// determine authentication status
		if ($scope.authentication.user && $scope.authentication.user.provider === 'twitter') {
			if (validUsers.indexOf($scope.authentication.user.username) > -1) {
				$scope.authSuccess = true;
			} else {
				$scope.authSuccess = false;
				$scope.info = 'Current user does not have access privileges';
			}
		} else {
			$scope.authSuccess = false;
		}
	}
]);
