
var i, j, maxId = 0;
var g = [], newProducts = [], convertjson = [];
var dsList = [], ouDs = [], configTarget;
// Recup données du dataStore

function fetchData($rootScope, $http) {
	$rootScope.settings = {}; $rootScope.metaStrategy = "tessss"; $rootScope.targetServer = {};
	$rootScope.options = {};
	$rootScope.srcOU = []; $rootScope.trgOU = [];
	$rootScope.srcMeta = []; $rootScope.trgMeta = [];
	$rootScope.typemaching = ""; $rootScope.valuechoix = ""; $rootScope.valuechoixOU = "";
	$rootScope.matchingObjet = []; $rootScope.autoRun = true; $rootScope.targetServerr = {};
	$rootScope.dxStrategy = ""; $rootScope.ouStrategy = "";
	$rootScope.settingFull = {};

	var promise = $http.get(apiUrlConfig).then(function (response) {
		if (!response.data == "") console.log('apiUrlConfig', response.data);
		$rootScope.settingFull = response.data;
		//Util.populateSelect($('#instance'), "Instance", $rootScope.settingFull.instances);
		$rootScope.targetServer = rootScope.settings.targetServer;
		//$rootScope.targetServerr['pwd'] = response.data.targetServer.pwd;
		//var pwwE = CryptoJS.AES.encrypt($rootScope.targetServerr, "5AV<wpN$|9p_}?Sz");
		$rootScope.targetServerr['pwd'] = CryptoJS.AES.decrypt(rootScope.settings.targetServer.pwd, "5AV<wpN$|9p_}?Sz");
		console.log('CryptoJS_d', CryptoJS.AES.decrypt(rootScope.settings.targetServer.pwd, "5AV<wpN$|9p_}?Sz").toString(CryptoJS.enc.Utf8));
	});

	$http({ method: 'get', url: '../../indicatorGroups.json?paging=false&fields=id,displayName~rename(name),code' })
		.success(function (data) { Util.populateSelect($('#sourceGroupMetaList'), "Groupe", data.indicatorGroups); })
		.error(function (data) { console.log(data); });


	$http({ method: 'get', url: '../../organisationUnitLevels.json?paging=false&fields=displayName~rename(name),level~rename(id)&order=level:asc' })
		.success(function (data) {
			Util.populateSelect($('#sourceGroupOUList'), "ouLevels", data.organisationUnitLevels);
			Util.populateSelect($('#ouLevelList'), "ouLevels", data.organisationUnitLevels);
		})
		.error(function (data) { console.log(data); });

}

function updateConfig($rootScope, $http) {
	var settingsJson = $rootScope.settings;
	settingsJson.targetServer['pwd'] = CryptoJS.AES.encrypt($rootScope.targetServerr.pwd, "5AV<wpN$|9p_}?Sz");
	console.log('CryptoJS_e', CryptoJS.AES.encrypt($rootScope.targetServerr.pwd, "5AV<wpN$|9p_}?Sz"));
	$http.put(apiUrlConfig, settingsJson, { headers: { 'Content-Type': 'application/json;charset=utf-8' } })
		.then(function (response) {
			//console.log('groupForms',$rootScope.settings.groupForms,g);

			toastr.success('Update done!');

		});
}

app.controller('configController', function ($rootScope, $http) {

	fetchData($rootScope, $http);

	$rootScope.updateConfigDS = function () {
		console.log('updateConfigDS');
		selectedFile = document.getElementById('dxmapping').files[0];

		handleFileSelect($rootScope, $http, selectedFile, convertjson, 'itemMapping');
		//updateConfig($rootScope, $http)
	};

	$rootScope.updateConfigOU = function () {
		console.log('updateConfigDS');
		selectedFile = document.getElementById('oumapping').files[0];

		handleFileSelect($rootScope, $http, selectedFile, convertjson, 'ouMapping');
		//updateConfig($rootScope, $http)
	};

	confirmInstance = function () {
		$("#confirmInstanceModal").modal("show");
	};
	$rootScope.testConnexion = function () {
		console.log('testConnexion');
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
		});
		url = $("#targetServerURL").val() + '/api/dataSets.json?paging=false&fields=id,displayName~rename(name),code';
		$http.get(url, { headers: headers })
			.then(function (response) { if (!response.data == "") { Util.populateSelect($('#targetGroupMetaList'), "Groupe", response.data.dataSets); } });

		url = $("#targetServerURL").val() + '/api/organisationUnitLevels.json?paging=false&fields=displayName~rename(name),level~rename(id)&order=level:asc';
		$http.get(url, { headers: headers })
			.then(function (response) { if (!response.data == "") { Util.populateSelect($('#targetGroupOUList'), "ouLevels", response.data.organisationUnitLevels); } });

	};

	$rootScope.applyOUMap = function (strategy) {
		console.log('applyOUMap', strategy);
		if (strategy == 'Merge') {
			$rootScope.settings['ouMapping'] = $rootScope.settings['ouMapping'].concat($rootScope.matchingObjet);
		} else {
			$rootScope.settings['ouMapping'] = $rootScope.matchingObjet;
		}
		updateConfig($rootScope, $http);
	};

	$rootScope.applyMetaMap = function (strategy) {
		console.log('applyMetaMap', strategy);
		if (strategy == 'Merge') {
			$rootScope.settings['itemMapping'] = $rootScope.settings['itemMapping'].concat($rootScope.matchingObjet);
		} else {
			$rootScope.settings['itemMapping'] = $rootScope.matchingObjet;
		}

		updateConfig($rootScope, $http);

	};

	$('#instance').change(function () {
		productList = [];
		instanceSelected = $("#instance option:selected").val();
		$("#selectedOptsProd").html($("#groupMetaList option:selected").text());
		console.log('instanceSelected', instanceSelected, $rootScope.settings.instances[instanceSelected].options.periodType);
		$rootScope.settings = $rootScope.settingFull.instances[instanceSelected];
		$rootScope.targetServer = rootScope.settings.targetServer;
		$rootScope.targetServerr['pwd'] = CryptoJS.AES.decrypt(rootScope.settings.targetServer.pwd, "5AV<wpN$|9p_}?Sz");
		console.log('CryptoJS_d', CryptoJS.AES.decrypt(rootScope.settings.targetServer.pwd, "5AV<wpN$|9p_}?Sz").toString(CryptoJS.enc.Utf8));
	});
	//metaChoosen groupMetaList deGroupEssentiel

	$('#typeMetaList').change(function () {
		$rootScope.matchingObjet = [];
		typeMetaList = $("#typeMetaList option:selected").val();
		console.log('typeMetaList: ' + typeMetaList);
		if (typeMetaList == "indicator") {
		$http({ method: 'get', url: '../../indicatorGroups.json?paging=false&fields=id,displayName~rename(name),code' })
			.success(function (data) { Util.populateSelect($('#sourceGroupMetaList'), "Groupe", data.indicatorGroups); })
			.error(function (data) { console.log(data); });
	} else if (typeMetaList == "programIndicator") {
	$http({ method: 'get', url: '../../programs.json?paging=false&fields=id,displayName~rename(name),code' })
		.success(function (data) { Util.populateSelect($('#sourceGroupMetaList'), "Groupe", data.programs); })
		.error(function (data) { console.log(data); });
}
	});

$('#sourceGroupMetaList').change(function () {
	$rootScope.matchingObjet = [];
	srcMetaGrpSelected = $("#sourceGroupMetaList option:selected").val();
	console.log('srcMetaGrpSelected: ' + srcMetaGrpSelected);
	if (srcMetaGrpSelected== "indicator") {
	$http.get("../../indicatorGroups/" + srcMetaGrpSelected + ".json?fields=indicators[id,displayName~rename(name),code]")
		.then(function (response) { if (!response.data == "") { $rootScope.srcMeta = response.data.indicators; } },
			function (response) { console.log("srcMetaGrpSelected error ! "); });
} else if (srcMetaGrpSelected== "programIndicator") {
	$http.get("../../programs/" + srcMetaGrpSelected + ".json?fields=programIndicators[id,displayName~rename(name),code]")
		.then(function (response) { if (!response.data == "") { $rootScope.srcMeta = response.data.programIndicators; } },
			function (response) { console.log("srcMetaGrpSelected error ! "); });
}
	});

$('#sourceGroupOUList').change(function () {
	$rootScope.matchingObjet = [];
	srcOuselected = $("#sourceGroupOUList option:selected").val();
	console.log('srcOuselected: ' + srcOuselected);
	if (srcOuselected != "") {
		$http.get("../../organisationUnits.json?paging=false&level=" + srcOuselected + "&fields=id,displayName~rename(name),code&order=displayName:asc")
			.then(function (response) { if (!response.data == "") { $rootScope.srcOU = response.data.organisationUnits; } },
				function (response) { console.log("srcOuselected error ! "); });
	}
});

$('#targetGroupMetaList').change(function () {
	$rootScope.matchingObjet = [];
	trgMetaGrpSelected = $("#targetGroupMetaList option:selected").val();
	console.log('trgMetaGrpSelected: ' + trgMetaGrpSelected);
	if (trgMetaGrpSelected != "") {
		//dataElementOperands?paging=false&totals=true&fields=*&dataSet=iq4mng6WegW 
		var auth = window.btoa($("#targetServerLogin").val() + ":" + $("#targetServerPwd").val());
		headers = { "Authorization": "Basic " + auth };
		url = $("#targetServerURL").val() + "/api/dataElementOperands.json?paging=false&totals=true&dataSet=" + trgMetaGrpSelected + "&fields=id,displayName~rename(name),categoryOptionCombo[id]&order=displayName:asc";
		$http.get(url, { headers: headers })
			.then(function (response) {
				if (!response.data == "") {
					$rootScope.trgMeta = response.data.dataElementOperands;
					for (compt = 0; compt < 1000; compt++) {
						$("#idselect" + compt).select2({
							placeholder: "Choisisez un produit",

							allowClear: true
						});
					}
				}
			});
	}
});

$('#targetGroupOUList').change(function () {
	$rootScope.matchingObjet = [];
	trgOuselected = $("#targetGroupOUList option:selected").val();
	console.log('trgOuselected: ' + trgOuselected);
	if (trgOuselected != "") {
		var auth = window.btoa($("#targetServerLogin").val() + ":" + $("#targetServerPwd").val());
		headers = { "Authorization": "Basic " + auth };
		url = $("#targetServerURL").val() + "/api/organisationUnits.json?paging=false&level=" + trgOuselected + "&fields=id,displayName~rename(name),code&order=displayName:asc";
		$http.get(url, { headers: headers })
			.then(function (response) {
				if (!response.data == "") {
					$rootScope.trgOU = response.data.organisationUnits;
					for (compt = 0; compt < 1000; compt++) {
						$("#idselectOu" + compt).select2({
							placeholder: "Choisisez un produit",

							allowClear: true
						});
					}
				}
			});

	}
});
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

$rootScope.fonc_matching = function (s, sc, tg, type) {
	$rootScope.autoRun = false;
	$rootScope.matchingObjet = [];

	if (!(isEmpty($rootScope.typemaching))) {
		sc.map(function (e, index) {
			console.log(index, sc, tg);
			tg.map(function (z, index2) {
				if (e[$rootScope.typemaching] == z[$rootScope.typemaching]) {
					//$rootScope.valuechoixOU0 = index2;
					$("#" + s + index).val(index2);
					$("#" + s + index).trigger("change");
					console.log('src', e);
					console.log('trg', z);

					var obj = {};
					obj['srcUID'] = e.id;
					obj['trgUID'] = z.id;
					obj['srcName'] = e.name;
					obj['trgName'] = z.name;
					if (type == 'dx' && z.categoryOptionCombo !== undefined) {
						//obj['srcCOC'] = litem.name;
						obj['trgCOC'] = z.categoryOptionCombo.id;
					}
					$rootScope.matchingObjet.push(obj);
					console.log('$rootScope.matchingObjet', $rootScope.matchingObjet);
					//$rootScope.matchingObjet[e.id] = z.id;

				}

			})


		});
		$rootScope.autoRun = true;
	}
}

$rootScope.fonc_typematching = function (matchtype) {
	$rootScope.typemaching = matchtype;
	console.log("$rootScope.typemaching :", $rootScope.typemaching);
}

$rootScope.add_attr = function (lobjet, lattre) {
	lobjet[lattre] = '';
}

$rootScope.fonc_selectchoisie = function (lid, lindex, litem, t, sel, type) {
	//console.log('fonc_selectchoisie',lid,lindex,litem,t,sel,type)
	if ($rootScope.autoRun == true) {
		console.log('elemSelect', $("#" + sel + lindex).val());
		//console.log('litem',litem);

		$rootScope.matchingObjet = $rootScope.matchingObjet.filter(function (el) { return el.srcUID != litem.id; });

		var z = t[$("#" + sel + lindex).val()];
		var obj = {};
		obj['srcUID'] = litem.id;
		obj['trgUID'] = z.id;
		obj['srcName'] = litem.name;
		obj['trgName'] = z.name;
		if (type == 'dx' && z.categoryOptionCombo !== undefined) {
			//obj['srcCOC'] = litem.name;
			obj['trgCOC'] = z.categoryOptionCombo.id;
		}

		$rootScope.matchingObjet.push(obj);
		console.log('$rootScope.matchingObjet', $rootScope.matchingObjet);

	}
}
});

function handleFileSelect($rootScope, $http, evt, convertjson, dsKeyTarget) {
	$('#messages').removeClass('hidden');
	// $('#tableData').dataTable().fnClearTable();

	//var files = evt.target.files; // FileList object
	//var xlsFile = files[0]; // FileList object
	var xlsFile = evt; // FileList object
	if (xlsFile != '' || xlsFile !== undefined) {
		//$('#messages').html(xlsFile.name + ' - ' + xlsFile.size + ' bytes, last modified: ' + xlsFile.lastModifiedDate);
		var delimiter = ',';
		if (xlsFile !== undefined) {
			var reader = new FileReader();
			reader.onload = function (e) {
				var rows = e.target.result;
				convertjson = csvjsonConverter(rows, delimiter);
				console.log('convertjson', convertjson);
				$rootScope.settings[dsKeyTarget] = JSON.parse(convertjson);
				console.log($rootScope.settings);
				updateConfig($rootScope, $http);
			};
			reader.readAsText(xlsFile);
		}
		else {
			//alert("Please upload a csv file.");
			$('#messages').html('Please upload a csv file.');
		}
	} else {
		$('#messages').html('Incorrect file type');
	}
}

var csvjsonConverter = (csvdata, delimiter) => {

	let arrmatch = [];
	let array = [[]];
	let quotevals = "";
	let jsonarray = [];
	let k = 0;
	let regexp = new RegExp(("(\\" + delimiter + "|\\r?\\n|\\r|^)" + "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
		"([^\"\\" + delimiter + "\\r\\n]*))"), "gi");
	while (arrmatch = regexp.exec(csvdata)) {
		let delimitercheck = arrmatch[1];
		if ((delimitercheck !== delimiter) && delimitercheck.length) {
			array.push([]);
		}
		if (arrmatch[2]) {
			quotevals = arrmatch[2].replace('""', '\"');
		}
		else {
			quotevals = arrmatch[3];
		}
		array[array.length - 1].push(quotevals);
	}
	for (let i = 0; i < array.length - 1; i++) {
		jsonarray[i - 1] = {};
		for (let j = 0; j < array[i].length && j < array[0].length; j++) {
			let key = array[0][j];
			jsonarray[i - 1][key] = array[i][j]
		}
	}

	for (k = 0; k < jsonarray.length; k++) {
		let jsonobject = jsonarray[k];
		for (let prop in jsonobject) {
			if (!isNaN(jsonobject[prop]) && jsonobject.hasOwnProperty(prop)) {
				jsonobject[prop] = +jsonobject[prop];
			}
		}
	}
	let formatjson = JSON.stringify(jsonarray, null, 2);
	return formatjson;
};

function csvFileToJSON(file) {
	var csv = file;
	var delimiter = ',';
	if (csv !== undefined) {
		var reader = new FileReader();
		reader.onload = function (e) {
			var rows = e.target.result;
			var convertjson = csvjsonConverter(rows, delimiter);
			console.log('convertjsonFFFF', convertjson);
		};
		reader.readAsText(csv);
	}
	else {
		alert("Please upload a csv file.");
	}
}
