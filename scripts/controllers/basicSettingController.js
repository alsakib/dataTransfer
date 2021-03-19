var ouUser;
var productList = [];
var productListStr = "";
var dataTosend = [];

app.controller('basicSettingController', function ($rootScope, $http) {
	$rootScope.selectedOptions = [];
	$rootScope.dataTosend = {};
	$rootScope.dataTosendFinal = {};
	$rootScope.importSummary = {};

	//test si serveur connecté / recuperer données sur l'utilisateur , headers: header 

	$http({ method: 'get', url: "../../me?fields=:all,userCredentials[userRoles[authorities]]" })
		.success(function (data) {
			console.log(data);
			console.log(" login success");
			meDATA = data;
			//console.log( "dataViewOrganisationUnits " + meDATA.dataViewOrganisationUnits[0].id);
			if (meDATA.dataViewOrganisationUnits === undefined || meDATA.dataViewOrganisationUnits.length == 0) {
				$http({ method: 'get', url: "../../organisationUnits?level=1&fields=id" })
					.success(function (data) {
						ouUser = data.organisationUnits[0].id;
						console.log("ouUserlEVEL1 " + ouUser);
						fonc_recuperOU($rootScope, $http, ouUser);
						selectedOptionsOU = ouUser;
						fetchData($rootScope, $http, ouUser);

						// check admin for menu 
						function checkVal(val) { return val == 'ALL'; }
						u = meDATA.userCredentials.userRoles;

					});
			} else {
				ouUser = meDATA.dataViewOrganisationUnits[0].id;
				console.log("ouUser " + ouUser);
				fonc_recuperOU($rootScope, $http, ouUser);
				selectedOptionsOU = ouUser;
				fetchData($rootScope, $http, ouUser);

				// check admin for menu 
				function checkVal(val) { return val == 'ALL'; }
				u = meDATA.userCredentials.userRoles;

			}
			//$rootScope.superUser=false;
			//for (var i=0;i<u.length;i++){
			//if (u[i].authorities.some(checkVal)){ $rootScope.superUser=true}
			//}
			//console.log('superUser: '+$rootScope.superUser); 
		})
		.error(function (data) {
			console.log(data);
			console.log(" login failed");
			// modalAlert				
		});

	//apiUrlMetadata, payloadJson, 

	$http.get(apiUrl2).then(function (response) {
		if (!response.data == "") {
			console.log("initDatastore exist ! ");
		}
	}, function (response) {
		console.log("initDatastore inexist ! ");
		initDatastore($rootScope, $http, datastoreJson);
	});

	//-------------------------------------------------------------------------

	$rootScope.selectedItemConfirm = function () {
		selectedItemGet();
	};

	function selectedItemGet() {
		var selectedRows = itemTable.rows({ selected: true }).data();
		console.log('selectedRows : ', selectedRows);
		var newarray = [];
		var newOb = []
		for (var i = 0; i < selectedRows.length; i++) {
			newarray.push(selectedRows[i][1]);
			newOb[selectedRows[i][1]] = selectedRows[i][2];
		}
		var selectedRowData = newarray;
		//console.log('selectedRowData',selectedRowData);	
		console.log('newOb', newOb);

		$rootScope.selectedItems = selectedRowData;
		console.log('selectedRowDataRRT', $rootScope.selectedItems);

	};
	$rootScope.testConnexion = function () {
		console.log('testConnexion');
		//var auth = $base64.encode($rootScope.targetServer.login+":"+$rootScope.targetServer.pwd); 
		var auth = window.btoa($("#targetServerLogin").val() + ":" + $("#targetServerPwd").val());
		console.log('auth', auth);
		headers = { "Authorization": "Basic " + auth };
		url = $("#targetServerURL").val() + '/api/me';
		$http.get(url, { headers: headers }).then(function (response) {
			console.log('targetServer Statut: ', response.data)
			if (!response.data == "") {
				$rootScope.spanClass = 'success';
				$rootScope.testConnexionStatut = 'it is ok! ' + response.data.displayName + ' Connected';
				console.log("targetServer exist ! ");
			}
		}, function (response) {
			$rootScope.spanClass = 'warning';
			$rootScope.testConnexionStatut = 'Something wrong! Please check url, username and password again';
			console.log("targetServer inexist ! ");
		})

	};

	$rootScope.process = function () {
		console.log('processing');
		selectedItemGet();
		oulevel = $("#ouLevelList").val();
		getData($rootScope, $http, selectedOptionsOU, $rootScope.selectedItems, selectedOptionsPE, oulevel);

		console.log('processing', oulevel);

		//pushData($rootScope, $http);

	};

	$rootScope.summaryDown = function () {
		console.log('summaryDown');
		saveFileJson($rootScope.importSummary);

	};

	//metaChoosen groupMetaList deGroupEssentiel
	$('#groupMetaList').change(function () {
		productList = [];
		grouProductSelected = $("#groupMetaList option:selected").val();
		$("#selectedOptsProd").html($("#groupMetaList option:selected").text());
		console.log('grouProductSelected: ' + grouProductSelected);
		$("#selectedOptsProd").html($("#groupMetaList option:selected").text());
		if (grouProductSelected != "") {
			$http.get("../../indicatorGroups/" + grouProductSelected + ".json?fields=indicators[id,displayName~rename(name),code]").then(function (response) {
				if (!response.data == "") {
					productList = response.data.indicators;
					console.log("prodEssentiel ok ! ");
					//console.log('productList',productList);
					productListStr = '';
					$.each(productList, function (i, item) {
						productListStr += productList[i].id + ';';
					});
					productListStr = productListStr.slice(0, -1)
					//console.log('productListStr',productListStr);
					Util.populateSelect($('#metaChoosen'), "recherche [Produit]", productList);
					printTable(productList);

				}
			}, function (response) {
				console.log("prodEssentiel not ok ! ");
			});
		}
	});

	$('#metaChoosen').change(function () {
		console.log("metaChoosen change ! ");
		productList = []; metaChoosenSelected = "";
		metaChoosenSelected = $("#metaChoosen option:selected").val();
		metaChoosenSelected2 = $('#mySelect2').find(':selected');
		console.log('metaChoosenSelected', metaChoosenSelected);
		$("#selectedOptsProd").html($("#metaChoosen option:selected").map(function () { return this.text }).get().join(", "));

		if (metaChoosenSelected != "") {
			console.log('metaChoosen: ', $("#metaChoosen option:selected").map(function () { return this.value }).get());
			productSelected = $("#metaChoosen option:selected").map(function () { return this.value }).get().join('"},{"id":"');
			console.log('productSelected', productSelected)
			productList = JSON.parse('[{"id":"' + productSelected + '"}]');
			//console.log('productList_productListStr',productList);	   
			productListStr = '';
			$.each(productList, function (i, item) {
				productListStr += productList[i].id + ';';
			});
			productListStr = productListStr.slice(0, -1)
			//console.log('productListStr',productListStr);


		} else {
			console.log('metaChoosen vide ');

		};
	});

});

function initDatastore($rootScope, $http, dataJson) {
	console.log(dataJson);
	$http.post(apiUrl2, dataJson, { headers: { 'Content-Type': 'application/json;charset=utf-8' } })
		.then(function (response) {
			if (!response.data == "") {
				console.log(response.data);
			}
		}, function (response) {
			console.log("initDatastore Erreur ! ");
			console.log(response.data);
		});

}


fonc_recuperOU = function ($rootScope, $http, ou) {
	var C_ROU_1 = "../../organisationUnits.json?filter=id:eq:" + ou + "&fields=id,displayName~rename(text),children[id,displayName~rename(text),children[id,displayName~rename(text),children[id,displayName~rename(text)]]]&paging=false";
	$http.get(C_ROU_1)
		.then(function (response) {
			$("#selectedOptsOU").html('Site: ' + response.data.organisationUnits[0].text);
			var payloadStr = JSON.stringify(response.data);
			var payloadVal = payloadStr.replace(/"children"/gi, '"nodes"');
			//console.log(payloadVal);
			payloadJson = JSON.parse(payloadVal);
			//console.log(payloadJson.organisationUnits);
			var $tree = $('#treeview12').treeview({
				data: payloadJson.organisationUnits,
				collapseAll: true,
				levels: 1,
				onNodeSelected: function (event, node) {
					//console.log(node.text);
					//console.log(node.id);
					selectedOptionsOU = node.id;
					//selectedOptionsOU = node.text;
					$("#selectedOptsOU").html('Site: ' + node.text);
					console.log("selectedOptionsOU: " + selectedOptionsOU);
				}
			});

			console.log("test http UO : ");
			console.dir(response.data);
		})

}

// by sak
var dxOuUids = [];
window.dhis2 = window.dhis2 || {};
dhis2.settings = dhis2.settings || {};
var serverURL = window.location.href.split('/api/')[0];
//var serverURL ="http://localhost:8080/dhis";

function fetchData($rootScope, $http, ouUser) {

	$rootScope.settings = {}; $rootScope.targetServer = {};
	var promise = $http.get(apiUrlConfig).then(function (response) {
		if (!response.data == "")
			console.log('response.data', response.data);
		$rootScope.settings = response.data;
		$rootScope.targetServer = response.data.targetServer;
		selectedOptionsPE = $rootScope.settings.peStartAnalytics;
		{

			$http({ method: 'get', url: '../../indicatorGroups.json?paging=false&fields=id,displayName~rename(name),code' })
				.success(function (data) { Util.populateSelect($('#groupMetaList'), "Groupe", data.indicatorGroups); })
				.error(function (data) { console.log(data); });

			$http({ method: 'get', url: '../../organisationUnitLevels.json?paging=false&fields=displayName~rename(name),level~rename(id)&order=level:asc' })
				.success(function (data) { Util.populateSelect($('#ouLevelList'), "Groupe", data.organisationUnitLevels); })
				.error(function (data) { console.log(data); });

			$http.get("../../indicators.json?paging=false&fields=id,displayName~rename(name),code").then(function (response) {
				if (!response.data == "") {
					productList = response.data.indicators;
					console.log("metaChoosen ok ! ");
					//console.log(productList);
					Util.populateSelect($('#metaChoosen'), "recherche [Produit]", response.data.indicators);
					printTable(productList);
					productListStr = '';
					$.each(productList, function (i, item) {
						productListStr += productList[i].id + ';';
					});
					productListStr = productListStr.slice(0, -1)
					//console.log('productListStr',productListStr);

				}
			}, function (response) {
				console.log("metaChoosen not ok ! ");
			});
		}


	});


}


function isNumeric(n) {
	return !isNaN(parseInt(n)) && isFinite(n);
}

function formatValue(value) {
	if (isNumeric(value)) {
		return parseInt(value);
	}
	else {
		return 0;
	}
}


function printTable(metadataList) {
	var htmlStr = "",
		code = "";
	var index = 0;
	var dTable = [];
	var essentiel = "";
	console.log("metadataList.length: ", metadataList.length);
	console.log("metadataList[]", metadataList);

	if (metadataList != "") {
		metadataList.forEach(function (hs) {
			hs.code === undefined ? (code = "") : (code = hs.code);
			var rowdata = [
				'',
				hs.id,
				code,
				hs.name
			];
			dTable.push(rowdata);
			//console.log("ok: "+hs.code);
			//console.log("dTable: "+dTable);
			index++;
			//console.log("index "+index);
			if (index === metadataList.length) {
				itemTable = $("#itemTable").DataTable({
					//console.log("dTableInside: "+index), ,"bVisible": false
					destroy: true,
					data: dTable,
					dom: 'Blfrtip',
					buttons: [
						'selectAll',
						'selectNone'
					],
					columns: [
						{ title: '' },
						{ title: "Uid" },
						{ title: "Code" },
						{ title: "Metadata" }
					],
					aLengthMenu: [
						[10, 25, 50, 100],
						[10, 25, 50, 100]
					],
					columnDefs: [
						{
							targets: 0,
							className: 'select-checkbox',
							//checkboxes: {'selectRow': true}
						}
					],
					select: {
						style: 'multi'
					},
					order: [[3, 'asc']]
				});
			}
		});
	} else {
		console.log("Pas de valeur ");
	}
	//$("#coverLoad").hide();
	//$('#hs').DataTable();
}

function fetchDataAtLevel(UIDs, periods, level, outputIdScheme) {

	if (!outputIdScheme) outputIdScheme = 'CODE';

	var requestURL = '/api/analytics.json?dimension=dx:' + UIDs.join(';');
	requestURL += '&dimension=pe:' + periods.join(';');
	requestURL += '&dimension=ou:LEVEL-' + level;
	requestURL += '&outputIdScheme=' + outputIdScheme;
	return get(requestURL);
}

function getData($rootScope, $http, ouID, UIDs, periods, level) {
	var requestURL = '../../analytics/dataValueSet.json?dimension=dx:' + UIDs.join(';');
	requestURL += '&dimension=pe:' + periods;
	requestURL += '&dimension=ou:' + ouID + ';LEVEL-' + level;
	requestURL += '&outputIdScheme=UID';
	$http.get(requestURL).then(function (response) {
		if (!response.data == "") {
			$rootScope.dataTosend = response.data;
			dataTosend = response.data;
			console.log('getData', $rootScope.dataTosend, $rootScope.settings.itemMapping);

			//transfromDATA($rootScope, $http, srcUIDS);
			transfromDATA($rootScope, $http, $rootScope.dataTosend, $rootScope.settings.itemMapping, $rootScope.settings.ouMapping, $rootScope.dataTosendFinal, ljson_nontrouve);


		}
	}, function (response) {
		console.log("getData not ok ! ");
	});

}

function pushData($rootScope, $http, _data) {
	console.log('pushDATA');
	//var auth = $base64.encode($rootScope.targetServer.login+":"+$rootScope.targetServer.pwd); 
	var auth = window.btoa($("#targetServerLogin").val() + ":" + $("#targetServerPwd").val());
	console.log('auth', auth);
	headers = { "Authorization": "Basic " + auth };
	url = $("#targetServerURL").val() + '/api/dataValueSets';
	console.log('targetServerURL', url);
	data = _data;
	$http.post(url, data, { headers: headers }).then(function (response) {
		console.log('pushData Statut: ', url, data, { headers: headers })
		console.log('pushData Statut: ', response.data)
		if (!response.data == "") {
			console.log("data Sent ! ");
			$rootScope.importSummary = response.data;
		}
	}, function (response) {
		console.log("No data Sent ! ");
	})

};


function saveFileJson(obj) {

	//var blob = new Blob([data], { type:"application/json;charset=utf-8;" });
	var data = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(obj));
	var downloadLink = angular.element('<a></a>');
	downloadLink.attr('href', 'data:' + data);
	downloadLink.attr('download', 'summary.json');
	downloadLink[0].click();
}

function isEmpty(obj) {

	if (obj == null) return true;

	if (obj.length > 0) return false;
	if (obj.length === 0) return true;

	if (typeof obj !== "object") return true;

	for (var key in obj) {
		if (hasOwnProperty.call(obj, key)) return false;
	}

	return true;
}


var ljson_trouve = {};
var ljson_nontrouve = {};

function transfromDATA($rootScope, $http, json_sourcea, json_mapDX, json_mapOU, json_trouve, json_nontrouve) {

	json_trouve.dataValues = [];
	json_nontrouve.dataValues = [];
	var json_sourcea_temp = {};

	json_trouve = Object.assign({}, json_sourcea);
	json_mapDX.forEach(function (e) {

		var pattern = new RegExp(e.srcUID, 'gi');
		var trgUID = e.trgUID;
		var comment = 'data Sync';
		console.log("pattern", e.srcUID, trgUID);
		json_trouve.dataValues = JSON.parse(JSON.stringify(json_trouve.dataValues).replace(pattern, trgUID).replace(/aggregated/g, 'data_Synced').replace(/\.0/g, ''));
		console.log("json_trouve dx", json_trouve);

		return 0
	});
	json_mapOU.forEach(function (e) {

		var pattern = new RegExp(e.srcUID, 'gi');
		var trgUID = e.trgUID;
		var comment = 'data Sync';
		console.log("pattern", e.srcUID, trgUID);
		json_trouve.dataValues = JSON.parse(JSON.stringify(json_trouve.dataValues).replace(pattern, trgUID));
		console.log("json_trouve OU", json_trouve);

		return 0
	});
	console.log("json_data_init", json_sourcea);
	console.log("json_data_trouve", json_trouve);
	console.log("json_data_nontrouve", json_nontrouve);
	pushData($rootScope, $http, json_trouve);



}

