//noinspection Eslint
(function(){
	'use strict';

	var conf = require('../conf/configuration.json');
	var Q = require('q');
	var request = require('request');
	var jsonfile = require('jsonfile');

	module.exports.setSource = setSource;
	module.exports.dataElementsFromCodes = dataElementsFromCodes;
	module.exports.indicatorsFromCodes = indicatorsFromCodes;
	module.exports.fetchDataAtLevel = fetchDataAtLevel;
	module.exports.sendData = sendData;


	var batchSize = 500;
	var qPromise;
	var inProgress = true;
	var importConflicts, importSummary;

	var debug = true;

	var sourceURL;
	var sourceUser;
	var sourcePwd;



	function setSource(source) {
		sourceURL = source.server;
		sourceUser = source.username;
		sourcePwd = source.password;
	}


	function dataElementsFromCodes(codes) {
		var requestURL = '/api/dataElements.json?fields=name,id,code&filter=code:in:[' + codes.join(',') + ']&paging=false';
		return get(requestURL);
	}

	function indicatorsFromCodes(codes) {
		var requestURL = '/api/indicators.json?fields=name,id,code&filter=code:in:[' + codes.join(',') + ']&paging=false';
		return get(requestURL);
	}


	function fetchDataAtLevel(UIDs, periods, level, outputIdScheme) {

		if (!outputIdScheme) outputIdScheme = 'CODE';

		var requestURL = '/api/analytics.json?dimension=dx:' + UIDs.join(';');
		requestURL += '&dimension=pe:'+ periods.join(';');
		requestURL += '&dimension=ou:LEVEL-' + level;
		requestURL += '&outputIdScheme=' + outputIdScheme;
		return get(requestURL);
	}


	function sendData(dataValues, update, deIdScheme, ouIdScheme) {
		var deferred = Q.defer();

		var url = '/api/dataValueSets';
		if (update) url += '?importStrategy=NEW_AND_UPDATES';
		else url += '?importStrategy=NEW';

		//DRY RUN FOR TESTING
		url += '&dryRun=false';

		importConflicts = [];
		importSummary = {
			"imported": 0,
			"updated": 0,
			"ignored": 0,
			"deleted": 0
		};

		sendDataQueue(dataValues, url, deIdScheme, ouIdScheme).then(function(data) {

			deferred.resolve(data);//TODO: never resolved?
		});

		return deferred.promise;
	}


	function sendDataQueue(dataValues, url, deIdScheme, ouIdScheme) {
		if (!inProgress) {
			qPromise = Q.defer();
			inProgress = true;
		}

		var data = {
			"dataValues": dataValues.splice(0, batchSize),
			"dataElementIdScheme": "code"
		};

		if (deIdScheme) data.dataElementIdScheme = deIdScheme;
		if (ouIdScheme) data.orgUnitIdScheme = ouIdScheme;

		post(url, data).then(function(data) {

			if (data && data.conflicts) importConflicts.push.apply(importConflicts, data.conflicts);
			if (data && data.importCount) {
				importSummary.imported += data.importCount.imported;
				importSummary.updated += data.importCount.updated;
				importSummary.ignored += data.importCount.ignored;
				importSummary.deleted += data.importCount.deleted;
			}

			if (data && dataValues.length === 0) {
				var summary = {
					"conflicts": importConflicts,
					"summary": importSummary
				};
				saveFileJson(summary);
				console.log(summary);
				inProgress = false;
				qPromise.resolve(true);
			}
			else {
				sendDataQueue(dataValues, url, deIdScheme, ouIdScheme);
			}

		});

		return qPromise.promise;
	}





	function post(url, payload) {

		var deferred = Q.defer();

		url = sourceURL + url;
		if (debug) console.log("POST request: " + url);

		request.post({
			uri: url,
			json: true,
			body: payload,
			auth: {
				'user': sourceUser,
				'pass': sourcePwd
			}
		}, function (error, response, data) {
			if (!error && response.statusCode === 200) {
				deferred.resolve(data);
			}
			else {
				console.log("Error in POST");
				console.log(data);
				deferred.reject({'data': data, 'error': error, 'status': response.statusCode});
			}
		});

		return deferred.promise;
	}



	function put(url, payload) {
		var deferred = Q.defer();

		url = sourceURL + url;
		if (debug) console.log("Put request: " + url);

		request.put({
			uri: url,
			json: true,
			body: payload,
			auth: {
				'user': sourceUser,
				'pass': sourcePwd
			}
		}, function (error, response, data) {
			if (!error && response.statusCode === 200) {
				deferred.resolve(data);
			}
			else {
				console.log("Error in PUT");
				deferred.reject({'data': data, 'error': error, 'status': response.statusCode});
			}
		});

		return deferred.promise;
	}

	var getQ;
	var getCurrent = null;
	function get(url) {
		var deferred = Q.defer();

		if (!getQ) getQ = [];

		getQ.push({ 'url': url, 'deferred': deferred});

		getNow();

		return deferred.promise;
	}

	function getNow() {

		if (getCurrent) return;
		else if (getQ.length === 0) {
			return;
		}
		else {
			getCurrent = getQ.pop();
		}

		var url = sourceURL + getCurrent.url;
		if (debug) console.log("GET request: " + url);

		request.get({
			uri: url,
			json: true,
			auth: {
				'user': sourceUser,
				'pass': sourcePwd
			}
		}, function (error, response, data) {
			if (!error && response.statusCode === 200) {
				//Save optionset
				getCurrent.deferred.resolve(data)
				getCurrent = null;
				getNow();
			}
			else {
				console.log("Error in GET");
				console.log(error.message);
				getCurrent.deferred.reject({'data': data, 'error': error, 'status': response});
				getCurrent = null;
				getNow();
			}
		});

	}

	function saveFileJson(data) {

		//Save file
		jsonfile.writeFileSync('/tmp/summary_json', data, function (err) {
			if (!err) console.log("Saved to /tmp/summary_json");
			else {
				console.log("Error saving metadata file:");
				console.error(err);
			}
		});
	}



}());
