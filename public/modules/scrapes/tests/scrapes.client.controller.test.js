'use strict';

(function() {
	// Scrapes Controller Spec
	describe('Scrapes Controller Tests', function() {
		// Initialize global variables
		var ScrapesController,
		scope,
		$httpBackend,
		$stateParams,
		$location;

		// The $resource service augments the response object with methods for updating and deleting the resource.
		// If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
		// the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
		// When the toEqualData matcher compares two objects, it takes only object properties into
		// account and ignores methods.
		beforeEach(function() {
			jasmine.addMatchers({
				toEqualData: function(util, customEqualityTesters) {
					return {
						compare: function(actual, expected) {
							return {
								pass: angular.equals(actual, expected)
							};
						}
					};
				}
			});
		});

		// Then we can start by loading the main application module
		beforeEach(module(ApplicationConfiguration.applicationModuleName));

		// The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
		// This allows us to inject a service but then attach it to a variable
		// with the same name as the service.
		beforeEach(inject(function($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_) {
			// Set a new global scope
			scope = $rootScope.$new();

			// Point global variables to injected services
			$stateParams = _$stateParams_;
			$httpBackend = _$httpBackend_;
			$location = _$location_;

			// Initialize the Scrapes controller.
			ScrapesController = $controller('ScrapesController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Scrape object fetched from XHR', inject(function(Scrapes) {
			// Create sample Scrape using the Scrapes service
			var sampleScrape = new Scrapes({
				name: 'New Scrape'
			});

			// Create a sample Scrapes array that includes the new Scrape
			var sampleScrapes = [sampleScrape];

			// Set GET response
			$httpBackend.expectGET('scrapes').respond(sampleScrapes);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.scrapes).toEqualData(sampleScrapes);
		}));

		it('$scope.findOne() should create an array with one Scrape object fetched from XHR using a scrapeId URL parameter', inject(function(Scrapes) {
			// Define a sample Scrape object
			var sampleScrape = new Scrapes({
				name: 'New Scrape'
			});

			// Set the URL parameter
			$stateParams.scrapeId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/scrapes\/([0-9a-fA-F]{24})$/).respond(sampleScrape);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.scrape).toEqualData(sampleScrape);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Scrapes) {
			// Create a sample Scrape object
			var sampleScrapePostData = new Scrapes({
				name: 'New Scrape'
			});

			// Create a sample Scrape response
			var sampleScrapeResponse = new Scrapes({
				_id: '525cf20451979dea2c000001',
				name: 'New Scrape'
			});

			// Fixture mock form input values
			scope.name = 'New Scrape';

			// Set POST response
			$httpBackend.expectPOST('scrapes', sampleScrapePostData).respond(sampleScrapeResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Scrape was created
			expect($location.path()).toBe('/scrapes/' + sampleScrapeResponse._id);
		}));

		it('$scope.update() should update a valid Scrape', inject(function(Scrapes) {
			// Define a sample Scrape put data
			var sampleScrapePutData = new Scrapes({
				_id: '525cf20451979dea2c000001',
				name: 'New Scrape'
			});

			// Mock Scrape in scope
			scope.scrape = sampleScrapePutData;

			// Set PUT response
			$httpBackend.expectPUT(/scrapes\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/scrapes/' + sampleScrapePutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid scrapeId and remove the Scrape from the scope', inject(function(Scrapes) {
			// Create new Scrape object
			var sampleScrape = new Scrapes({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Scrapes array and include the Scrape
			scope.scrapes = [sampleScrape];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/scrapes\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleScrape);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.scrapes.length).toBe(0);
		}));
	});
}());