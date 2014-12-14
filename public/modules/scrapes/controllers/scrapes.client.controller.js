'use strict';

// Scrapes controller
angular.module('scrapes').controller('ScrapesController', ['$scope', '$stateParams', '$location', 'Authentication', 'Scrapes',
	function($scope, $stateParams, $location, Authentication, Scrapes ) {
		$scope.authentication = Authentication;

		$scope.checkStatus = function () {
			Scrapes.check(function (res) {
				console.log(res[0])
				if (res[0] && res[0] > 0) {
					$scope.status = 'Active'
				} else {
					$scope.status = 'Inactive'
				}
			})
		}

		// Create new Scrape
		$scope.create = function() {
			// Create new Scrape object
			var scrape = new Scrapes ({
				name: this.name
			});

			// Redirect after save
			scrape.$save(function(response) {
				$location.path('scrapes/' + response._id);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Scrape
		$scope.remove = function( scrape ) {
			if ( scrape ) { scrape.$remove();

				for (var i in $scope.scrapes ) {
					if ($scope.scrapes [i] === scrape ) {
						$scope.scrapes.splice(i, 1);
					}
				}
			} else {
				$scope.scrape.$remove(function() {
					$location.path('scrapes');
				});
			}
		};

		// Update existing Scrape
		$scope.update = function() {
			var scrape = $scope.scrape ;

			scrape.$update(function() {
				$location.path('scrapes/' + scrape._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Scrapes
		$scope.find = function() {
			$scope.scrapes = Scrapes.query();
		};

		// Find existing Scrape
		$scope.findOne = function() {
			$scope.scrape = Scrapes.get({
				scrapeId: $stateParams.scrapeId
			});
		};
	}
]);