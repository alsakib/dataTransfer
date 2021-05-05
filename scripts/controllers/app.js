var app = angular.module('dataManager', ['d2Menu', 'd2HeaderBar', 'pascalprecht.translate', 'ngRoute']);

app.directive("deferredCloak", function () {
	return {
		restrict: 'A',
		link: function (scope, element, attrs) {
			attrs.$set("deferredCloak", undefined);
			element.removeClass("deferred-cloak");
		}
	};

});

app.config(["$translateProvider", function ($translateProvider) {

	fetch('translations.json')
		.then(response => response.json())
		.then(data => {
			var tr = data;

			//console.log('translations', tr)

			$translateProvider.translations('en', tr.en);

			$translateProvider.translations('fr', tr.fr);

			$translateProvider.translations('es', tr.es);

			$translateProvider.preferredLanguage('en');
		}
		);


}]);

var meDATA = [];
var selectedOptionsOU;
var selectedOptionsPE;
var periodPrec;
var periods = [];
var typePeriod;
var language = "en";
var today = new Date();
var yyyy = today.getFullYear();
var occur;
var category = "";
var DataElementUrl = "../../dataElements.json?fields=[name,type,code,created,lastUpdated,externalAccess,user,shortName,aggregationType,aggregationOperator,attributeValues,dataDimension,domainType,categoryCombo,url,optionSet,commentOptionSet,valueType,formName,publicAccess,zeroIsSignificant,id,optionSetValue]&paging=false";

var attributeDataElement = "../../attributes.json?fields=:all";
//basic url for data sync setting json
var apiUrl = "../../dataStore/dxdataTransfer";
var apiUrl2 = "../../dataStore/dxdataTransfer/settings";

var apiUrlMetadata = "../../metadata";

var apiUrlUIDGenerate = "../../system/id.json?limit=10";

//url for fecth config params
var apiUrlConfig = "../../dataStore/dxdataTransfer/settings";

//url for fecth schemas
var apiUrlSchemas = "../../schemas.json?paging=false";

//url for fecth resources
var apiUrlResource = "../../resources.json?paging=false";

//url for fecth resources
var settingsKeys = ['ouMapping', 'targetServer', 'itemMapping'];

var logins = [];



//List of dataElementResult 	
var deResultList = [];
var deResultList2 = "";
var dTable = new Array();

var isDeResultFound = false;

app.controller('menuController', function ($rootScope, $http, $translate) {
	// check admin for menu 

	$http({ method: 'get', url: "../../me?fields=:all,userCredentials[userRoles[authorities]]" })
		.then(function (response) {
			//console.log(" login success");
			meDATA = response.data;
			
			userLang = meDATA.settings.keyUiLocale;
			console.log('userLang',userLang)
			$translate.use(userLang);

			// check admin for menu 
			function checkVal(val) { return val == 'ALL'; }
			u = meDATA.userCredentials.userRoles;
			$rootScope.superUser = false;
			for (var i = 0; i < u.length; i++) { if (u[i].authorities.some(checkVal)) { $rootScope.superUser = true } }
			//console.log('superUser: ' + $rootScope.superUser);
		}),(function (response) {
			console.log(" login failed"); // modalAlert
		});

	// check settings


	function alertAdmin() {
		$("#alMsg1").html("Application pas totalement configurée");
		$("#alMsg2").html("Contacter votre administrateur ou ressayez plutard");
		$("#myModal").modal("show");
		$rootScope.disableContent = true;
	}

	$http.get(apiUrlConfig)
	.then(function (response) {
		if (!response.data == "") {
			$rootScope.disableContent = false;
			//console.log("initDatastore exist ! ");
			settingsKeys.forEach(function (item) {
				if (!response.data.instances[0].hasOwnProperty(item)) {
					alertAdmin();
					//break;
				}

			});
			Object.keys(response.data).forEach(function (k) {
				// console.log(key, data[key]);
				if (response.data[k] === '') {
					//console.log("CheckLmisDatastore: " + k);
					alertAdmin();
				}
			});
		}
	}, function (response) {
		console.log("initDatastore inexist ! ");
		initDatastore($rootScope, $http, datastoreJson);
		alertAdmin();
	});
	confirmInstance = function () {
		$("#confirmInstanceModal").modal("show");
	};
});

var clp = "5AV<wpN$|9p_}?Sz";
// init variables	
var datastoreJson = {
"instances":[
/*	{
		"targetServer": { "pwd": "", "url": "", "user": "" },
		"ouMapping": [],"itemMapping": [],
		"comboMapping": [],	"options": {"periodType": "", "ouLevel": ""	},
		"lastSummary": {}, "lastSyncDate": ""
	}
*/
  ]
};


