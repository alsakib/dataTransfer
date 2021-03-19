
	'use strict';

	var Q = require('q');
	var moment = require('moment');

	var d2 = require('./d2.js');

	module.exports.transfer = transfer;

	var source; //source instance info
	var target; //target instance
	var dataCodes; //data codes to transfer
	var level; //orgunit level (in source instance) to transfer
	var periods; //periods to transfer

	var dataElements, indicators, currentDataSet;

	var deferred;

	/**
	 * Reads config files and makes a queue of batches of data to fetch from the different sources
	 */
	function transfer(_source, _target, _dataCodes, _level, _periods) {
		deferred = Q.defer();

		source = _source;
		target = _target;
		dataCodes = _dataCodes;
		level = _level;
		periods = _periods;

		d2.setSource(source);
		getUIDs().then(
			function(UIDs) {

				if (UIDs.length < 1) {

					error("No matching data elements/indicators.");
					deferred.resolve(false);
				}
				else {
					getData(UIDs).then(function (data) {

						transformData(data);

					});
				}
			}
		)

		return deferred.promise;
	}


	function error(message, fatal) {

		console.log(message);

		if (fatal) exit(0);
	}


	
	
	function getData(UIDs) {
		var def = Q.defer();

		var outputIdScheme;
		if (source.ouIdScheme === 'uid') outputIdScheme = 'UID';
		else if (source.ouIdScheme === 'code') outputIdScheme = 'CODE';


		d2.fetchDataAtLevel(UIDs, periods, level, outputIdScheme).then(function(data) {

			def.resolve(data);

		});

		return def.promise;
	}



	function transformData(data) {

		if (!verifyHeaders(data.headers)) {
			console.log("Invalid headers for " + current.dataSet.code + " from " + current.source.name);
		}

		var dataValueSet = [];
		var rows = data.rows;
		for (var i = 0; i < rows.length; i++) {

			//Ignore unmapped indicators with value -100
			if (parseInt(rows[i][3]) < 0) continue;
			dataValueSet.push(
				{
					"dataElement": rows[i][0],
					"period": rows[i][1],
					"orgUnit": rows[i][2],
					"value": parseInt(rows[i][3]).toString(),
					"comment": "AUTOMATIC_" + new moment().format('YYYYMMDD')
				}
			);
		}

		//IF outputIdScheme was not code, we need to change all data element/indicator IDs back to code
		if (source.ouIdScheme != 'code') {
			for (var i = 0; i < dataValueSet.length; i++) {
				dataValueSet[i].dataElement = dataIdToCode(dataValueSet[i].dataElement);
			}
		}

		d2.setSource(target);
		d2.sendData(dataValueSet, true, 'code', source.ouIdScheme).then(function (data) {
			console.log(data);
			deferred.resolve(data);
		})

	}


	function verifyHeaders(headers) {

		if (headers[0].name != 'dx') return false;
		if (headers[1].name != 'pe') return false;
		if (headers[2].name != 'ou') return false;
		if (headers[3].name != 'value') return false;

		return true;

	}



	function getUIDs() {

		var def = Q.defer();

		var promises = [];
		promises.push(d2.dataElementsFromCodes(dataCodes));
		promises.push(d2.indicatorsFromCodes(dataCodes));
		Q.all(promises).then(function(data) {

			var UIDs = [];
			dataElements = data[0].dataElements;
			for (var i = 0; i < dataElements.length; i++) {

				UIDs.push(dataElements[i].id);

			}

			indicators = data[1].indicators;
			for (var i = 0; i < indicators.length; i++) {

				UIDs.push(indicators[i].id);

			}

			def.resolve(UIDs);

		});

		return def.promise;
	}

	function dataIdToCode(id) {
		for (var i = 0; i < dataElements.length; i++) {
			if (dataElements[i].id === id) {
				return dataElements[i].code;
			}
		}
		for (var i = 0; i < indicators.length; i++) {
			if (indicators[i].id === id) {
				return indicators[i].code;
			}
		}

	}



	function setCurrentDataSet(code) {
		var dataSets = conf.dataSets;
		for (var i = 0; i < dataSets.length; i++) {

			if (dataSets[i].code === code) {
				currentDataSet = dataSets[i];
				return true;
			}

		}

		currentDataSet = null;
		return false;

	}


