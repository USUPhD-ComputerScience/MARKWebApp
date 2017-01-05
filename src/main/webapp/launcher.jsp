<%-- 
    Document   : index
    Created on : May 24, 2015, 10:34:35 PM
    Author     : Phong
--%>

<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
  <head>

    <link href='http://fonts.googleapis.com/css?family=PT+Sans' rel='stylesheet' type='text/css'>

    <!-- latest jQuery direct from google's CDN -->
    <script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min.js"></script>

    <script src="blockUI/jquery.blockUI.js" type="text/javascript"></script>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <title>M.A.R.K USUSeal</title>

    <script type="text/javascript" src="javascript.js"></script>
    <link rel="stylesheet" type="text/css" href="stylesheet.css">

  </head>
  <body onload="init()" >


    <div id="top-div" class="topDiv">
      <table border="0">
        <tr style="text-align: left">
          <td id="MARK"></td>
          <td id="for-search"></td>
          <td style="text-align: right; width: 100%">
            <text style="font-size: 0.8em">© USEAL Lab - Computer Science Department, Utah State University.</text>
            <img src="images/computer_science_logo.png" width="200" height="50" alt="computer_science_logo"/>
          </td>
        </tr>
      </table>



    </div>
    <div class="wrapper">
      <table id="main-layout" border = "0" class ="first">
      <tr >
        <th colspan="2" id="title-main">

          <img id="img-title" src="images/title1stpage.png" width="820" height="92" alt="title1stpage"
               style="margin-top: 200px"/>
        </th>
      </tr>
      <tr>
        <td colspan="2" id = "search-td">
          <form id="search-main" name="autofillform" action="autocomplete">

            <input class = "search" type="text" 
                   id="complete-field"
                   onkeyup="doCompletion()">

          </form>
          <input class="button" id ="all-app"  type="submit" value="All apps!" onclick="doAll()"/>
        </td>
      </tr>
      <tr>
        <td style = "
            min-width: 50%;
            max-width: 50%;">
          <table id="complete-table">
          </table>

        </td>
        <td style = "
            min-width: 40%; vertical-align: top; text-align: left">
          <table  style="position: fixed;">
            <tr>
              <td>
                <table id="selected-table" class="general" style=" border: 2px solid #E5E4D7;">
                </table>
              </td>
            </tr>
            <tr>
              <td style = "text-align: right">
                <input id="analyze-button" class="button" type="submit" value="Analyze" onclick="changePage()" style="visibility: hidden"/>   
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    </div>
    
    <script>
      (function (i, s, o, g, r, a, m) {
        i['GoogleAnalyticsObject'] = r;
        i[r] = i[r] || function () {
          (i[r].q = i[r].q || []).push(arguments)
        }, i[r].l = 1 * new Date();
        a = s.createElement(o),
                m = s.getElementsByTagName(o)[0];
        a.async = 1;
        a.src = g;
        m.parentNode.insertBefore(a, m)
      })(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');

      ga('create', 'UA-65645284-1', 'auto');
      ga('send', 'pageview');

    </script>
  </body>
</html>
