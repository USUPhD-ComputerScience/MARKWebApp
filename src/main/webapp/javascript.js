var req;
var isIE;
var completeField;
var completeTable;
var detailTable;
var selectedTable;
var logo;
var layoutFinal;
var appsData = [];
//var autoRow;

function init() {
  completeField = document.getElementById("complete-field");
  completeTable = document.getElementById("complete-table");
  detailTable = document.getElementById("detail-table");
  selectedTable = document.getElementById("selected-table");
  document.getElementById("analyze-button").style.visibility = 'hidden';
  layoutFinal = 0;
  var is_Safari = navigator.sayswho.indexOf("Safari");
  var is_Chrome = navigator.sayswho.indexOf("Chrome");
  if ( is_Chrome == -1 && is_Safari == -1) {
    alert("Sorry, the current version of MARK only fully support Google Chrome and Safari.\nPlease use Google Chrome or Safari to access to our tool!");
    window.location = "http://useal.cs.usu.edu/mark/";
  }

  $('html').bind('keypress', function (e)
  {
    if (e.keyCode == 13)
    {
      return false;
    }
  });
}
navigator.sayswho = (function () {
  var ua = navigator.userAgent, tem,
          M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
  if (/trident/i.test(M[1])) {
    tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
    return 'IE ' + (tem[1] || '');
  }
  if (M[1] === 'Chrome') {
    tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
    if (tem != null)
      return tem.slice(1).join(' ').replace('OPR', 'Opera');
  }
  M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
  if ((tem = ua.match(/version\/(\d+)/i)) != null)
    M.splice(1, 1, tem[1]);
  return M.join(' ');
})();
function initSelected() {
  var row;
  var td;
  if (isIE) {
    selectedTable.style.display = 'block';
    row = selectedTable.insertRow(selectedTable.rows.length);
    td = row.insertCell(0);
  } else {
    selectedTable.style.display = 'table';
    row = document.createElement("tr");
    td = document.createElement("td");
    row.appendChild(td);
    selectedTable.appendChild(row);
  }
  td.id = "appSelection";
  td.className = "left";
  td.style.whiteSpace = "pre-wrap";
  td.style.wordWrap = "break-word";
  var elem = document.createElement("text");
  elem.appendChild(document.createTextNode("App sellection"));
  elem.className = "appSelection";
  elem.id = "AppSelText";
  elem.style.visibility = 'hidden';
  td.appendChild(elem);
  selectedTable.style.visibility = 'hidden';
}


function changeLayout() {
  layoutFinal = 1;
  var mainLayout = document.getElementById("main-layout");
  //mainLayout.style.textAlign = "left";
  mainLayout.style.marginLeft = "0px";
  var mainTilte = document.getElementById("title-main");
  var imgTitle = document.getElementById("img-title");
  mainTilte.removeChild(imgTitle);
  var tdSearch = document.getElementById("search-td");
  var allApp = document.getElementById("all-app");
  tdSearch.removeChild(allApp);
  //topDiv.appendChild(mainSearch);
  var elem = document.createElement("img");
  elem.setAttribute("src", "images/MARK.png");
  elem.setAttribute("height", "40");
  elem.setAttribute("width", "200");
  elem.setAttribute("alt", "MARK");
  document.getElementById("MARK").appendChild(elem);
  document.getElementById("for-search").appendChild(document.getElementById("search-main"));
  initSelected();
//  document.getElementById("footer").style.position = "relative";
//  document.getElementById("footer").style.bottom = "0px";
}

function changePage() {
  var rowLength = selectedTable.rows.length;
  //loops through rows  
  var packed = "";
  for (var i = 0; i < rowLength; i++) {
//gets cells of current row  
    var oCells = selectedTable.rows.item(i).cells;
    //gets amount of cells of current row
    var cellLength = oCells.length;
    //loops through each cell in current row
    for (var j = 0; j < cellLength; j++) {
// get your cell info here
      var cellVal = oCells.item(j).id.substring(4);
      if (cellVal == "election")
        continue;
      var cellStr = oCells.item(j).childNodes[1].innerHTML;
      if (i > 1)
        packed += ",";
      packed += escape(cellVal) + "+" + escape(cellStr);
    }
  }
  if (packed.length > 1)
   // window.location = "initanalysis.jsp?" + packed;
       window.location = "initanalysis.jsp?" + packed;
  else
    alert("Please select some apps!");
  //alert(values);
//  if (values.length > 0) {
//    window.location = "composer.jsp";
//  } else {
//    alert("Please select some apps!");
//  }
}

function doAllApp() {

  if (layoutFinal == 0)
    changeLayout();
  var url = "autocomplete?action=complete&id=" + escape("all");
  req = initRequest();
  req.open("GET", url, true);
  req.onreadystatechange = callbackCompletion;
  req.send(null);
  $.blockUI({message: '<h1>Loading Data..</h1>',
    css: {
      border: 'none',
      padding: '15px',
      backgroundColor: '#0099CC',
      '-webkit-border-radius': '10px',
      '-moz-border-radius': '10px',
      opacity: .5,
      color: '#fff'
    }});
}



function doCompletion() {
  if (layoutFinal == 0) {
    changeLayout();
    var url = "autocomplete?action=all&id=all";
    req = initRequest();
    req.open("GET", url, true);
    req.onreadystatechange = callbackCompletion;
    req.send(null);
    $.blockUI({message: '<h1>Loading Data..</h1>',
      css: {
        border: 'none',
        padding: '15px',
        backgroundColor: '#000',
        '-webkit-border-radius': '10px',
        '-moz-border-radius': '10px',
        opacity: .5,
        color: '#fff'
      }});
  } else {
    clearTableCompletion();
    var searchStr = completeField.value;
    var appCount = 0;
    for (var loop = 0; loop < appsData.length; loop++) {
      var app = appsData[loop];
      var appName = app.getElementsByTagName("appName")[0].childNodes[0].nodeValue;
      if (appName.toLowerCase().search(searchStr) == 0) {
        var appID = app.getElementsByTagName("appID")[0].childNodes[0].nodeValue;
        var appDBCount = app.getElementsByTagName("appDBCount")[0].childNodes[0].nodeValue;
        var appStart = app.getElementsByTagName("appStart")[0].childNodes[0].nodeValue;
        var appEnd = app.getElementsByTagName("appEnd")[0].childNodes[0].nodeValue;
        var rate = app.getElementsByTagName("rate")[0].childNodes[0].nodeValue;
        var exampleKeys = app.getElementsByTagName("exampleKeys")[0].childNodes[0].nodeValue;
        appendCompletion(appID, appName, appDBCount, appStart, appEnd, rate, exampleKeys);
        appCount++;
        //count++;
      }
    }
    if (appCount == 0) {
      showNoResult();
    }


    makeRate();
  }
}

function showNoResult() {
  var row;
  var td;
  if (isIE) {
    completeTable.style.display = 'block';
    row = completeTable.insertRow(completeTable.rows.length);
    td = row.insertCell(0);
  } else {
    completeTable.style.display = 'table';
    row = document.createElement("tr");
    td = document.createElement("td");
    row.appendChild(td);
    completeTable.appendChild(row);
  }
  td.className = "left";
  td.style.whiteSpace = "pre-wrap";
  //td.className = "detail";
  td.style.wordWrap = "break-word";
  var elem = document.createElement("text");
  elem.appendChild(document.createTextNode("No result for your search!"));
  elem.style.fontSize = "1.4em";
  td.appendChild(elem);
}
function doAll() {
  if (layoutFinal == 0)
    changeLayout();
  var url = "autocomplete?action=all&id=all";
  req = initRequest();
  req.open("GET", url, true);
  req.onreadystatechange = callbackCompletion;
  req.send(null);
  $.blockUI({message: '<h1>Loading Data..</h1>',
    css: {
      border: 'none',
      padding: '15px',
      backgroundColor: '#000',
      '-webkit-border-radius': '10px',
      '-moz-border-radius': '10px',
      opacity: .5,
      color: '#fff'
    }});
}


function doDetailing(appid) {
//alert(appid);
  var url = "autocomplete?action=lookup&id=" + appid;
  req = initRequest();
  req.open("GET", url, true);
  req.onreadystatechange = callbackDetail;
  req.send(null);
}
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
function callbackCompletion() {

  if (req.readyState == 4) {
    if (req.status == 200) {
      clearTableCompletion();
      $.unblockUI();
      //alert(1);
      parseMessagesCompletion(req.responseXML);
    }
  }
}

function callbackDetail() {
  clearTableDetail();
  if (req.readyState == 4) {
    if (req.status == 200) {
      parseMessagesDetail(req.responseXML);
    }
  }
}



function appendAppInfo(info) {

  var row;
  var cell;
  //var element;
  // Name
  if (isIE) {
    detailTable.style.display = 'block';
    row = detailTable.insertRow(detailTable.rows.length);
    cell = row.insertCell(0);
  } else {
    detailTable.style.display = 'table';
    row = document.createElement("tr");
    cell = document.createElement("td");
    row.appendChild(cell);
    detailTable.appendChild(row);
  }

  cell.className = "infoCell";
  //cell.appendChild(document.createTextNode(info));

  //cell.onFocus("doDetailing("+appID+")");
  //element = document.createElement("a");
  //element.className = "popupItem";
  //element.appendChild();
  cell.appendChild(document.createTextNode(info));
}
function appendCompletion(appID, appName, appDBCount, appStart, appEnd, rate, exampleKeys) {
  var border = document.createElement("img");
  border.setAttribute("src", "images/border.png");
  border.setAttribute("height", "2");
  border.setAttribute("width", "500");
  border.setAttribute("alt", "border");
  var dropdown = document.createElement("img");
  dropdown.setAttribute("src", "images/dropdown.png");
  dropdown.setAttribute("height", "10");
  dropdown.setAttribute("width", "20");
  dropdown.setAttribute("alt", "dropdown");
  dropdown.className = "dropdownbutt";
  dropdown.onclick = (function () {
    return function () {
      toggleDetail(appID, appName, appDBCount, appStart,
              appEnd, rate, exampleKeys, 1);
    }
  })();
  var row;
  var td;
  if (isIE) {
    completeTable.style.display = 'block';
    row = completeTable.insertRow(completeTable.rows.length);
    td = row.insertCell(0);
  } else {
    completeTable.style.display = 'table';
    row = document.createElement("tr");
    td = document.createElement("td");
    row.appendChild(td);
    completeTable.appendChild(row);
  }

//cell.className = "popupCell";
//cell.onFocus("doDetailing("+appID+")");
//cell.setAttribute('onmouseover', 'doDetailing("' + appID + '")');
//cell.setAttribute('onclick', 'doSelected("' + appID + '")');
//cell.appendChild(tbl);
  td.className = "left";
  td.style.whiteSpace = "pre-wrap";
  //td.className = "detail";
  td.style.wordWrap = "break-word";
  var elem = document.createElement("text");
  elem.appendChild(document.createTextNode(appName + "  "));
  elem.className = "appName";
  elem.onclick = (function () {
    return function () {
      appendSelected(appID, appName);
    }
  })();
  td.appendChild(elem);
  td.appendChild(dropdown);
  elem = document.createElement("text");
  elem.appendChild(document.createTextNode(" " + rate + " "));
  elem.className = "appRate";
  td.appendChild(elem);
//<span class="stars">2.4618164</span>
  elem = document.createElement("span");
  elem.className = "stars";
  elem.innerHTML = rate;
  td.appendChild(elem);
  elem = document.createElement("text");
  elem.appendChild(document.createTextNode(" " + appDBCount + " reviews\n"));
  elem.className = "grayText";
  td.appendChild(elem);
  var a = document.createElement('a');
  a.setAttribute('href', "https://play.google.com/store/apps/details?id=" + appID);
  a.innerHTML = "https://play.google.com/store/apps/details?id=" + appID;
  td.appendChild(a);
  elem = document.createElement("text");
  elem.appendChild(document.createTextNode("\n<No description in database>"));
  elem.className = "grayText";
  td.appendChild(elem);
  elem = document.createElement("text");
  elem.appendChild(document.createTextNode("\n\n"));
  td.appendChild(elem);
  td.appendChild(border);
  elem = document.createElement("text");
  elem.appendChild(document.createTextNode("\n\n"));
  td.appendChild(elem);
  td.id = appID;
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

function toggleDetail(appID, appName, appDBCount, appStart, appEnd, rate, exampleKeys, down) {
  var border = document.createElement("img");
  border.setAttribute("src", "images/border.png");
  border.setAttribute("height", "2");
  border.setAttribute("width", "500");
  border.setAttribute("alt", "border");
  var dropdown = document.createElement("img");
  dropdown.setAttribute("height", "10");
  dropdown.setAttribute("width", "20");
  dropdown.setAttribute("alt", "dropdown");
  dropdown.className = "dropdownbutt";
  if (down == 1) {
    dropdown.setAttribute("src", "images/dropup.png");
    dropdown.onclick = (function () {
      return function () {
        toggleDetail(appID, appName, appDBCount, appStart,
                appEnd, rate, exampleKeys, 0);
      }
    })();
  } else {
    dropdown.setAttribute("src", "images/dropdown.png");
    dropdown.onclick = (function () {
      return function () {
        toggleDetail(appID, appName, appDBCount, appStart,
                appEnd, rate, exampleKeys, 1);
      }
    })();
  }

  var td = document.getElementById(appID);
  if (down == 1) {
    td.removeChild(td.childNodes[7]);
    td.removeChild(td.childNodes[7]);
    td.removeChild(td.childNodes[7]);
    var bold = document.createElement("b");
    bold.appendChild(document.createTextNode("\n\nMost relevant keywords: "));
    td.appendChild(bold);
    elem = document.createElement("text");
    elem.appendChild(document.createTextNode(exampleKeys + "\n\n"));
    elem.className = "grayText";
    td.appendChild(elem);
    bold = document.createElement("b");
    bold.appendChild(document.createTextNode("Identifier: "));
    td.appendChild(bold);
    elem = document.createElement("text");
    elem.appendChild(document.createTextNode(appID + "\n"));
    elem.className = "grayText";
    td.appendChild(elem);
    bold = document.createElement("b");
    bold.appendChild(document.createTextNode("Review collected: "));
    td.appendChild(bold);
    elem = document.createElement("text");
    elem.appendChild(document.createTextNode(appDBCount + "\n"));
    elem.className = "grayText";
    td.appendChild(elem);
    bold = document.createElement("b");
    bold.appendChild(document.createTextNode("Collection period: "));
    td.appendChild(bold);
    elem = document.createElement("text");
    elem.appendChild(document.createTextNode(appStart + " to " +
            appEnd));
    elem.className = "grayText";
    td.appendChild(elem);
  } else {
    td.removeChild(td.childNodes[7]);
    td.removeChild(td.childNodes[7]);
    td.removeChild(td.childNodes[7]);
    td.removeChild(td.childNodes[7]);
    td.removeChild(td.childNodes[7]);
    td.removeChild(td.childNodes[7]);
    td.removeChild(td.childNodes[7]);
    td.removeChild(td.childNodes[7]);
    td.removeChild(td.childNodes[7]);
    td.removeChild(td.childNodes[7]);
    td.removeChild(td.childNodes[7]);
  }

  elem = document.createElement("text");
  elem.appendChild(document.createTextNode("\n\n"));
  td.appendChild(elem);
  td.appendChild(border);
  elem = document.createElement("text");
  elem.appendChild(document.createTextNode("\n\n"));
  td.appendChild(elem);
  td.id = appID;
  td.replaceChild(dropdown, td.childNodes[1]);
  //makeRate();
}

function appendSelected(appID, appName) {


  var rowLength = selectedTable.rows.length;
  selectedTable.style.visibility = 'visible';
  document.getElementById("analyze-button").style.visibility = 'visible';
  document.getElementById("AppSelText").style.visibility = 'visible';

  var checker = 0;
  //loops through rows    
  for (var i = 0; i < rowLength; i++) {
//gets cells of current row  
    var oCells = selectedTable.rows.item(i).cells;
    //gets amount of cells of current row
    var cellLength = oCells.length;
    //loops through each cell in current row
    for (var j = 0; j < cellLength; j++) {
// get your cell info here
      var cellVal = oCells.item(j).id.substring(4);
      if (appID == cellVal) {
//alert(cellVal + " is already selected");
        checker = 1;
      }
    }
  }
  if (checker == 1)
    return;
  var row;
  var td;
  if (isIE) {
    selectedTable.style.display = 'block';
    row = selectedTable.insertRow(selectedTable.rows.length);
    td = row.insertCell(0);
  } else {
    selectedTable.style.display = 'table';
    row = document.createElement("tr");
    td = document.createElement("td");
    row.appendChild(td);
    selectedTable.appendChild(row);
  }
  td.id = "sel-" + appID;
  td.className = "left";
  td.style.whiteSpace = "pre-wrap";
  td.style.wordWrap = "break-word";
  var elem = document.createElement("text");
  elem.appendChild(document.createTextNode("x  "));
  elem.className = "X";
  elem.setAttribute('onclick', 'doUnselected("' + appID + '")');
  td.appendChild(elem);
  elem = document.createElement("text");
  elem.appendChild(document.createTextNode(appName));
  elem.className = "selected";
  td.appendChild(elem);
}

function doUnselected(appID) {
  var rowLength = selectedTable.rows.length;
  if (rowLength == 2) {
//clearTableUnselected();
    selectedTable.style.visibility = 'hidden';
    document.getElementById("analyze-button").style.visibility = 'hidden';
    document.getElementById("AppSelText").style.visibility = 'hidden';
    //return;
  }
//loops through rows    
//var values = [];
  for (var i = 0; i < rowLength; i++) {
//gets cells of current row  
    var oCells = selectedTable.rows.item(i).cells;
    //gets amount of cells of current row
    var cellLength = oCells.length;
    //loops through each cell in current row
    for (var j = 0; j < cellLength; j++) {
// get your cell info here
      var cellVal = oCells.item(j).id.substring(4);
      if (appID == cellVal) {
        selectedTable.deleteRow(i);
      }
    }
  }
}

function clearTableCompletion() {
  if (completeTable.getElementsByTagName("tr").length > 0) {
    completeTable.style.display = 'none';
    for (var loop = completeTable.childNodes.length - 1; loop >= 0; loop--) {
      completeTable.removeChild(completeTable.childNodes[loop]);
    }
  }

}
function clearTableUnselected() {
  if (selectedTable.getElementsByTagName("tr").length > 0) {
    selectedTable.style.display = 'none';
    for (var loop = selectedTable.childNodes.length - 1; loop >= 0; loop--) {
      selectedTable.removeChild(selectedTable.childNodes[loop]);
    }
  }
}
function clearTableDetail() {
  if (detailTable.getElementsByTagName("tr").length > 0) {
    detailTable.style.display = 'none';
    for (var loop = detailTable.childNodes.length - 1; loop >= 0; loop--) {
      detailTable.removeChild(detailTable.childNodes[loop]);
    }
  }
}

function getElementY(element) {
  var targetTop = 0;
  if (element.offsetParent) {
    while (element.offsetParent) {
      targetTop += element.offsetTop;
      element = element.offsetParent;
    }
  } else if (element.y) {
    targetTop += element.y;
  }
  return targetTop;
}





function parseMessagesSelected(responseXML) {

// no matches returned
  if (responseXML == null) {
    return false;
  } else {
// info detail
    var appInfo = responseXML.getElementsByTagName("appinfo")[0];
    if (appInfo.childNodes.length > 0) {
      selectedTable.setAttribute("bordercolor", "black");
      selectedTable.setAttribute("border", "1");
      for (var loop = 0; loop < appInfo.childNodes.length; loop++) {
        var app = appInfo.childNodes[loop];
        var appName = app.getElementsByTagName("appName")[0];
        var appID = app.getElementsByTagName("appID")[0];
        //gets rows of table
        var rowLength = selectedTable.rows.length;
        var checker = 0;
        //loops through rows    
        for (var i = 0; i < rowLength; i++) {
//gets cells of current row  
          var oCells = selectedTable.rows.item(i).cells;
          //gets amount of cells of current row
          var cellLength = oCells.length;
          //loops through each cell in current row
          for (var j = 0; j < cellLength; j++) {
// get your cell info here
            var cellVal = oCells.item(j).innerHTML;
            if (appID.childNodes[0].nodeValue == cellVal) {
//alert(cellVal + " is already selected");
              checker = 1;
            }
          }
        }
        if (checker == 0)
          appendSelected(appID.childNodes[0].nodeValue);
      }
//alert('number of loop:' + count);
    }
  }
}

function parseMessagesCompletion(responseXML) {

//alert(responseXML);
// no matches returned
  if (responseXML == null) {

    return false;
  } else {

    appsData = [];
    var apps = responseXML.getElementsByTagName("apps")[0];
    if (apps.childNodes.length > 0) {
//completeTable.setAttribute("bordercolor", "black");
//completeTable.setAttribute("border", "1");
      var count = 0;

      var searchStr = completeField.value;
      for (var loop = 0; loop < apps.childNodes.length; loop++) {
        var app = apps.childNodes[loop];
        var appName = app.getElementsByTagName("appName")[0].childNodes[0].nodeValue;

        if (appName.toLowerCase().search(searchStr) == 0) {
          var appID = app.getElementsByTagName("appID")[0].childNodes[0].nodeValue;
          var appDBCount = app.getElementsByTagName("appDBCount")[0].childNodes[0].nodeValue;
          var appStart = app.getElementsByTagName("appStart")[0].childNodes[0].nodeValue;
          var appEnd = app.getElementsByTagName("appEnd")[0].childNodes[0].nodeValue;
          var rate = app.getElementsByTagName("rate")[0].childNodes[0].nodeValue;
          var exampleKeys = app.getElementsByTagName("exampleKeys")[0].childNodes[0].nodeValue;
          appendCompletion(appID, appName, appDBCount, appStart, appEnd, rate, exampleKeys);
          count++;
        }
        appsData.push(app);
        //
      }

      if (count == 0) {
        showNoResult();
      }
      makeRate();
      //alert('number of loop:' + count);
    }
  }
}
function parseMessagesDetail(responseXML) {

// no matches returned
  if (responseXML == null) {
    return false;
  } else {


// info detail
    var appInfo = responseXML.getElementsByTagName("appinfo")[0];
    if (appInfo.childNodes.length > 0) {
      detailTable.setAttribute("bordercolor", "black");
      detailTable.setAttribute("border", "0");
      for (var loop = 0; loop < appInfo.childNodes.length; loop++) {
        var app = appInfo.childNodes[loop];
        var appName = app.getElementsByTagName("appName")[0];
        var appID = app.getElementsByTagName("appID")[0];
        var appDBCount = app.getElementsByTagName("appDBCount")[0];
        var appStart = app.getElementsByTagName("appStart")[0];
        var appEnd = app.getElementsByTagName("appEnd")[0];
        appendAppInfo(appName.childNodes[0].nodeValue);
        appendAppInfo("ID: " + appID.childNodes[0].nodeValue);
        appendAppInfo("Collected " + appDBCount.childNodes[0].nodeValue + " reviews");
        appendAppInfo("From: " + appStart.childNodes[0].nodeValue);
        appendAppInfo("To: " + appEnd.childNodes[0].nodeValue);
      }
//alert('number of loop:' + count);
    }
  }
}

