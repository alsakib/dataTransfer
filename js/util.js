
// -------------------------------------------
// -- Utility Class/Methods

function Util() {}

Util.disableTag = function( tag, isDisable )
{
	tag.prop('disabled', isDisable);
}

Util.sortByKey = function( array, key ) {
	return array.sort( function( a, b ) {
		var x = a[key]; var y = b[key];
		return ( ( x < y ) ? -1 : ( ( x > y ) ? 1 : 0 ) );
	});
}

Util.trim = function( input )
{
	return input.replace( /^\s+|\s+$/gm, '' );
}

Util.stringSearch = function( inputString, searchWord )
{
	if( inputString.search( new RegExp( searchWord, 'i' ) ) >= 0 )
	{
		return true;
	}
	else
	{
		return false;
	}
}


// -------
// Check Variable or List Related

Util.getNotEmpty = function( input ) {

	if ( Util.checkDefined( input ) )
	{
		return input
	}
	else return "";
}

Util.checkDefined = function( input ) {

	if( input !== undefined && input != null ) return true;
	else return false;
}

Util.checkValue = function( input ) {

	if ( Util.checkDefined( input ) && input.length > 0 ) return true;
	else return false;
}

Util.checkDataExists = function( input ) {

	return Util.checkValue( input );
}

Util.checkData_WithPropertyVal = function( arr, propertyName, value ) {
	var found = false;

	if ( Util.checkDataExists( arr ) )
	{
		for ( i = 0; i < arr.length; i++ )
		{
			var arrItem = arr[i];
			if ( Util.checkDefined( arrItem[ propertyName ] ) && arrItem[ propertyName ] == value )
			{
				found = true;
				break;
			}
		}
	}

	return found;
}

Util.getFromListByName = function( list, name )
{
	var item;

	for( i = 0; i < list.length; i++ )
	{
		if ( list[i].name == name )
		{
			item = list[i];
			break;
		}
	}

	return item;
}

Util.getFromList = function( list, value, propertyName )
{
	var item;

	// If propertyName being compare to has not been passed, set it as 'id'.
	if ( propertyName === undefined )
	{
		propertyName = "id";
	}

	for( i = 0; i < list.length; i++ )
	{
		var listItem = list[i];

		if ( listItem[propertyName] == value )
		{
			item = listItem;
			break;
		}
	}

	return item;
}

// $.inArray( item_event.trackedEntityInstance, personList ) == -1

Util.checkExistInList = function( list, id, idPropertyName )
{
	var item = Util.getFromList( list, id, idPropertyName );

	if ( item === undefined ) return false;
	else return true;
}

Util.copyProperties = function( source, dest )
{
	for ( var key in source )
	{
		dest[ key ] = source[ key ];
	}
}

// Check Variable or List Related
// -------

// -------
// Seletet Tag Populate, Etc Related

Util.populateSelect = function( selectObj, selectName, json_Data )
{							
	selectObj.empty();
		if (selectName!="") { 
		selectObj.append( '<option value="">Select ' + selectName + '</option>' );
	}

	if ( json_Data !== undefined )
	{
	//console.log("setData ----- "+JSON.stringify(json_Data));
		$.each( json_Data, function( i, item ) {
			selectObj.append( $( '<option></option>' ).attr( "value", item.id ).text( item.name ) );
		});
	}
}
// -------
// Seletet  Populate, for special sqlviews ..... destinos .......;; 

Util.populateSelect_sql = function( selectObj, selectName, json_Data )
{							
	selectObj.empty();
	selectObj.append( '<option value="">Select ' + selectName + '</option>' );

	if ( json_Data !== undefined )
	{
	//console.log("setData ----- "+JSON.stringify(json_Data));
	console.log("Data loaded ! ");
		$.each( json_Data, function( i, item ) {
			selectObj.append( $( '<option></option>' ).attr( "value", json_Data[i][0]).text( json_Data[i][1] ) );
		});
	}
}

Util.populateSelect_WithDefaultName = function( selectObj, selectName, json_Data, defaultName )
{
	selectObj.empty();

	selectObj.append( $( '<option value="">Select ' + selectName + '</option>' ) );

	$.each( json_Data, function( i, item ) {

		if( item.name == defaultName )
		{
			selectObj.append( $( '<option selected></option>' ).attr( "value", item.id ).text( item.name ) );
		}
		else
		{
			selectObj.append( $( '<option></option>' ).attr( "value", item.id ).text( item.name ) );
		}
	});
}


Util.selectOption_WithOptionalInsert = function ( selectObj, id, list )
{
	if ( selectObj.find( "option" ).length > 0 )
	{
		selectObj.val( id );				
	}

	// If not found, add the item.
	if ( selectObj.val() != id )
	{
		if ( list !== undefined && list != null )
		{
			// If list is provided, get item (name & id pair) from the list
			var item = Util.getFromList( list, id );

			if ( item !== undefined )
			{
				selectObj.append( $( '<option></option>' ).attr( "value", item.id ).text( item.name ) );
			}
		}
		else
		{
			// If list is not provided, simply add this id - as value & name
			selectObj.append( $( '<option></option>' ).attr( "value", id ).text( id ) );
		}

		selectObj.val( id );
	}
}


Util.setSelectDefaultByName = function( ctrlTag, name )
{
	ctrlTag.find( "option:contains('" + name + "')" ).attr( 'selected', true );
}

Util.getSelectedOptionName = function( ctrlTag )
{
	return ctrlTag.options[ ctrlTag.selectedIndex ].text;
}

// Seletet Tag Populate, Etc Related
// -------

//******************************************************************************************************************************************//

function RESTUtil() {}

RESTUtil.getAsynchData = function( url, actionSuccess, actionError, loadingStart, loadingEnd ) 
{
	return $.ajax({
		type: "GET"
		,dataType: "json"
		,url: url
		,async: true
		,success: actionSuccess
		,error: actionError
		,beforeSend: function( xhr ) {
			if ( loadingStart !== undefined ) loadingStart();
		}
	})
	.always( function( data ) {
		if ( loadingEnd !== undefined ) loadingEnd();
	});
}


RESTUtil.getSynchData = function( url ) {
	return $.ajax({
		type: "GET",
		dataType: "json",
		url: url,
		async: false
	}).responseText;
}

/*
RESTUtil.submitData_Text = function( settingName, data )
{
	RESTUtil.submitData_URL( _queryURL_SystemSettings + settingName, data
		, function() { alert( 'Saved Successfully!' ); }
		, function() { alert( 'Failed to Save the value.' ); } );
}
*/


RESTUtil.submitData_Text = function( url, jsonData, successFunc, failFunc )
{		
	$.ajax({
	  type: "POST",
	  url: url,
	  data: JSON.stringify( jsonData ),
	  contentType: "text/plain; charset=utf-8",
	  success: function( msg ) {
		  successFunc();
		},
	  error: function( msg ) {
		  failFunc();
		}			   
	});
}

RESTUtil.submitData_URL = function( url, successFunc, failFunc )
{		
	$.ajax({
	  type: "POST",
	  url: url,
	  //data: JSON.stringify( jsonData ),
	  contentType: "text/plain; charset=utf-8",
	  success: function( msg ) {
		  successFunc();
		},
	  error: function( msg ) {
		  failFunc();
		}			   
	});
}


RESTUtil.submitData = function( jsonData, url, submitType, actionSuccess, actionError, loadingStart, loadingEnd)
{
	var jsonDataStr = "";

	if ( jsonData !== undefined )
	{
		jsonDataStr = JSON.stringify( jsonData );
	}
	
	return $.ajax({
		type: submitType
		,url: url
		,data: jsonDataStr
		,datatype: "text"
		,contentType: "application/json; charset=utf-8"
		,async: true
		,success: function( returnData)
		{
			var returnData_Json = {};
			
			try
			{
				if ( typeof returnData === "string" )
				{
					//console.log( 'submitData return string: ' + returnData );
					returnData_Json = $.parseJSON( returnData );
				}
				else if ( typeof returnData === "object" )
				{
					//console.log( 'submitData return object: ' + JSON.stringify( returnData ) );
					returnData_Json = returnData;
				}
			}
			catch(err) { }

			if ( actionSuccess !== undefined ) actionSuccess( returnData_Json );
		}
		,error: function( returnData )
		{
			if ( actionError !== undefined ) actionError( returnData );
		}
		,beforeSend: function( xhr ) {
			if ( loadingStart !== undefined ) loadingStart();
		}
	})
	.always( function( data ) {
		if ( loadingEnd !== undefined ) loadingEnd();
	});		
}


// ------------------------------------------------------------
// Data Retrieval Manager Class
//  - Helps us to load the data only once and reuse it for same request url
//  - Handles multiple request simultaneously.

// Data in memory access
RESTUtil.retrieveManager = new RetrieveManager();


function RetrieveManager() 
{
	var me = this;

	me.dataMemoryList = [];
	me._queryIdStr = "queryId";

	// The Main Retrieval method
	me.retrieveData = function( requestQuery, runFunc, failFunc, loadingStart, loadingEnd )
	{

		// Check if the request query was already been requested before
		var json_Data = Util.getFromList( me.dataMemoryList, requestQuery, me._queryIdStr );

		if ( json_Data === undefined )
		{
			// For the first time requesting, create a queue and run Async..

			var dataMemoryNew = {};
			
			dataMemoryNew[ me._queryIdStr ] = requestQuery;
			dataMemoryNew.data = null;
			dataMemoryNew.requestQueue = new Array();
			dataMemoryNew.requestQueue.push( { 'run': runFunc } ); //, 'loadingEnd': loadingEnd } );
			//dataMemoryNew.requestQueue.push( { 'run': runFunc, 'loadingEnd': loadingEnd } );

			me.dataMemoryList.push( dataMemoryNew );


			// Retrieve it
			RESTUtil.getAsynchData( requestQuery, function( dataObj ) 
			{
				// Once it gets data, run all the return functions..
				dataMemoryNew.data = dataObj;

				$.each( dataMemoryNew.requestQueue, function( i_func, item_func )
				{
					if ( item_func.run !== undefined ) item_func.run( dataObj );
				});

				// clear the queue.
				//dataMemoryNew.requestQueue = new Array();
			}
			, function( data )
			{
				if ( failFunc !== undefined ) failFunc( data );
				dataMemoryNew.data = '';	// So, that we can mark this request as 'already retrieved before' case.
			}
			, loadingStart
			, function()
			{
				if ( loadingEnd !== undefined ) loadingEnd();

				$.each( dataMemoryNew.requestQueue, function( i_func, item_func )
				{
					if ( item_func.loadingEnd !== undefined ) item_func.loadingEnd();
				});

				// clear the queue.
				dataMemoryNew.requestQueue = new Array();
			}
			);
		}
		else
		{
			// For already existing query or existing data:
			if ( loadingStart !== undefined ) loadingStart();
			
			// If the data is already retrieved before, return the data.
			if ( Util.checkDefined( json_Data.data ) )
			{
				runFunc( json_Data.data );
				if ( loadingEnd !== undefined ) loadingEnd();
			}
			else
			{
				// If the data is still in process, add the function to the request queue.
				// Add return fucntions to the queue.
				var newRequest = { 'run': runFunc };
				if ( loadingEnd !== undefined ) newRequest.loadingEnd = loadingEnd;

				json_Data.requestQueue.push( newRequest );
			}
		}
	}


	// Not Used for now.
	me.insertDirectToMemory = function( dataList, idName, idValue, data )
	{
		var dataNew = {};
		
		dataNew[ idName ] = idValue;
		dataNew.data = data;
		dataNew.requestQueue = new Array();

		dataMemoryList.push( dataNew );
	}
	
	me.clearMemory = function()
	{
		me.dataMemoryList = [];
	}

	me.removeFromMemory = function( requestQuery )
	{
		Util.RemoveFromArray( me.dataMemoryList, me._queryIdStr, requestQuery );
	}

}

// End of Data Retrieval Manager Class
// ------------------------------------------------------------
