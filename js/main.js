var manifestData;
var serverUrl;

$(document).ready(function () {
    loadManifest();
    window.dhis2 = window.dhis2 || {};
    dhis2.settings = dhis2.settings || {};

    var dhisroot = window.location.href.split('/api/')[0];
    var dhisrootArr = dhisroot.split('/');
    if (dhisrootArr.length >= 4) {
        dhis2.settings.baseUrl = dhisrootArr[3];
    } else {
        dhis2.settings.baseUrl = '';
    }

    loadMetaData('dataSets');
    loadIndGroup();
    loadDEGroup();
    loadDEGroupSet();
    loadOUGroup();
    //loadNiveauOUGroup();
    loadCOC();
    $("#coverLoad").hide();
});


function loadManifest() {
    jQuery.getJSON('manifest.webapp').done(function (data) {
        manifestData = data;
        serverUrl = manifestData.activities.dhis.href;
        //console.log('serverUrl '+serverUrl);
        $('#btnExit').attr('href', serverUrl);
        getCurrentUser();
    }).fail(function (jqXHR, textStatus, errorThrown) {
        $.blockUI({ message: 'Could not load manifest' });
    });
}
function getCurrentUser() {
    $.ajax({
        url: serverUrl + '/api/me',
        headers: {
            'Accept': 'application/json'
        },
        type: "GET",
        cache: false,
        crossDomain: true,
        xhrFields: {
            withCredentials: true
        }
    }).done(function (data, textStatus, jqXHR) {
        if (jqXHR.getResponseHeader('Login-Page') == 'true') {
            //$.blockUI({message: $('#unauthenticatedMessage')});
        }
        else {
        }
    }).fail(function (jqXHR, textStatus, errorThrown) {
        // $.blockUI({message: $('#failureMessage')});
    });
}

function loadDEGroup() {
    $.ajax({
        url: '../../dataElementGroups?paging=false&fields=id,name',
        headers: { 'Accept': 'application/json' },
        type: "GET", cache: false, crossDomain: true,
        xhrFields: { withCredentials: true }
    }).done(function (data, textStatus, jqXHR) {
        ouData = data;
        //console.log("DEGroup ----- "+JSON.stringify(ouData));			
        Util.populateSelect($('#configDeGroup'), "[ deGroup ]", ouData.dataElementGroups);
        Util.populateSelect($('#configDeGroupEssentiel'), "[ deGroupEssentiel ]", ouData.dataElementGroups);
    }).fail(function (jqXHR, textStatus, errorThrown) {
    });
}
function loadDEGroupSet() {
    $.ajax({
        url: '../../dataElementGroupSets?paging=false&fields=id,name',
        headers: { 'Accept': 'application/json' },
        type: "GET", cache: false, crossDomain: true,
        xhrFields: { withCredentials: true }
    }).done(function (data, textStatus, jqXHR) {
        ouData = data;
        //console.log("DEGroup ----- "+JSON.stringify(ouData));			
        Util.populateSelect($('#configDeGroupSet'), "[ deGroupSet ]", ouData.dataElementGroupSets);
    }).fail(function (jqXHR, textStatus, errorThrown) {
    });
}
function loadOUGroup() {
    $.ajax({
        url: '../../organisationUnitGroups?paging=false&fields=id,name',
        headers: { 'Accept': 'application/json' },
        type: "GET", cache: false, crossDomain: true,
        xhrFields: { withCredentials: true }
    }).done(function (data, textStatus, jqXHR) {
        ouData = data;
        ////console.log("DEGroup ----- "+JSON.stringify(ouData));			
        Util.populateSelect($('#configOUGroup'), "[ ouGroup ]", ouData.organisationUnitGroups);
    }).fail(function (jqXHR, textStatus, errorThrown) {
    });
}

function loadNiveauOUGroup() {
    $.ajax({
        url: '../../organisationUnitGroupSets/bTA4Vgh4Fx0/organisationUnitGroups?fields=id,name',
        headers: { 'Accept': 'application/json' },
        type: "GET", cache: false, crossDomain: true,
        xhrFields: { withCredentials: true }
    }).done(function (data, textStatus, jqXHR) {
        ouData = data;
        Util.populateSelect($('#ouGroupSetList'), " un Niveau", ouData.organisationUnitGroups);
    }).fail(function (jqXHR, textStatus, errorThrown) {
    });
}

function loadMetaData(metadata) {
    $.ajax({
        url: '../../' + metadata + '?paging=false&fields=id,name',
        headers: { 'Accept': 'application/json' },
        type: "GET", cache: false, crossDomain: true, xhrFields: { withCredentials: true }
    }).done(function (data, textStatus, jqXHR) {
        ouData = data; //console.log("dataSet ----- "+JSON.stringify(ouData));
        dataVal = ouData.dataSets; //console.log(dataVal);
        Util.populateSelect($('#configDS'), "[ New Dataset ]", dataVal);
    }).fail(function (jqXHR, textStatus, errorThrown) {
    });
}
function loadIndGroup() {
    $.ajax({
        url: '../../indicatorGroups?paging=false&fields=id,name',
        headers: { 'Accept': 'application/json' },
        type: "GET", cache: false, crossDomain: true, xhrFields: { withCredentials: true }
    }).done(function (data, textStatus, jqXHR) {
        ouData = data; //console.log("indicatorGroups ----- "+JSON.stringify(ouData));
        Util.populateSelect($('#configindGroup'), "[ indicatorGroups ]", ouData.indicatorGroups);
    }).fail(function (jqXHR, textStatus, errorThrown) {
    });
}
function loadCOC() {
    $.ajax({
        url: '../../categoryCombos?paging=false&fields=id,name',
        headers: { 'Accept': 'application/json' },
        type: "GET", cache: false, crossDomain: true, xhrFields: { withCredentials: true }
    }).done(function (data, textStatus, jqXHR) {
        ouData = data; //console.log("categoryCombos ----- "+JSON.stringify(ouData));
        Util.populateSelect($('#configcoc'), "[ Category combo ]", ouData.categoryCombos);
    }).fail(function (jqXHR, textStatus, errorThrown) {
    });
}
