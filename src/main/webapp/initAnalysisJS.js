/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var sessionID;
var data;
var rankedTable;
var customSelection;
var selectedTable;
var intermediateTable;
var relatedKeysTable;
var isIE;
var reviewTablePos;
var reviewTableRelevant;
var chartBig;
var chartSmall;
var timeWordSmall;
var timeWordBig;
var appIDList;
var intermediateResult = 0; // 0: empty, 1: append, 2: cluster
var theTask = 0;
var relatedKeys = [];
var rankedKeywords = [];
var goodbadReviews = [];
var relevantReviews = [];
var searchRankField;
var goodBadHilitor;
var relevantHilitor;
var startDate;
function initRequest() {
    if (window.XMLHttpRequest) {
        if (navigator.userAgent.indexOf('MSIE') != -1) {
            isIE = true;
        }
        return new XMLHttpRequest();
    } else if (window.ActiveXObject) {
        isIE = true;
        return new ActiveXObject("Microsoft.XMLHTTP");
    }
}

function init() {

//zoomChart();

    var smallSize = ((0.8 * $(document).height() - 84) - 0.35 * (0.8 * $(document).height() - 84)) / 2;
    document.getElementById("divRelatedKeys").style.minHeight = (smallSize * 0.7) + "px";
    document.getElementById("divRelatedKeys").style.maxHeight = (smallSize * 0.7) + "px";
    document.getElementById("smallChart").style.minHeight = (smallSize * 1.25) + "px";
    document.getElementById("smallChart").style.maxHeight = (smallSize * 1.25) + "px";

    document.getElementById("relevant-rev").style.minHeight = (smallSize * 1.95 - 56) + "px";
    document.getElementById("relevant-rev").style.maxHeight = (smallSize * 1.95 - 56) + "px";

    document.getElementById("revSearchRel").style.minWidth = ($(document).width() * 0.15) + "px";
    document.getElementById("revSearchRel").style.maxWidth = ($(document).width() * 0.15) + "px";

    document.getElementById("revSearch").style.minWidth = ($(document).width() * 0.25) + "px";
    document.getElementById("revSearch").style.maxWidth = ($(document).width() * 0.25) + "px";

    document.getElementById("positive-rev").style.minWidth = ($(document).width() * 0.7) + "px";
    document.getElementById("positive-rev").style.maxWidth = ($(document).width() * 0.7) + "px";
    document.getElementById("positive-rev").style.minHeight = ($(document).height() * 0.4) + "px";
    document.getElementById("positive-rev").style.maxHeight = ($(document).height() * 0.4) + "px";

    //alert(smallSize);
    searchRankField = document.getElementById("search-rank");
    relatedKeysTable = document.getElementById("related-keys");
    rankedTable = document.getElementById("ranked-table");
    selectedTable = document.getElementById("selected-table");
    intermediateTable = document.getElementById("intermediate-table");
    reviewTablePos = document.getElementById("positive-rev");
    goodBadHilitor = new Hilitor("positive-rev");
    goodBadHilitor.setMatchType("open");
    reviewTableRelevant = document.getElementById("relevant-rev");
    relevantHilitor = new Hilitor("relevant-rev");
    relevantHilitor.setMatchType("open");
    customSelection = document.getElementById("top-selection");
    var query = window.location.search;
    // Skip the leading ?, which should always be there, 
    // but be careful anyway
    if (query.substring(0, 1) == '?') {
        query = query.substring(1);
    }
    var appNames = "";
    data = query.split(',');
    for (var i = 0; (i < data.length); i++) {
        var info = data[i].split('+');
        data[i] = unescape(info[0]);
        if (i > 0)
            appNames += ", ";
        appNames += unescape(info[1]);
        //alert(data[i]);
    }
    appIDList = data;
    var url = "autocomplete?action=rank&id=" + data;
    req = initRequest();
    req.open("GET", url, true);
    req.onreadystatechange = callbackRankedKeywords;
    req.send(null);
    document.getElementById("appNames").innerHTML = appNames;
    //clearTableRankedKeywords();
}

function createPopup() {
    
    doSearch();
}

function clearSelectedAndUpdate() {
    clearTableselected();
    var rowLength = rankedTable.rows.length;
    for (var i = 0; i < rowLength; i++) {
//gets cells of current row  
        var oCells = rankedTable.rows.item(i).cells;
        //loops through each cell in current row
        for (var j = 0; j < oCells.length; j++) {
// get your cell info here
            oCells.item(j).childNodes[0].style.color = "#0025ff";
        }
    }
    if (intermediateResult == 1) {//append
        rowLength = intermediateTable.rows.length;
        for (var i = 0; i < rowLength; i++) {
//gets cells of current row  
            var oCells = intermediateTable.rows.item(i).cells;
            //loops through each cell in current row
            for (var j = 0; j < oCells.length; j++) {
// get your cell info here
                oCells.item(j).childNodes[0].style.color = "#0025ff";
            }
        }
    }

    if (intermediateResult == 2) { //cluster
//loops through rows    
        for (var i = 0; i < intermediateTable.rows.length; i++) {
            var row = intermediateTable.rows.item(i);
            var dataCell = row.childNodes[0].rows.item(1);
            var otable = dataCell.childNodes[0].childNodes[0]; // because of tbody
            //alert(otable.innerHTML);
            //alert(otable.rows.length);
            for (var r = 0; r < otable.rows.length; r++) {
                var oCells = otable.rows.item(r).cells;
                //loops through each cell in current row
                for (var j = 0; j < oCells.length; j++) {
// get your cell info here
                    oCells.item(j).childNodes[0].style.color = "#0025ff";
                }
            }
        }
    }
}

function customTopSelection() {

    var number = customSelection.value;
    if (isNumeric(number))
        interfaceClearSelected(number);
    else {
        alert("Not a number! dude")
        customSelection.value = "";
    }
}
function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}
function interfaceClearSelected(task) {

    if (selectedTable.rows.length > 0) {
        $.blockUI({
            message: $('#clear-warning'),
            css: {
                border: '0px',
                backgroundColor: '#fff',
                cursor: 'auto'
            }
        });
        theTask = task;
    } else {
        if (task > 0)
            doAutoSelect(task);
    }
}
function answerYes() {
    if (theTask == 0)
        clearSelectedAndUpdate();
    else
        doAutoSelect(theTask);
    $.unblockUI();
}
function answerNo() {
    $.unblockUI();
}
function exitBlock() {
    resetAllFilters();
    $.unblockUI();
}

function doAutoSelect(number) {
    clearSelectedAndUpdate();
    var rowLength = rankedTable.rows.length;
    //loops through rows    
    var loop = 0;
    for (var i = 0; i < rowLength; i++) {
//gets cells of current row  
        var oCells = rankedTable.rows.item(i).cells;
        //gets amount of cells of current row
        var cellLength = oCells.length;
        //loops through each cell in current row
        for (var j = 0; j < cellLength; j++) {
// get your cell info here
            var cellVal = oCells.item(j).childNodes[2].innerHTML;
            loop = loop + 1;
            appendSelected(cellVal, 1);
            //oCells.item(j).childNodes[0].style.color = "#c0c0bf";
            if (loop == number) {
                doTimeSeriesBig();
                return;
            }
        }
    }
    doTimeSeriesBig();
}

function doTimeSeriesSmall(word) {
    if (word != timeWordSmall) {
        timeWordSmall = word;
        packed = word + ";" + appIDList
        $.ajax({
            type: "GET",
            url: "autocomplete?action=time", //&id=" + appIDList,
            data: {param0: packed},
            //dataType: "json",
            contentType: 'application/json',
            success: function (response) {
                //alert(response);
                parseMessagesTimeSmall(response);
                doSearchRelevantWords(timeWordSmall);
            }//,
            //  error: function(xhr, ajaxOptions, thrownError) { alert(xhr.responseText); }
        });

//        var url = "autocomplete?action=time&id=" + word + ";" + appIDList;
//        req = initRequest();
//        req.open("GET", url, true);
//        req.onreadystatechange = callbackTimeSmall;
//        req.send(null);
    }

}


function callbackTimeSmall() {
    if (req.readyState == 4) {
        if (req.status == 200) {
            parseMessagesTimeSmall(req.responseXML);
            doSearchRelevantWords(timeWordSmall);
        }
    }
}

function parseMessagesTimeSmall(responseXML) {
// no matches returned
    if (responseXML == null) {
        return false;
    } else {
        var composite = responseXML.getElementsByTagName("timeseries")[0];
        var date = composite.getElementsByTagName("startdate")[0].childNodes[0].nodeValue;
        var data = composite.getElementsByTagName("data")[0];
        var count = [];
        var movingavr = [];
        var ratio = [];
        if (data.childNodes.length > 0) {
            for (var loop = 0; loop < data.childNodes.length; loop++) {
                var day = data.getElementsByTagName("day")[loop];
                count.push(day.getElementsByTagName("count")[0].childNodes[0].nodeValue);
                movingavr.push(day.getElementsByTagName("movingavr")[0].childNodes[0].nodeValue);
                ratio.push(day.getElementsByTagName("ratio")[0].childNodes[0].nodeValue);
            }
        }
        var chartData = generateChartData(count, movingavr, ratio, date);
        initChart(chartData, 0);
    }
}

function doTimeSeriesBig() {
    var rowLength = selectedTable.rows.length;
    var packed = "";
    var timeWordBig_temp = "";
    var items = 0;
    for (var i = 0; i < rowLength; i++) {
//gets cells of current row  
        var oCells = selectedTable.rows.item(i).cells;
        //gets amount of cells of current row
        var cellLength = oCells.length;
        //loops through each cell in current row
        for (var j = 0; j < cellLength; j++) {
            items++;
            // get your cell info here
            var cellStr = oCells.item(j).childNodes[1].innerHTML;
            if (items > 1) {
                packed += ",";
                timeWordBig_temp += ", "
            }
            packed += escape(cellStr);
            timeWordBig_temp += cellStr;
        }
    }
    packed += ";" + appIDList;
    //alert(packed);
    if (packed.length > 1) {
        $.ajax({
            type: "GET",
            url: "autocomplete?action=time", //&id=" + appIDList,
            data: {param0: packed},
            //dataType: "json",
            contentType: 'application/json',
            success: function (response) {
                /// alert(response);
                //callbackTimeBig();
                parseMessagesTimeBig(response);
            }//,
            //  error: function(xhr, ajaxOptions, thrownError) { alert(xhr.responseText); }
        });
//        var url = "autocomplete?action=time&id=" + packed + ";" + appIDList;
//        //alert(url);
//        req = initRequest();
//        req.open("GET", url, true);
//        req.onreadystatechange = callbackTimeBig;
//        req.send(null);
        if (timeWordBig_temp.length > 50)
            timeWordBig = timeWordBig_temp.substr(0, 50) + "..";
        else {
            timeWordBig = timeWordBig_temp;
        }
    }
    else
        alert("Please select some keywords!");
}


function callbackTimeBig() {
    if (req.readyState == 4) {
        if (req.status == 200) {
            parseMessagesTimeBig(req.responseXML);
        }
    }
}


function parseMessagesTimeBig(responseXML) {
// no matches returned
    if (responseXML == null) {
        return false;
    } else {
        var composite = responseXML.getElementsByTagName("timeseries")[0];
        var date = composite.getElementsByTagName("startdate")[0].childNodes[0].nodeValue;
        var data = composite.getElementsByTagName("data")[0];
        var count = [];
        var movingavr = [];
        var ratio = [];
        if (data.childNodes.length > 0) {
            for (var loop = 0; loop < data.childNodes.length; loop++) {
                var day = data.getElementsByTagName("day")[loop];
                count.push(day.getElementsByTagName("count")[0].childNodes[0].nodeValue);
                movingavr.push(day.getElementsByTagName("movingavr")[0].childNodes[0].nodeValue);
                ratio.push(day.getElementsByTagName("ratio")[0].childNodes[0].nodeValue);
            }
        }
        var chartData = generateChartData(count, movingavr, ratio, date);
        initChart(chartData, 1);
    }
}
function initChart(chartData, smallBig) {
    if (smallBig == 0) {
        chartSmall = AmCharts.makeChart("smallChart", {
            "type": "serial",
            "theme": "none",
            "legend": {
                //"legendText":"Something",
                "useGraphSettings": true
            },
            "dataProvider": chartData,
            "valueAxes": [{
                    "id": "v1",
                    "axisColor": "#747474",
                    "axisThickness": 2,
                    "gridAlpha": 0,
                    "axisAlpha": 1,
                    "position": "left"
                }, {
                    "id": "v2",
                    "axisColor": "#747474",
                    "axisThickness": 2,
                    "gridAlpha": 0,
                    "axisAlpha": 1,
                    "position": "right"
                }, {
                    "id": "v3",
                    "axisColor": "#747474",
                    "guides": [{
                            "dashLength": 6,
                            "inside": true,
                            "label": "significant",
                            "lineAlpha": 1,
                            "value": 2
                        }],
                    "axisThickness": 2,
                    "gridAlpha": 0,
                    "offset": 50,
                    "axisAlpha": 1,
                    "position": "left"
                }],
            "graphs": [{
                    "valueAxis": "v2",
                    "lineColor": "#f5137d",
                    "bullet": "round",
                    "bulletBorderThickness": 1,
                    "hideBulletsCount": 30,
                    "title": "word count",
                    "valueField": "count",
                    "fillAlphas": 0
                }, {
                    "valueAxis": "v2",
                    "lineColor": "#FCD202",
                    "bullet": "square",
                    "bulletBorderThickness": 1,
                    "hideBulletsCount": 30,
                    "title": "moving average",
                    "valueField": "movingavr",
                    "lineAlpha": 1,
                    "fillAlphas": 0
                }, {
                    "valueAxis": "v3",
                    "lineColor": "#c9c8ca",
                    //"bullet": "triangleUp",
                    //"bulletBorderThickness": 1,
                    //"hideBulletsCount": 30,

                    "title": "ratio of Difference to Standard Deviation",
                    "type": "column",
                    "valueField": "ratio",
                    "fillAlphas": 0.8,
                    "lineAlpha": 0.2
                }],
            "chartScrollbar": {},
            "chartCursor": {
                "cursorPosition": "mouse"
            },
            "categoryField": "date",
            "categoryAxis": {
                "parseDates": true,
                "axisColor": "#DADADA",
                "minorGridEnabled": true
            },
            "export": {
                "enabled": true,
                "position": "bottom-right"
            },
            "numberFormatter": {
                "precision": 2,
                "decimalSeparator": ".",
                "thousandsSeparator": ""
            }
        });
        chartSmall.addListener("dataUpdated", zoomChartSmall);
        //alert(chartData);
    } else {
        chartBig = AmCharts.makeChart("bigChart", {
            "type": "serial",
            "theme": "none",
            "legend": {
                "useGraphSettings": true
            },
            "dataProvider": chartData,
            "valueAxes": [{
                    "id": "v1",
                    "axisColor": "#747474",
                    "axisThickness": 2,
                    "gridAlpha": 0,
                    "axisAlpha": 1,
                    "position": "left"
                }, {
                    "id": "v2",
                    "axisColor": "#747474",
                    "axisThickness": 2,
                    "gridAlpha": 0,
                    "axisAlpha": 1,
                    "position": "right"
                }, {
                    "id": "v3",
                    "axisColor": "#747474",
                    "guides": [{
                            "dashLength": 6,
                            "inside": true,
                            "label": "significant",
                            "lineAlpha": 1,
                            "value": 2
                        }],
                    "axisThickness": 2,
                    "gridAlpha": 0,
                    "offset": 50,
                    "axisAlpha": 1,
                    "position": "left"
                }],
            "graphs": [{
                    "valueAxis": "v2",
                    "lineColor": "#f5137d",
                    "bullet": "round",
                    "bulletBorderThickness": 1,
                    "hideBulletsCount": 30,
                    "title": "word count",
                    "valueField": "count",
                    "fillAlphas": 0
                }, {
                    "valueAxis": "v2",
                    "lineColor": "#FCD202",
                    "bullet": "square",
                    "bulletBorderThickness": 1,
                    "hideBulletsCount": 30,
                    "title": "moving average",
                    "valueField": "movingavr",
                    "lineAlpha": 1,
                    "fillAlphas": 0
                }, {
                    "valueAxis": "v3",
                    "lineColor": "#c9c8ca",
                    //"bullet": "triangleUp",
                    //"bulletBorderThickness": 1,
                    //"hideBulletsCount": 30,

                    "title": "ratio of Difference to Standard Deviation",
                    "type": "column",
                    "valueField": "ratio",
                    "fillAlphas": 0.8,
                    "lineAlpha": 0.2
                }],
            "chartScrollbar": {},
            "chartCursor": {
                "cursorPosition": "mouse"
            },
            "categoryField": "date",
            "categoryAxis": {
                "parseDates": true,
                "axisColor": "#DADADA",
                "minorGridEnabled": true
            },
            "export": {
                "enabled": true,
                "position": "bottom-right"
            },
            "numberFormatter": {
                "precision": 2,
                "decimalSeparator": ".",
                "thousandsSeparator": ""
            },
            "titles": [
                {
                    "text": "Time-series of Selected Keywords",
                    "size": 15
                }
            ]
        });
        chartBig.addListener("dataUpdated", zoomChartBig);
        //alert(chartData);
    }
}
function zoomChartSmall() {
    chartSmall.zoomToIndexes(chartSmall.dataProvider.length - 20, chartSmall.dataProvider.length - 1);
}
function zoomChartBig() {
    chartBig.zoomToIndexes(chartBig.dataProvider.length - 20, chartBig.dataProvider.length - 1);
}
// generate some random data, quite different range
function generateChartData(count, movingavr, ratio, date) {
    var chartData = [];
    var firstDate = new Date(date);
    //alert(firstDate);
    //firstDate.setDate(firstDate.getDate() - 100);

    for (var i = 0; i < count.length; i++) {
// we create date objects here. In your data, you can have date strings
// and then set format of your dates using chart.dataDateFormat property,
// however when possible, use date objects, as this will speed up chart rendering.
        var newDate = new Date(firstDate);
        newDate.setDate(newDate.getDate() + i);
        chartData.push({
            date: newDate,
            count: count[i],
            movingavr: movingavr[i],
            ratio: ratio[i]
        });
    }
    return chartData;
}
function reviewManip() {
    var sort = document.getElementById("revSortSelect").value;
    switch (sort) {
        case "Most relevant":
            sort = "relevancy";
            break;
        case "Rating: Low to High":
            sort = "low";
            break;
        case "Rating: High to Low":
            sort = "high";
            break;
        case "Most recent":
            sort = "recent";
            break;
    }
    var filter = document.getElementById("revRateSelect").value;
    switch (filter) {
        case "All stars":
            filter = "all";
            break;
        case "1 star only":
            filter = "1";
            break;
        case "2 star only":
            filter = "2";
            break;
        case "3 star only":
            filter = "3";
            break;
        case "4 star only":
            filter = "4";
            break;
        case "5 star only":
            filter = "5";
            break;
        case "All positive":
            filter = "positive";
            break;
        case "All negative":
            filter = "negative";
            break;
    }
    var search = document.getElementById("revSearch").value.toLowerCase();
    var packed = "";
    var items = 0;
    var rowLength = selectedTable.rows.length;
    for (var i = 0; i < rowLength; i++) {
//gets cells of current row  
        var oCells = selectedTable.rows.item(i).cells;
        //gets amount of cells of current row
        var cellLength = oCells.length;
        //loops through each cell in current row
        for (var j = 0; j < cellLength; j++) {
            items++;
            // get your cell info here
            var cellStr = oCells.item(j).childNodes[1].innerHTML;
            if (items > 1) {
                packed += ",";
            }
            packed += escape(cellStr);
        }
    }

    if (packed.length > 1) {
        alert(1);
//alert(sessionID);
        var url = "autocomplete?action=search&id=" + packed + "&apps=" + appIDList
                + "&sort=" + sort + "&filter=" + filter
                + "&search=" + search + "&first=no&secid=" + sessionID
                + "&start=" + chartBig.startDate.getTime() + "&end=" + chartBig.endDate.getTime();
        req = initRequest();
        req.open("GET", url, true);
        req.onreadystatechange = callbackSearch;
        req.send(null);
        clearRevDiv();
    }
    else
        alert("Please select some keywords!");
}
function reviewManipRel() {
    var sort = document.getElementById("revSortSelectRel").value;
    switch (sort) {
        case "Most relevant":
            sort = "relevancy";
            break;
        case "Rating: Low to High":
            sort = "low";
            break;
        case "Rating: High to Low":
            sort = "high";
            break;
        case "Most recent":
            sort = "recent";
            break;
    }
    var filter = document.getElementById("revRateSelectRel").value;
    switch (filter) {
        case "All stars":
            filter = "all";
            break;
        case "1 star only":
            filter = "1";
            break;
        case "2 star only":
            filter = "2";
            break;
        case "3 star only":
            filter = "3";
            break;
        case "4 star only":
            filter = "4";
            break;
        case "5 star only":
            filter = "5";
            break;
        case "All positive":
            filter = "positive";
            break;
        case "All negative":
            filter = "negative";
            break;
    }
    var search = document.getElementById("revSearchRel").value.toLowerCase();

//alert(sessionID);
    alert(2);
    var url = "autocomplete?action=search&id=" + timeWordSmall + "&apps=" + appIDList
            + "&sort=" + sort + "&filter=" + filter
            + "&search=" + search + "&first=no&secid=" + sessionID;
    //alert(url);
    req = initRequest();
    req.open("GET", url, true);
    req.onreadystatechange = callbackSearchRelevant2;
    req.send(null);
    reviewTableRelevant.innerHTML = "";
    //alert(1);
}
function doSearch() {
    $.blockUI({
        message: $('#divrev'),
        css: {
            padding: 0,
            margin: 0,
            width: '90%',
            top: '5%',
            left: '5%',
            textAlign: 'center',
            color: '#000',
            border: '0px',
            backgroundColor: '#fff',
            cursor: 'auto'
        },
        onBlock: function () {

        }
    });
    $('.blockOverlay').attr('title', 'Click to unblock').click($.unblockUI);
    
    var packed = "";
    var items = 0;
    var rowLength = selectedTable.rows.length;
    for (var i = 0; i < rowLength; i++) {
//gets cells of current row  
        var oCells = selectedTable.rows.item(i).cells;
        //gets amount of cells of current row
        var cellLength = oCells.length;
        //loops through each cell in current row
        for (var j = 0; j < cellLength; j++) {
            items++;
            // get your cell info here
            var cellStr = oCells.item(j).childNodes[1].innerHTML;
            if (items > 1) {
                packed += ",";
            }
            packed += escape(cellStr);
        }
    }
$.ajax({
            type: "GET",
            //url: "autocomplete?action=search&id=" + appIDList,          
            url : "autocomplete?action=search&id=" + packed + "&apps=" + appIDList + 
            "&sort=relevancy&filter=all&search=&first=yes&secid=" + sessionID,
            //data: {param0: packed},
            //dataType: "json",
            contentType: 'application/json',
            success: function (response) {
                callbackSearch();
                //alert(response);
    //clearTableIntermediate();
     //           parseMessagesCluster(response);
                //callbackCluster();
            }//,
            //  error: function(xhr, ajaxOptions, thrownError) { alert(xhr.responseText); }
        });
}

function callbackSearch() {
    if (req.readyState == 4) {
        if (req.status == 200) {
            alert(req.responseXML);
            parseMessagesSearch(req.responseXML);
        }
    }
}

function resetAllFilters() {
    document.getElementById("revRateSelect").selectedIndex = 0;
    document.getElementById("revSortSelect").selectedIndex = 0;
    document.getElementById("revSearch").value = "";
    document.getElementById("revSortSelectRel").selectedIndex = 0;
    document.getElementById("revRateSelectRel").selectedIndex = 0;
    document.getElementById("revSearchRel").value = "";
}
function parseMessagesSearch(responseXML) {
// no matches returned
    if (responseXML == null) {
        return false;
    } else {
        var reviews = responseXML.getElementsByTagName("rankedreviews")[0];
        if (reviews.childNodes.length > 0) {

            var totalPage = reviews.getElementsByTagName("totalpage")[0].childNodes[0].nodeValue;
            var currentPage = reviews.getElementsByTagName("currentpage")[0].childNodes[0].nodeValue;

//alert(reviews.childNodes.length);
            for (var loop = 0; loop < reviews.childNodes.length - 2; loop++) {
                var rev = reviews.getElementsByTagName("review")[loop];
                //alert(rev.childNodes.length);

                var rate = rev.getElementsByTagName("rating")[0].childNodes[0].nodeValue;
                var text = rev.getElementsByTagName("text")[0].childNodes[0].nodeValue;
                var title = rev.getElementsByTagName("title")[0].childNodes[0].nodeValue;
                var id = rev.getElementsByTagName("id")[0].childNodes[0].nodeValue;
                var time = rev.getElementsByTagName("time")[0].childNodes[0].nodeValue;
                var app = rev.getElementsByTagName("app")[0].childNodes[0].nodeValue;
                var keywords = rev.getElementsByTagName("keywords")[0].childNodes[0].nodeValue;
                appendReview(text, rate, time, id, title, app, keywords, 1, false);
                //count++;
            }
// handle paging
            var reviewArea = reviewTablePos;
            var start = parseInt(currentPage) - 2;
            if (start < 1)
                start = 1;
            var stop = parseInt(currentPage) + 2;
            if (stop > totalPage)
                stop = totalPage;
            //alert(start+"-"+stop+"-"+currentPage+"-"+totalPage);
            var elem;
            if (start != 1) {
                elem = document.createElement("text");
                elem.appendChild(document.createTextNode("<< "));
                elem.onclick = (function () {
                    return function () {
                        //elem.style.color = "#c0c0bf";
                        //appendSelected(key, 0);
                        changePage(1);
                    }
                })();
                elem.className = "link";
                reviewArea.appendChild(elem);

                elem = document.createElement("text");
                elem.appendChild(document.createTextNode("... "));
                elem.style.fontSize = "1.5em";
                reviewArea.appendChild(elem);
            }
            for (var i = start; i <= stop; i++) {

                elem = document.createElement("text");
                elem.appendChild(document.createTextNode(i));
                if (currentPage != i) {
                    elem.className = "link";
                    elem.onclick = (function () {
                        return function () {
                            //elem.style.color = "#c0c0bf";
                            //appendSelected(key, 0);
                            changePage(this.innerHTML);
                        }
                    })();
                } else {
                    elem.style.fontSize = "1.7em";
                }
                reviewArea.appendChild(elem);
                elem = document.createElement("text");
                elem.appendChild(document.createTextNode(" "));
                elem.style.fontSize = "1.5em";
                reviewArea.appendChild(elem);
            }
            if (stop < totalPage) {
                elem = document.createElement("text");
                elem.appendChild(document.createTextNode("... "));
                elem.style.fontSize = "1.5em";
                reviewArea.appendChild(elem);
                elem = document.createElement("text");
                elem.appendChild(document.createTextNode(">>"));
                elem.onclick = (function () {
                    return function () {
                        //elem.style.color = "#c0c0bf";
                        //appendSelected(key, 0);
                        changePage(totalPage);
                    }
                })();
                elem.className = "link";
                reviewArea.appendChild(elem);
            }
//alert('number of loop:' + count);
        } else {
            alert(reviews.childNodes.length);
            appendReview(1, 2, 3, 4, 5, 6, 7, 1, true);
        }
        makeRate();
        goodBadHilitor.apply(document.getElementById("revSearch").value.toLowerCase());
    }
}

function changePage(val) {

    var packed = "";
    var items = 0;
    var rowLength = selectedTable.rows.length;
    for (var i = 0; i < rowLength; i++) {
//gets cells of current row  
        var oCells = selectedTable.rows.item(i).cells;
        //gets amount of cells of current row
        var cellLength = oCells.length;
        //loops through each cell in current row
        for (var j = 0; j < cellLength; j++) {
            items++;
            // get your cell info here
            var cellStr = oCells.item(j).childNodes[1].innerHTML;
            if (items > 1) {
                packed += ",";
            }
            packed += escape(cellStr);
        }
    }

    if (packed.length > 1) {
//alert(sessionID);
        var url = "autocomplete?action=page&id=" + packed + "&page=" + val
                + "&secid=" + sessionID;

        req = initRequest();
        req.open("GET", url, true);
        req.onreadystatechange = callbackSearch;
        req.send(null);
        clearRevDiv();
    }
    else
        alert("Please select some keywords!");
}

function searchRelevantReviews() {
    var searchStr = document.getElementById("search-relevant").value;
    reviewTableRelevant.innerHTML = "";
    for (var i = 0; i < relevantReviews.length; i++) {
        var rev = relevantReviews[i];
        //alert(rev.childNodes.length);
        var text = rev.getElementsByTagName("text")[0].childNodes[0].nodeValue;
        if (text.search(searchStr) > -1 || text.search(searchStr.toUpperCase()) > -1) {
            var keywords = rev.getElementsByTagName("keywords")[0].childNodes[0].nodeValue;
            var rate = rev.getElementsByTagName("rating")[0].childNodes[0].nodeValue;
            var title = rev.getElementsByTagName("title")[0].childNodes[0].nodeValue;
            var id = rev.getElementsByTagName("id")[0].childNodes[0].nodeValue;
            var time = rev.getElementsByTagName("time")[0].childNodes[0].nodeValue;
            var app = rev.getElementsByTagName("app")[0].childNodes[0].nodeValue;
            appendReview(text, rate, time, id, title, app, keywords, 0, false);
        }
    }
    relevantHilitor.apply(searchStr);
    makeRate();
}

function makeRate()
{
    $('span.stars').stars();
}

$.fn.stars = function () {
    return $(this).each(function () {
// Get the value
        var val = parseFloat($(this).html());
        // Make sure that the value is in 0 - 5 range, multiply to get width
        var size = Math.max(0, (Math.min(5, val))) * 16;
        // Create stars holder
        var $span = $('<span />').width(size);
        // Replace the numerical value with stars
        $(this).html($span);
    });
}
function clearRevDiv() {
    reviewTablePos.innerHTML = "";
}
function appendReview(text, rate, time, id, title, app, keywords, multiple, noResult) {

//alert("0");

    var reviewArea = reviewTablePos;
    if (multiple == 0)
        reviewArea = reviewTableRelevant;
    if (noResult == true) {
        var elem = document.createElement("text");
        elem.appendChild(document.createTextNode("There is no review for this search!"));
        elem.className = "revTitle";
        reviewArea.appendChild(elem);
    }
    var elem = document.createElement("text");
    if (title.length < 51)
        elem.appendChild(document.createTextNode(title.substring(0, title.length) + "  "));
    else
        elem.appendChild(document.createTextNode(title.substring(0, 50) + "... "));
    elem.className = "revTitle";
    reviewArea.appendChild(elem);
    elem = document.createElement("text");
    elem.appendChild(document.createTextNode(" " + rate + ".0  "));
    elem.className = "appRate";
    reviewArea.appendChild(elem);
//<span class="stars">2.4618164</span>
    elem = document.createElement("span");
    elem.className = "stars";
    elem.innerHTML = rate;
    reviewArea.appendChild(elem);
    elem = document.createElement("text");
    elem.appendChild(document.createTextNode("\n" + app + " - "));
    elem.className = "greenText";
    reviewArea.appendChild(elem);
    elem = document.createElement("text");
    elem.appendChild(document.createTextNode("Review ID: " + id.substring(0, 20) + "..\n"));
    elem.className = "greenText";
    reviewArea.appendChild(elem);
    elem = document.createElement("text");
    elem.appendChild(document.createTextNode(time + "\n\n"));
    elem.className = "greenText";
    reviewArea.appendChild(elem);
    elem = document.createElement("text");
    elem.appendChild(document.createTextNode("Keywords:  "));
    elem.style.fontWeight = "bold";
    reviewArea.appendChild(elem);
    elem = document.createElement("text");
    elem.appendChild(document.createTextNode(keywords + "\n\n"));
    elem.className = "grayText";
    reviewArea.appendChild(elem);
    elem = document.createElement("text");
    var sentences = text.split(".");
    var up = 0;
    for (var i = 0; i < sentences.length; i++) {
        up = 1;
        var words = sentences[i].split(" ");
        for (var j = 0; j < words.length; j++) {
            if (words[j] == "")
                continue;
            if (i != 0 || j != 0) {
                elem.innerHTML += " ";
            }
            var bold = 0;
            if (words[j] == words[j].toUpperCase()
                    && words[j] !== words[j].toLowerCase()) {
                bold = 1;
                words[j] = words[j].toLowerCase();
            }
            if (up == 1) {
                words[j] = words[j].charAt(0).toUpperCase() + words[j].slice(1);
                up = 0;
            }
            if (bold == 1)
                words[j] = words[j].bold();
            elem.innerHTML += words[j];
        }
        elem.innerHTML += ".";
    }
//alert(elem.innerHTML);
    elem.className = "grayText";
    elem.innerHTML += "\n\n\n";
    reviewArea.appendChild(elem);
}
function doRelatedKeys(key) {
    $.ajax({
        type: "GET",
        url: "autocomplete?action=expand", //&id=" + appIDList,
        data: {param0: key},
        //dataType: "json",
        contentType: 'application/json',
        success: function (response) {
            alert(response);
            parseMessagesRelatedKeys(response);
        }//,
        //  error: function(xhr, ajaxOptions, thrownError) { alert(xhr.responseText); }
    });
//    var url = "autocomplete?action=expand&id=" + key + ";" + appIDList;
//    //alert(url);
//    req = initRequest();
//    req.open("GET", url, true);
//    req.onreadystatechange = callbackRelatedKeys;
//    req.send(null);
}
function callbackRelatedKeys() {

    if (req.readyState == 4) {
        if (req.status == 200) {
            parseMessagesRelatedKeys(req.responseXML);
        }
    }
}

function parseMessagesRelatedKeys(responseXML) {
// no matches returned
    var row;
    if (responseXML == null) {
        return false;
    } else {
        relatedKeys = [];
        relatedKeys.push(timeWordSmall);
        var expansion = responseXML.getElementsByTagName("expansion")[0];
        if (expansion.childNodes.length > 0) {
            var cellcount = 0;
            for (var loop = 0; loop < expansion.childNodes.length; loop++) {
                var word = expansion.getElementsByTagName("word")[loop];
                cellcount++;
                //alert(word.childNodes[0].nodeValue);

                if (cellcount == 6) {
                    cellcount = 1;
                }
                if (cellcount == 1) {
                    if (isIE) {
                        relatedKeysTable.style.display = 'block';
                        row = relatedKeysTable.insertRow(relatedKeysTable.rows.length);
                    } else {
                        relatedKeysTable.style.display = 'table';
                        row = document.createElement("tr");
                    }
                    row.style.textAlign = "left";
                }
                appendRelatedKeywords(word.childNodes[0].nodeValue, row);
                if (!isIE && cellcount == 1)
                    relatedKeysTable.appendChild(row);
                //count++;
            }

        }
    }
}
function appendRelatedKeywords(key, row) {


    var cell;
    if (isIE) {
        cell = row.insertCell(0);
    } else {
        cell = document.createElement("td");
        row.appendChild(cell);
    }


    cell.style.textAlign = "left";
    cell.style.maxWidth = "115px";
    cell.style.minWidth = "115px";
    cell.style.overflow = "hidden";
    cell.style.textOverflow = "ellipsis";
    cell.style.whiteSpace = "nowrap";

    var elem = document.createElement("text");
    elem.appendChild(document.createTextNode("+"));
    elem.title = "Click to add this word to Selected Keywords";
    elem.className = "plus";
    elem.onclick = (function () {
        return function () {
            if (this.innerHTML == "+") {
                this.innerHTML = "x";
                this.className = "X";
                this.title = "Click to remove this word from Selected Keywords";
                this.style.paddingLeft = "0px";
                this.style.paddingRight = "0px";
                //document.getElementById("add-select").style.visibility = "visible";
                //relatedKeys.push(key);
                appendSelected(key, 0);
            } else {
                this.innerHTML = "+";
                this.className = "plus";
                this.title = "Click to add this word to Selected Keywords";
                doUnselected(key, 0);
//        for (var i = 0; i < relatedKeys.length; i++) {
//          if (relatedKeys[i] == key) {
//            relatedKeys.splice(i, 1);
//            //alert(relatedKeys);
//            if (relatedKeys.length == 1)
//              document.getElementById("add-select").style.visibility = "hidden";
//            return;
//          }
//        }
            }
        }
    })();
    cell.appendChild(elem);

    elem = document.createElement("text");
    elem.appendChild(document.createTextNode(" "));
    cell.appendChild(elem);

    elem = document.createElement("text");
    elem.appendChild(document.createTextNode(key));
    elem.className = "keyword";
    cell.appendChild(elem);
}

function selectAndReturn() {
    var keysLength = relatedKeys.length;
    if (keysLength == 1) {
        alert("No key selected!");
    } else {
        $.unblockUI();
        //clearSelectedAndUpdate();
        for (var i = 0; i < keysLength; i++) {
            appendSelected(relatedKeys[i], 1);
        }
        doTimeSeriesBig();
    }
}
function doExpand() {
    var packed = "";
    var items = 0;
    var rowLength = selectedTable.rows.length;
    for (var i = 0; i < rowLength; i++) {
//gets cells of current row  
        var oCells = selectedTable.rows.item(i).cells;
        //gets amount of cells of current row
        var cellLength = oCells.length;
        //loops through each cell in current row
        for (var j = 0; j < cellLength; j++) {
            items++;
            // get your cell info here
            var cellStr = oCells.item(j).childNodes[1].innerHTML;
            if (items > 1) {
                packed += ",";
            }
            packed += escape(cellStr);
        }
    }

    if (packed.length > 1) {
        $.ajax({
            type: "GET",
            url: "autocomplete?action=expand", //&id=" + appIDList,
            data: {param0: packed},
            //dataType: "json",
            contentType: 'application/json',
            success: function (response) {
                //alert(response);
                clearTableIntermediate();
                parseMessagesExpand(response);
            }//,
            //  error: function(xhr, ajaxOptions, thrownError) { alert(xhr.responseText); }
        });
//        var url = "autocomplete?action=expand&id=" + packed + ";" + appIDList;
//        //alert(url);
//        req = initRequest();
//        req.open("GET", url, true);
//        req.onreadystatechange = callbackExpand;
//        req.send(null);
    }
    else
        alert("Please select some keywords!");
    //clearSelectedAndUpdate();
}
function callbackExpand() {
    clearTableIntermediate();
    if (req.readyState == 4) {
        if (req.status == 200) {
            parseMessagesExpand(req.responseXML);
        }
    }
}

function isNumberKey(evt)
{
    var charCode = (evt.which) ? evt.which : event.keyCode
    if (charCode > 31 && (charCode < 48 || charCode > 57))
        return false;
    return true;
}
function parseMessagesExpand(responseXML) {
    intermediateResult = 1;
    document.getElementById("intermediate-title").innerHTML = "Suggested Keywords";
    // no matches returned
    var row;
    if (responseXML == null) {
        return false;
    } else {
        var expansion = responseXML.getElementsByTagName("expansion")[0];
        if (expansion.childNodes.length > 0) {
            var cellcount = 0;
            for (var loop = 0; loop < expansion.childNodes.length; loop++) {
                var word = expansion.getElementsByTagName("word")[loop];
                cellcount++;
                //alert(word.childNodes[0].nodeValue);

                if (cellcount == 4) {
                    cellcount = 1;
                }
                if (cellcount == 1) {
                    if (isIE) {
                        intermediateTable.style.display = 'block';
                        row = intermediateTable.insertRow(intermediateTable.rows.length);
                    } else {
                        intermediateTable.style.display = 'table';
                        row = document.createElement("tr");
                    }
                }

                appendRankedKeywords(word.childNodes[0].nodeValue, row, 0);
                if (!isIE && cellcount == 1)
                    intermediateTable.appendChild(row);
                //count++;
            }

        }
    }

//  
//  
//  
//  var row;
//  // no matches returned
//  if (responseXML == null) {
//    return false;
//  } else {
//    // info detail
//    var expansion = responseXML.getElementsByTagName("expansion")[0];
//    if (expansion.childNodes.length > 0) {
//      intermediateTable.setAttribute("bordercolor", "black");
//      intermediateTable.setAttribute("border", "1");
//      //alert(expansion.childNodes.length);
//      for (var i = 0; i < expansion.childNodes.length; i++) {
//        if (i % 2 == 0) {
//          if (isIE) {
//            intermediateTable.style.display = 'block';
//            row = intermediateTable.insertRow(intermediateTable.rows.length);
//          } else {
//            intermediateTable.style.display = 'table';
//            row = document.createElement("tr");
//          }
//        }
//        var word = expansion.getElementsByTagName("word")[i];
//        appendRankedKeywords(word.childNodes[0].nodeValue,row);
//        if (i % 2 == 0)
//          if (!isIE)
//            intermediateTable.appendChild(row);
//      }
//    }
//    //alert('number of loop:' + count);
//  }
}

function doCluster() {
    var packed = "";
    var items = 0;
    var rowLength = selectedTable.rows.length;
    for (var i = 0; i < rowLength; i++) {
//gets cells of current row  
        var oCells = selectedTable.rows.item(i).cells;
        //gets amount of cells of current row
        var cellLength = oCells.length;
        //loops through each cell in current row
        for (var j = 0; j < cellLength; j++) {
            items++;
            // get your cell info here
            var cellStr = oCells.item(j).childNodes[1].innerHTML;
            if (items > 1) {
                packed += ",";
            }
            packed += escape(cellStr);
        }
    }

    if (packed.length > 1) {
        $.ajax({
            type: "GET",
            url: "autocomplete?action=cluster", //&id=" + appIDList,
            data: {param0: packed},
            //dataType: "json",
            contentType: 'application/json',
            success: function (response) {
                //alert(response);
    clearTableIntermediate();
                parseMessagesCluster(response);
                //callbackCluster();
            }//,
            //  error: function(xhr, ajaxOptions, thrownError) { alert(xhr.responseText); }
        });
        //var url = "autocomplete?action=cluster&id=" + packed + ";" + appIDList;
        //alert(url);
        // req = initRequest();
        // req.open("GET", url, true);
        //  req.onreadystatechange = callbackCluster;
        //  req.send(null);
    }
    else
        alert("Please select some keywords!");
    //clearSelectedAndUpdate();
}

function callbackCluster() {
    clearTableIntermediate();
    if (req.readyState == 4) {
        if (req.status == 200) {
            parseMessagesCluster(req.responseXML);
        }
    }
}
function clearTableIntermediate() {
    if (intermediateTable.getElementsByTagName("tr").length > 0) {
        intermediateTable.style.display = 'none';
        for (var loop = intermediateTable.childNodes.length - 1; loop >= 0; loop--) {
            intermediateTable.removeChild(intermediateTable.childNodes[loop]);
        }
    }
}
function clearTableselected() {
    if (selectedTable.getElementsByTagName("tr").length > 0) {
        selectedTable.style.display = 'none';
        for (var loop = selectedTable.childNodes.length - 1; loop >= 0; loop--) {
            selectedTable.removeChild(selectedTable.childNodes[loop]);
        }
    }
}
function clusterSelection(selection, cluster) {
    if (selection == 1) {
        for (var j = 0; j < cluster.childNodes.length; j++) {
            var item = cluster.getElementsByTagName("item")[j];
            appendSelected(item.childNodes[0].nodeValue, 1);
        }
        doTimeSeriesBig();
    } else {
        for (var j = 0; j < cluster.childNodes.length; j++) {
            var item = cluster.getElementsByTagName("item")[j];
            doUnselected(item.childNodes[0].nodeValue, 1);
        }
        doTimeSeriesBig();
    }
}
function createClusterTable(num, cluster) {
    var tbl = document.createElement('table');
    tbl.style.width = '360px';
    var tr = tbl.insertRow();
    var td = tr.insertCell();
    td.style.fontSize = "1.3em";
    td.innerHTML = "C" + num;
    var elem = document.createElement("text");
    elem.appendChild(document.createTextNode("<Select All>"));
    elem.className = "quickopt";
    elem.onclick = (function () {
        return function () {
            //elem.style.color = "#c0c0bf";
            //appendSelected(key, 0);
            clusterSelection(1, cluster);
        }
    })();
    td.appendChild(elem);
    elem = document.createElement("text");
    elem.appendChild(document.createTextNode("<Unselect All>"));
    elem.className = "quickopt";
    elem.onclick = (function () {
        return function () {
            //elem.style.color = "#c0c0bf";
            //appendSelected(key, 0);
            clusterSelection(0, cluster);
        }
    })();
    td.appendChild(elem);
    tr = tbl.insertRow();
    td = tr.insertCell();
    var tbl_small = document.createElement('table');
    tbl_small.style.width = '360px';
    var tr_small = tbl_small.insertRow();
    var rowCount = 0;
    for (var j = 0; j < cluster.childNodes.length; j++) {
        rowCount++;
        var item = cluster.getElementsByTagName("item")[j];
        appendRankedKeywords(item.childNodes[0].nodeValue, tr_small, 1);
        if (rowCount == 3) {
            rowCount = 0;
            tr_small = tbl_small.insertRow();
        }
    }
    td.appendChild(tbl_small);
    var border = document.createElement("img");
    border.setAttribute("src", "images/border.png");
    border.setAttribute("height", "2");
    border.setAttribute("width", "360");
    border.setAttribute("alt", "border");
    tr = tbl.insertRow();
    td = tr.insertCell();
    td.appendChild(border);
    return tbl;
}

function parseMessagesCluster(responseXML) {

    intermediateResult = 2;
    document.getElementById("intermediate-title").innerHTML = "Clustered";
    var row;
    // no matches returnedf
    if (responseXML == null) {
        return false;
    } else {
// info detail
        var clusters = responseXML.getElementsByTagName("clusters")[0];
        if (clusters.childNodes.length > 0) {
//alert(clusters.childNodes.length);
            for (var i = 0; i < clusters.childNodes.length; i++) {
                if (isIE) {
                    intermediateTable.style.display = 'block';
                    row = intermediateTable.insertRow(intermediateTable.rows.length);
                } else {
                    intermediateTable.style.display = 'table';
                    row = document.createElement("tr");
                    intermediateTable.appendChild(row);
                }
                row.appendChild(createClusterTable(i + 1, clusters.childNodes[i]));
            }
        }
//alert('number of loop:' + count);
    }
}


function callbackRankedKeywords() {
    if (req.readyState == 4) {
        if (req.status == 200) {
            parseMessagesRankedKeywords(req.responseXML);
        }
    }
}

function parseMessagesRankedKeywords(responseXML) {
// no matches returned
    var row;
    if (responseXML == null) {
        return false;
    } else {
        rankedKeywords = [];
        var keywords = responseXML.getElementsByTagName("rankedkey")[0];
        if (keywords.childNodes.length > 0) {
            sessionID = keywords.getElementsByTagName("id")[0].childNodes[0].nodeValue;
//rankedTable.setAttribute("bordercolor", "black");
//rankedTable.setAttribute("border", "1");
//selectedTable.setAttribute("bordercolor", "black");
//selectedTable.setAttribute("border", "1");       //count = 0;
            var cellcount = 0;
            for (var loop = 0; loop < keywords.childNodes.length; loop++) {
                var key = keywords.getElementsByTagName("key")[loop];
                cellcount++;
                if (cellcount == 3) {
                    cellcount = 1;
                }
                if (cellcount == 1) {
                    if (isIE) {
                        rankedTable.style.display = 'block';
                        row = rankedTable.insertRow(rankedTable.rows.length);
                    } else {
                        rankedTable.style.display = 'table';
                        row = document.createElement("tr");
                    }
                }

                appendRankedKeywords(key.childNodes[0].nodeValue, row, 0);
                rankedKeywords.push(key.childNodes[0].nodeValue);
                if (!isIE && cellcount == 1)
                    rankedTable.appendChild(row);
                //count++;
            }
//alert('number of loop:' + count);
        }
    }
}

function searchRankedKeyword() {
    if (rankedTable.getElementsByTagName("tr").length > 0) {
        rankedTable.style.display = 'none';
        for (var loop = rankedTable.childNodes.length - 1; loop >= 0; loop--) {
            rankedTable.removeChild(rankedTable.childNodes[loop]);
        }
    }
    var searchStr = searchRankField.value;
    var cellcount = 0;
    for (var loop = 0; loop < rankedKeywords.length; loop++) {
        var key = rankedKeywords[loop]
        if (key.indexOf(searchStr) == 0) {
            cellcount++;
            if (cellcount == 4) {
                cellcount = 1;
            }
            if (cellcount == 1) {
                if (isIE) {
                    rankedTable.style.display = 'block';
                    row = rankedTable.insertRow(rankedTable.rows.length);
                } else {
                    rankedTable.style.display = 'table';
                    row = document.createElement("tr");
                }
            }

            appendRankedKeywords(key, row, 0);
            if (!isIE && cellcount == 1)
                rankedTable.appendChild(row);
            //count++;
        }
    }


}


function doDetail(key) {

    document.getElementById("key-analyzing").innerHTML = key;
    if (relatedKeysTable.getElementsByTagName("tr").length > 0) {
//relatedKeysTable.style.display = 'none';
        for (var loop = relatedKeysTable.childNodes.length - 1; loop >= 0; loop--) {
            relatedKeysTable.removeChild(relatedKeysTable.childNodes[loop]);
        }
    }
    reviewTableRelevant.innerHTML = "";
    $.blockUI({
        message: $('#divdetail'),
        css: {
            padding: 0,
            margin: 0,
            width: '90%',
            top: '5%',
            left: '5%',
            textAlign: 'center',
            color: '#000',
            border: '0px',
            backgroundColor: '#fff',
            cursor: 'auto'
        },
        onBlock: function () {

        }
    });
    $('.blockOverlay').attr('title', 'Click to unblock').click($.unblockUI);
    doTimeSeriesSmall(key);
}

function doSearchRelevantWords(key) {
    var url = "autocomplete?action=search&id=" + key + "&apps=" + appIDList + "&sort=relevancy&filter=all&search=&first=yes&secid=" + sessionID;
    //alert(url);
    req = initRequest();
    req.open("GET", url, true);
    req.onreadystatechange = callbackSearchRelevant;
    req.send(null);
}

function callbackSearchRelevant() {
    if (req.readyState == 4) {
        if (req.status == 200) {
            parseMessagesSearchRelevant(req.responseXML);
            doRelatedKeys(timeWordSmall);
        }
    }
}


function parseMessagesSearchRelevant(responseXML) {
    // no matches returned
    if (responseXML == null) {
        return false;
    } else {
        var reviews = responseXML.getElementsByTagName("rankedreviews")[0];
        var totalPage = reviews.getElementsByTagName("totalpage")[0].childNodes[0].nodeValue;
        var currentPage = reviews.getElementsByTagName("currentpage")[0].childNodes[0].nodeValue;
        if (reviews.childNodes.length > 0) {

//alert(reviews.childNodes.length);
            for (var loop = 0; loop < reviews.childNodes.length - 2; loop++) {
                var rev = reviews.getElementsByTagName("review")[loop];
                //alert(rev.childNodes.length);

                var rate = rev.getElementsByTagName("rating")[0].childNodes[0].nodeValue;
                var text = rev.getElementsByTagName("text")[0].childNodes[0].nodeValue;
                var title = rev.getElementsByTagName("title")[0].childNodes[0].nodeValue;
                var id = rev.getElementsByTagName("id")[0].childNodes[0].nodeValue;
                var time = rev.getElementsByTagName("time")[0].childNodes[0].nodeValue;
                var app = rev.getElementsByTagName("app")[0].childNodes[0].nodeValue;
                var keywords = rev.getElementsByTagName("keywords")[0].childNodes[0].nodeValue;
                appendReview(text, rate, time, id, title, app, keywords, 0, false);
                //count++;
            }
// handle paging
            var reviewArea = reviewTableRelevant;
            var start = parseInt(currentPage) - 2;
            if (start < 1)
                start = 1;
            var stop = parseInt(currentPage) + 2;
            if (stop > totalPage)
                stop = totalPage;
            //alert(start+"-"+stop+"-"+currentPage+"-"+totalPage);
            var elem;
            if (start != 1) {
                elem = document.createElement("text");
                elem.appendChild(document.createTextNode("<< "));
                elem.onclick = (function () {
                    return function () {
                        //elem.style.color = "#c0c0bf";
                        //appendSelected(key, 0);
                        changePageRelevant(1);
                    }
                })();
                elem.className = "link";
                reviewArea.appendChild(elem);

                elem = document.createElement("text");
                elem.appendChild(document.createTextNode("... "));
                elem.style.fontSize = "1.5em";
                reviewArea.appendChild(elem);
            }
            for (var i = start; i <= stop; i++) {

                elem = document.createElement("text");
                elem.appendChild(document.createTextNode(i));
                if (currentPage != i) {
                    elem.className = "link";
                    elem.onclick = (function () {
                        return function () {
                            //elem.style.color = "#c0c0bf";
                            //appendSelected(key, 0);
                            changePageRelevant(this.innerHTML);
                        }
                    })();
                } else {
                    elem.style.fontSize = "1.7em";
                }
                reviewArea.appendChild(elem);
                elem = document.createElement("text");
                elem.appendChild(document.createTextNode(" "));
                elem.style.fontSize = "1.5em";
                reviewArea.appendChild(elem);
            }
            if (stop < totalPage) {
                elem = document.createElement("text");
                elem.appendChild(document.createTextNode("... "));
                elem.style.fontSize = "1.5em";
                reviewArea.appendChild(elem);
                elem = document.createElement("text");
                elem.appendChild(document.createTextNode(">>"));
                elem.onclick = (function () {
                    return function () {
                        //elem.style.color = "#c0c0bf";
                        //appendSelected(key, 0);
                        changePageRelevant(totalPage);
                    }
                })();
                elem.className = "link";
                reviewArea.appendChild(elem);
            }
//alert('number of loop:' + count);
        } else {

            appendReview(1, 2, 3, 4, 5, 6, 7, 0, true);
        }
        makeRate();
        relevantHilitor.apply(document.getElementById("revSearchRel").value.toLowerCase());
    }
}

function changePageRelevant(val) {

//alert(sessionID);
    var url = "autocomplete?action=page&id=" + timeWordSmall + "&page=" + val
            + "&secid=" + sessionID;

    req = initRequest();
    req.open("GET", url, true);
    req.onreadystatechange = callbackSearchRelevant2;
    req.send(null);
    reviewTableRelevant.innerHTML = "";
}

function callbackSearchRelevant2() {
    if (req.readyState == 4) {
        if (req.status == 200) {
            parseMessagesSearchRelevant(req.responseXML);
        }
    }
}
function appendRankedKeywords(key, row, selected) {


    var cell;
    if (isIE) {
        cell = row.insertCell(0);
    } else {
        cell = document.createElement("td");
        row.appendChild(cell);
    }


    cell.style.textAlign = "left";
    cell.style.maxWidth = "115px";
    cell.style.minWidth = "115px";
    cell.style.overflow = "hidden";
    cell.style.textOverflow = "ellipsis";
    cell.style.whiteSpace = "nowrap";
    var elem = document.createElement("text");
    elem.appendChild(document.createTextNode("+"));
    if (selected == 1)
        elem.style.color = "#c0c0bf";
    elem.className = "plus";
    elem.title = "Click to select this word";
    elem.onclick = (function () {
        return function () {
            //elem.style.color = "#c0c0bf";
            appendSelected(key, 0);
        }
    })();

    cell.appendChild(elem);
    elem = document.createElement("text");
    elem.appendChild(document.createTextNode("   "));
    elem.style.wordWrap = "break-word";
    cell.appendChild(elem);

    cell.appendChild(elem);
    elem = document.createElement("text");
    elem.appendChild(document.createTextNode(key));
    elem.title = key + " (Click to see detail of this keyword)";
    elem.className = "keywordButton";
    elem.onclick = (function () {
        return function () {
            doDetail(key);
        }
    })();
    cell.appendChild(elem);
}

function appendSelected(key, multiple) {
    var flag = 0;
    var rowLength = selectedTable.rows.length;
    var rowindex = -1;
    //loops through rows    
    for (var i = 0; i < rowLength; i++) {
//gets cells of current row  
        var oCells = selectedTable.rows.item(i).cells;
        //gets amount of cells of current row
        var cellLength = oCells.length;
        if (cellLength < 4 && rowindex == -1) {
//alert(cellLength);
            rowindex = i;
        }
//loops through each cell in current row
        for (var j = 0; j < cellLength; j++) {
// get your cell info here
            var cellStr = oCells.item(j).childNodes[1].innerHTML;
            if (key == cellStr) {
                flag = 1;
                break;
            }
        }
    }
    if (rowindex == -1) {
        rowindex = rowLength - 1;
    }

    if (flag == 0) {
        var row;
        if (rowLength == 0) {
            if (isIE) {
                selectedTable.style.display = 'block';
                row = selectedTable.insertRow(selectedTable.rows.length);
                cellDelete = row.insertCell(0);
                cell = row.insertCell(1);
            } else {
                selectedTable.style.display = 'table';
                row = document.createElement("tr");
                selectedTable.appendChild(row);
            }
        } else {
            var oCells = selectedTable.rows.item(rowindex).cells;
            //gets amount of cells of current row
            if (oCells.length < 4) {
                row = selectedTable.rows.item(rowindex);
            } else {
                if (isIE) {
                    selectedTable.style.display = 'block';
                    row = selectedTable.insertRow(selectedTable.rows.length);
                    cellDelete = row.insertCell(0);
                    cell = row.insertCell(1);
                } else {
                    selectedTable.style.display = 'table';
                    row = document.createElement("tr");
                    selectedTable.appendChild(row);
                }
            }
        }
        var cell;
        if (isIE) {
            cell = row.insertCell(0);
        } else {
            cellDelete = document.createElement("td");
            cell = document.createElement("td");
            row.appendChild(cell);
        }

        cell.style.textAlign = "left";
        cell.style.maxWidth = "120px";
        cell.style.minWidth = "120px";
        cell.style.overflow = "hidden";
        cell.style.textOverflow = "ellipsis";
        cell.style.whiteSpace = "nowrap";
        var elem = document.createElement("text");
        elem.appendChild(document.createTextNode("x"));
        elem.title = "Click to unselect this keyword";
        elem.className = "X";
        elem.onclick = (function () {
            return function () {
                doUnselected(key, 0);
            }
        })();
        cell.appendChild(elem);
        elem = document.createElement("text");
        elem.appendChild(document.createTextNode(key));
        elem.className = "keyword";
        cell.appendChild(elem);
    }

    updateKeyword(key, 1);
    if (multiple == 0)
        doTimeSeriesBig();
}

function doUnselected(key, multiple) {
// no matches returned
// info detail
//selectedTable.setAttribute("bordercolor", "black");
//selectedTable.setAttribute("border", "1");
    var rowLength = selectedTable.rows.length;
    for (var i = 0; i < rowLength; i++) {
//gets cells of current row  
        var oCells = selectedTable.rows.item(i).cells;
        //gets amount of cells of current row
        var cellLength = oCells.length;
        //loops through each cell in current row
        for (var j = 0; j < cellLength; j++) {
// get your cell info here
            var cellStr = oCells.item(j).childNodes[1].innerHTML;
            if (key == cellStr) {
                selectedTable.rows.item(i).deleteCell(j);
                if (selectedTable.rows.item(i).cells.length == 0)
                    selectedTable.removeChild(selectedTable.rows.item(i));
                updateKeyword(key, 0);
                break;
            }
        }
    }
//
    var cells = [];
    for (var i = 0; i < rowLength; i++) {
//gets cells of current row  
        var oCells = selectedTable.rows.item(i).cells;
        //gets amount of cells of current row
        var cellLength = oCells.length;
        //loops through each cell in current row
        for (var j = 0; j < cellLength; j++) {
// get your cell info here
            var cellStr = oCells.item(j).childNodes[1].innerHTML;
            cells.push(cellStr);
            //selectedTable.rows.item(i).deleteCell(j);
        }
    }

    clearTableselected();
    for (var i = 0; i < cells.length; i++) {
        appendSelected(cells[i], 1);
    }
    if (multiple == 0)
        doTimeSeriesBig();


}

function updateKeyword(key, selected) {
    var col = "#0025ff"; // blue
    if (selected == 1)
        col = "#c0c0bf"; // gray
    var done = 0;
    //   cell.childNodes[0].style.color = .;
    var rowLength = rankedTable.rows.length;
    //loops through rows    
    for (var i = 0; i < rowLength; i++) {
//gets cells of current row  
        var oCells = rankedTable.rows.item(i).cells;
        //gets amount of cells of current row
        var cellLength = oCells.length;
        //loops through each cell in current row
        for (var j = 0; j < cellLength; j++) {
// get your cell info here
            var cellStr = oCells.item(j).childNodes[2].innerHTML;
            if (key == cellStr) {
                oCells.item(j).childNodes[0].style.color = col;
                done = 1;
                break;
            }
        }
        if (done == 1)
            break;
    }

    done = 0;
    if (intermediateResult == 1) { // append
        rowLength = intermediateTable.rows.length;
        //loops through rows    
        for (var i = 0; i < rowLength; i++) {
//gets cells of current row  
            var oCells = intermediateTable.rows.item(i).cells;
            //gets amount of cells of current row
            var cellLength = oCells.length;
            //loops through each cell in current row
            for (var j = 0; j < cellLength; j++) {
// get your cell info here
                var cellStr = oCells.item(j).childNodes[2].innerHTML;
                if (key == cellStr) {
                    oCells.item(j).childNodes[0].style.color = col;
                    done = 1;
                    break;
                }
            }
            if (done == 1)
                break;
        }
    }

    done = 0;
    if (intermediateResult == 2) { //cluster
//loops through rows    
        for (var i = 0; i < intermediateTable.rows.length; i++) {
            var row = intermediateTable.rows.item(i);
            var dataCell = row.childNodes[0].rows.item(1);
            var otable = dataCell.childNodes[0].childNodes[0]; // because of tbody
            //alert(otable.innerHTML);
            //alert(otable.rows.length);
            for (var r = 0; r < otable.rows.length; r++) {
                var oCells = otable.rows.item(r).cells;
                //loops through each cell in current row
                for (var j = 0; j < oCells.length; j++) {
// get your cell info here
                    var cellStr = oCells.item(j).childNodes[2].innerHTML;
                    //alert(cellStr);
                    if (key == cellStr) {
                        oCells.item(j).childNodes[0].style.color = col;
                        done = 1;
                        break;
                    }
                }
                if (done == 1)
                    break;
            }
            if (done == 1)
                break;
        }
    }
}