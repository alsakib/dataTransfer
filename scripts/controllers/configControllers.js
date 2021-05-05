
var i, j, maxId = 0;
var g = [], newProducts = [], convertjson = [];
var dsList = [], ouDs = [], configTarget;
// Recup données du dataStore

function fetchData($rootScope, $http) {
	$rootScope.settings = {
		"targetServer": { "pwd": "", "url": "", "user": "" },
		"ouMapping": [], "itemMapping": [],
		"comboMapping": [], "options": { "periodType": "", "ouLevel": "" },
		"lastSummary": {}, "lastSyncDate": ""
	};

	$rootScope.metaStrategy = "tessss"; $rootScope.targetServer = {};
	$rootScope.options = {};
	$rootScope.srcOU = []; $rootScope.trgOU = [];
	$rootScope.srcMeta = []; $rootScope.trgMeta = [];
	$rootScope.typemaching = ""; $rootScope.valuechoix = ""; $rootScope.valuechoixOU = "";
	$rootScope.matchingObjet = []; $rootScope.autoRun = true; $rootScope.targetServerr = { "pwd": "" };
	$rootScope.dxStrategy = ""; $rootScope.ouStrategy = "";
	$rootScope.settingFull = {}; $rootScope.dataSetList = [];

	var promise = $http.get(apiUrlConfig).then(function (response) {
		//if (!response.data == "") console.log('apiUrlConfig', response.data);
		$rootScope.settingFull = response.data;
		Util.populateSelect($('#instance'), "Instance", $rootScope.settingFull.instances);

	});

	$http({ method: 'get', url: '../../indicatorGroups.json?paging=false&fields=id,displayName~rename(name),code' })
		.then(function (response) { Util.populateSelect($('#sourceGroupMetaList'), "Groupe", response.data.indicatorGroups); })
		,(function (response) { console.log(response); });


	$http({ method: 'get', url: '../../organisationUnitLevels.json?paging=false&fields=displayName~rename(name),level~rename(id)&order=level:asc' })
		.then(function (response) {
			Util.populateSelect($('#sourceGroupOUList'), "ouLevels", response.data.organisationUnitLevels);
			Util.populateSelect($('#ouLevelList'), "ouLevels", response.data.organisationUnitLevels);
		}),(function (response) { console.log(response); });

}

function updateConfig($rootScope, $http) {
	var settingsJson = $rootScope.settings;
	$rootScope.instanceSelected = $("#instance option:selected").val();

	settingsJson.targetServer['pwd'] = CryptoJS.AES.encrypt($rootScope.targetServerr.pwd, clp).toString();
	//console.log('$rootScope.instanceSelected',$rootScope.instanceSelected, $rootScope.settingFull);
	//console.log('CryptoJS_e', CryptoJS.AES.encrypt($rootScope.targetServerr.pwd, clp));
	//($rootScope.instanceSelected === '' || $rootScope.instanceSelected === undefined || $rootScope.instanceSelected === null) ? console.log('instanceSelected yes') : console.log('instanceSelected no') ;

	if ($rootScope.instanceSelected === '' || $rootScope.instanceSelected === undefined || $rootScope.instanceSelected === null) {
		console.log('new instance');
		$rootScope.settings["id"] = getMaxId($rootScope.settingFull.instances);
		$rootScope.settingFull.instances.splice($rootScope.settingFull.instances.length, 0, $rootScope.settings)
	}
	else {
		console.log('update instance',$rootScope.settings.id);
		const indx = $rootScope.settingFull.instances.findIndex(i => i.id == $rootScope.settings.id);
		$rootScope.settingFull.instances.splice(indx, 1, $rootScope.settings)
	}

	$http.put(apiUrlConfig, $rootScope.settingFull, { headers: { 'Content-Type': 'application/json;charset=utf-8' } })
		.then(function (response) {
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
		//console.log('testConnexion');
		var auth = window.btoa($("#targetServerLogin").val() + ":" + $("#targetServerPwd").val());
		//console.log('auth', auth);
		headers = { "Authorization": "Basic " + auth };
		url = $("#targetServerURL").val() + '/api/me';
		$http.get(url, { headers: headers }).then(function (response) {
			//console.log('targetServer Statut: ', response.data)
			if (!response.data == "") {
				$rootScope.spanClass = 'success';
				$rootScope.testConnexionStatut = 'it is ok! ' + response.data.displayName + ' Connected';
				//console.log("targetServer exist ! ");

			}
		}, function (response) {
			$rootScope.spanClass = 'warning';
			$rootScope.testConnexionStatut = 'Something wrong! Please check url, username and password again';
			//console.log("targetServer inexist ! ");
		});
		url = $("#targetServerURL").val() + '/api/dataSets.json?paging=false&fields=id,displayName~rename(name),code,periodType';
		$http.get(url, { headers: headers })
			.then(function (response) { if (!response.data == "") {
				$rootScope.dataSetList = response.data.dataSets;
				Util.populateSelect($('#targetGroupMetaList'), "Datasets", $rootScope.dataSetList); } });

		url = $("#targetServerURL").val() + '/api/organisationUnitLevels.json?paging=false&fields=displayName~rename(name),level~rename(id)&order=level:asc';
		$http.get(url, { headers: headers })
			.then(function (response) { if (!response.data == "") { Util.populateSelect($('#targetGroupOUList'), "ouLevels", response.data.organisationUnitLevels); } });

	};

	$rootScope.delInstance = function () {
		$rootScope.instanceSelected = $("#instance option:selected").val();
		//let instanceArray = getArray(); i => i.id === $rootScope.instanceSelected
		const indx = $rootScope.settingFull.instances.findIndex(i => i.id == $rootScope.instanceSelected);
		console.log('delInstance', $rootScope.instanceSelected, indx);
		$rootScope.settingFull.instances.splice(indx, indx >= 0 ? 1 : 0);

		$http.put(apiUrlConfig, $rootScope.settingFull, { headers: { 'Content-Type': 'application/json;charset=utf-8' } })
			.then(function (response) {
				toastr.success('Deletion done! Refresh please');

			});
		console.log($rootScope.settingFull);
	};

	$rootScope.applyOUMap = function (strategy) {
		if (strategy == 'Merge') {
			$rootScope.settings['ouMapping'] = $rootScope.settings['ouMapping'].concat($rootScope.matchingObjet);
		} else {
			$rootScope.settings['ouMapping'] = $rootScope.matchingObjet;
		}
		updateConfig($rootScope, $http);
	};

	$rootScope.applyMetaMap = function (strategy) {
		if (strategy == 'Merge') {
			$rootScope.settings['itemMapping'] = $rootScope.settings['itemMapping'].concat($rootScope.matchingObjet);
		} else {
			$rootScope.settings['itemMapping'] = $rootScope.matchingObjet;
		}

		updateConfig($rootScope, $http);

	};

	$('#instance').change(function () {
		instanceSelected = $("#instance option:selected").val();

		console.log('instanceSelected', instanceSelected);

		if (instanceSelected !=="") {
		$rootScope.settings = $rootScope.settingFull.instances.filter(function (i) { return i.id == instanceSelected })[0];
		console.log('khkhkh', $rootScope.settings);
		$rootScope.targetServer = $rootScope.settings.targetServer;
		$rootScope.targetServerr['pwd'] = CryptoJS.AES.decrypt($rootScope.settings.targetServer.pwd, clp).toString(CryptoJS.enc.Utf8);
		} else { $rootScope.settings ={ "pwd": "", "url": "", "user": "",  "pwd": "",  "description": "" }, $rootScope.targetServerr['pwd'] = ""}

	});
	//metaChoosen groupMetaList deGroupEssentiel

	$('#typeMetaList').change(function () {
		$rootScope.matchingObjet = [];
		typeMetaList = $("#typeMetaList option:selected").val();
		//console.log('typeMetaList: ' + typeMetaList);
		if (typeMetaList == "indicator") {
			$http({ method: 'get', url: '../../indicatorGroups.json?paging=false&fields=id,displayName~rename(name),code' })
				.then(function (response) { Util.populateSelect($('#sourceGroupMetaList'), "Groupe", response.data.indicatorGroups); })
				,(function (response) { console.log(response); });
		} else if (typeMetaList == "programIndicator") {
			$http({ method: 'get', url: '../../programs.json?paging=false&fields=id,displayName~rename(name),code' })
				.then(function (response) { Util.populateSelect($('#sourceGroupMetaList'), "Program", response.data.programs); })
				,(function (response) { console.log(response); });
		}
	});

	$('#peType').change(function () {

		peType = $("#peType option:selected").val();
		
		if (peType !== "") {
			console.log('peType',peType)
			$rootScope.dataSetListFiltered = $rootScope.dataSetList.filter(function (i) { return i.periodType == peType });
			Util.populateSelect($('#targetGroupMetaList'), "Datasets", $rootScope.dataSetListFiltered);

		} else {
			Util.populateSelect($('#targetGroupMetaList'), "Datasets", $rootScope.dataSetList);
		}
	});

	$('#sourceGroupMetaList').change(function () {
		$rootScope.matchingObjet = [];
		srcMetaGrpSelected = $("#sourceGroupMetaList option:selected").val();
		//	console.log('srcMetaGrpSelected: ' + srcMetaGrpSelected);
		if (typeMetaList == "indicator") {
			$http.get("../../indicatorGroups/" + srcMetaGrpSelected + ".json?fields=indicators[id,displayName~rename(name),code]")
				.then(function (response) { if (!response.data == "") { $rootScope.srcMeta = response.data.indicators; } },
					function (response) { console.log("srcMetaGrpSelected error ! "); });
		} else if (typeMetaList == "programIndicator") {
			$http.get("../../programs/" + srcMetaGrpSelected + ".json?fields=programIndicators[id,displayName~rename(name),code]")
				.then(function (response) { if (!response.data == "") { $rootScope.srcMeta = response.data.programIndicators; } },
					function (response) { console.log("srcMetaGrpSelected error ! "); });
		}
	});

	$('#sourceGroupOUList').change(function () {
		$rootScope.matchingObjet = [];
		srcOuselected = $("#sourceGroupOUList option:selected").val();
		//console.log('srcOuselected: ' + srcOuselected);
		if (srcOuselected != "") {
			$http.get("../../organisationUnits.json?paging=false&level=" + srcOuselected + "&fields=id,displayName~rename(name),code&order=displayName:asc")
				.then(function (response) { if (!response.data == "") { $rootScope.srcOU = response.data.organisationUnits; } },
					function (response) { console.log("srcOuselected error ! "); });
		}
	});

	$('#ouLevelList').change(function () {
		$rootScope.matchingObjet = [];
		const levelOuselected = $("#ouLevelList option:selected").val();
		//console.log('levelOuselected: ',levelOuselected);
		$rootScope.settings.options.ouLevel = levelOuselected;

	});
	$('#targetGroupMetaList').change(function () {
		$rootScope.matchingObjet = [];
		trgMetaGrpSelected = $("#targetGroupMetaList option:selected").val();
		console.log('trgMetaGrpSelected: ' + trgMetaGrpSelected);
		// Loading start .... 
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
								"data-placeholder": "Choisisez ....",

								allowClear: true
							});
						}
						// Loading End .... 
						
					}
				});
		}
	});

	$('#targetGroupOUList').change(function () {
		$rootScope.matchingObjet = [];
		trgOuselected = $("#targetGroupOUList option:selected").val();
		//console.log('trgOuselected: ' + trgOuselected);
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
				//console.log(index, sc, tg, $rootScope.typemaching);
				tg.map(function (z, index2) {
					if (e[$rootScope.typemaching] == z[$rootScope.typemaching]) {
						//$rootScope.valuechoixOU0 = index2;
						$("#" + s + index).val(index2);
						$("#" + s + index).trigger("change");
						//console.log('src', e);
						//console.log('trg', z);

						var obj = {};
						obj['srcUID'] = e.id;
						obj['trgUID'] = z.id;
						obj['srcName'] = e.name;
						obj['trgName'] = z.name;
						if (type == 'dx' && z.categoryOptionCombo !== undefined) {
							obj['trgUID'] = z.id.split(".")[0]
							obj['trgCOC'] = z.categoryOptionCombo.id;
						}
						$rootScope.matchingObjet.push(obj);
						//console.log('$rootScope.matchingObjet', $rootScope.matchingObjet);
						//$rootScope.matchingObjet[e.id] = z.id;

					}

				})


			});
			$rootScope.autoRun = true;
		}
	}

	$rootScope.fonc_typematching = function (matchtype) {
		$rootScope.typemaching = matchtype;
		//console.log("$rootScope.typemaching :", $rootScope.typemaching);
	}

	$rootScope.add_attr = function (lobjet, lattre) {
		lobjet[lattre] = '';
	}

	$rootScope.fonc_selectchoisie = function (lid, lindex, litem, t, sel, type) {
		//console.log('fonc_selectchoisie',lid,lindex,litem,t,sel,type)
		if ($rootScope.autoRun == true) {
			//console.log('elemSelect', $("#" + sel + lindex).val());
			//console.log('litem',litem);

			$rootScope.matchingObjet = $rootScope.matchingObjet.filter(function (el) { return el.srcUID != litem.id; });
//console.log('trgselect',$("#" + sel + lindex+" option:selected").val());
const indx = t.findIndex(i => i.$$hashKey == $("#" + sel + lindex+" option:selected").val());
			//var z = t[$("#" + sel + lindex).val()];
			var z = t[indx];
			//console.log('fonc_selectchoisie',lid,lindex,z,sel,type,t)
			var obj = {};
			obj['srcUID'] = litem.id;
			obj['trgUID'] = z.id;
			obj['srcName'] = litem.name;
			obj['trgName'] = z.name;
			if (type == 'dx' && z.categoryOptionCombo !== undefined) {
				obj['trgUID'] = z.id.split(".")[0]
				obj['trgCOC'] = z.categoryOptionCombo.id;
			}

			$rootScope.matchingObjet.push(obj);
			//console.log('$rootScope.matchingObjet', $rootScope.matchingObjet);

		}
	}
});

function getMaxId(instList) {
	var maxId = 1;
	instList.forEach(function (e) {
		if (maxId < e.id) maxId = e.id;

	});

	return parseInt(maxId) + 1;
}

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
