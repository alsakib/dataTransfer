var app = angular.module('dataManager', ['d2Menu', 'd2HeaderBar']);

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
var apiUrlConfig = "../../dataStore/dxdataTransfer/settings2";

//url for fecth schemas
var apiUrlSchemas = "../../schemas.json?paging=false";

//url for fecth resources
var apiUrlResource = "../../resources.json?paging=false";

//url for fecth resources
var settingsKeys = ['ouMapping', 'targetServer', 'itemMapping', 'comboMapping'];

var logins = [];



//List of dataElementResult 	
var deResultList = [];
var deResultList2 = "";
var dTable = new Array();

var isDeResultFound = false;

app.controller('menuController', function ($rootScope, $http) {
	// check admin for menu 

	$http({ method: 'get', url: "../../me?fields=:all,userCredentials[userRoles[authorities]]" })
		.success(function (data) {
			console.log(" login success");
			meDATA = data;

			// check admin for menu 
			function checkVal(val) { return val == 'ALL'; }
			u = meDATA.userCredentials.userRoles;
			$rootScope.superUser = false;
			for (var i = 0; i < u.length; i++) { if (u[i].authorities.some(checkVal)) { $rootScope.superUser = true } }
			console.log('superUser: ' + $rootScope.superUser);
		})
		.error(function (data) {
			console.log(" login failed"); // modalAlert
		});

	// check settings


	function alertAdmin() {
		$("#alMsg1").html("Application pas totalement configurée");
		$("#alMsg2").html("Contacter votre administrateur ou ressayez plutard");
		$("#myModal").modal("show");
		$rootScope.disableContent = true;
	}

	$http.get(apiUrl2).then(function (response) {
		if (!response.data == "") {
			$rootScope.disableContent = false;
			console.log("initDatastore exist ! ");
			settingsKeys.forEach(function (item) {
				if (!response.data.hasOwnProperty(item)) {
					alertAdmin();
					//break;
				}

			});
			Object.keys(response.data).forEach(function (k) {
				// console.log(key, data[key]);
				if (response.data[k] === '') {
					console.log("CheckLmisDatastore: " + k);
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

// init variables	
var datastoreJson = {
	"targetServer": { "pwd": "", "url": "", "user": "" },
	"ouMapping": [],
	"itemMapping": [],
	"comboMapping": [],
	"options": {
		"periodType": "weekly",
		"oulevel": "3"
	},
	"lastSummary": {},
	"lastSyncDate": "2020-01-01"
};


