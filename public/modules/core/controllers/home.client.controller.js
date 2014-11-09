'use strict';


angular.module('core').controller('HomeController', ['$scope', 'Authentication', '$http',
	function($scope, Authentication, $http) {
		// This provides Authentication context.
		$scope.authentication = Authentication;
		$scope.info = ''

		var validUsers = [
			'ameensol',
			'civicjobsnyc',
			'noneck',
			'chris_whong'
		];

		var initScraper = function() {
			// display a few buttons Start/Stop, recent tweets/linked
			// account information -- how long until next scrape, how long has
			// it been?
			// Total tweets? How long has this been running?
			// To do these things, I need to set up the database schema for
			// tweets and sessions and jobs
			// Then I need to setup endpoints where each endpoint returns that
			// data
			//
			// the buttons have to POST and control starting or stopping
			// tweeting
			//
			// which means it's time to integrate the scrape script
		}

		// determine authentication status
		if ($scope.authentication.user && $scope.authentication.user.provider === 'twitter') {
			if (validUsers.indexOf($scope.authentication.user.username) > -1) {
				$scope.authSuccess = true;
				initScraper();
			} else {
				$scope.authSuccess = false;
				$scope.info = 'Current user does not have access privileges';
			}
		} else {
			$scope.authSuccess = false;
		}
	}
]);
