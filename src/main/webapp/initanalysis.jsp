<%-- 
    Document   : initanalysis
    Created on : Jul 6, 2015, 2:04:21 PM
    Author     : Phong
--%>

<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>

  <head>

    <script src="amcharts/amcharts.js" type="text/javascript"></script>
    <script src="amcharts/serial.js" type="text/javascript"></script>
    <script type="text/javascript" src="hilitor/hilitor.js"></script>
    <link href='http://fonts.googleapis.com/css?family=PT+Sans' rel='stylesheet' type='text/css'>
    <!-- this cssfile can be found in the jScrollPane package -->
    <link rel="stylesheet" type="text/css" href="jquery.jscrollpane.css" />

    <!-- latest jQuery direct from google's CDN -->
    <script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min.js"></script>
    <script src="blockUI/jquery.blockUI.js" type="text/javascript"></script>
    <!-- the jScrollPane script -->
    <script type="text/javascript" src="jquery.jscrollpane.min.js"></script>

    <!--instantiate after some browser sniffing to rule out webkit browsers-->

    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <title>General Analyses</title>

    <script type="text/javascript" src="initAnalysisJS.js"></script>
    <link rel="stylesheet" type="text/css" href="stylesheet.css">

  </head>
  <body onload="init()">

    <script type="text/javascript">

      $(document).keyup(function (e) {
        if (e.keyCode == 27) { // escape key maps to keycode `27`
          exitBlock();
        }
      });

    </script>
    <div id="top-div" class="topDiv">
      <table border="0">
        <tr>
          <td id="MARK"><img src="images/MARK.png" width="200" height="40" alt="MARK"/>
          </td>
          <td id="title-main" style="text-align: left; width: 40%">
            <text class ="generalAnalyses">General Analyses</text>
            </br>
            <text class = "appNames" id="appNames">Apps Names</text>            
          </td>
          <td style="text-align: right; width: 100%">
            <text style="font-size: 0.8em">© USEAL Lab - Computer Science Department, Utah State University.</text>
            <img src="images/computer_science_logo.png" width="200" height="50" alt="computer_science_logo"/>
          </td>
        </tr>
      </table>
    </div>
    <div class="wrapper">
      <table style="margin-top: 50px; max-width: 100%; min-width: 100%">
        <tr>
          <th style="text-align: left; vertical-align: top; min-width: 30%">
        <table border="0" class="general" style=" min-width: 100%" >
          <thead>
            <tr>
              <td style="text-align: left">
                <text class ="generalTitle" style="padding-left: 0px">Ranked Keywords</text>
              </td>
            </tr>
            <tr>
              <td>
                <input class = "search" style=" min-width: 100%; max-width: 100%;
                       " type="text" id="search-rank" onkeyup="searchRankedKeyword()">
              </td>
            </tr>
            <tr>
              <td>
                <div class = "listEnhance"  style=" min-width: 100%;  margin-bottom: 30px">
                  <%--   Table for ranked keywords --%>       
                  <table id="ranked-table" >    
                  </table>
                </div>
              </td>
            </tr>
        </table>
        </th>
        <th style="text-align: center; vertical-align: top">
        <table border="0" style=" margin-left: auto; margin-right: auto;" >
          <tr>
            <td> 
              <table border="0" class="general" style="width: 100%;">
                <thead>
                  <tr>
                    <td style="text-align: left">
                      <text class ="generalTitle" style="margin-left: 0px">Selected Keywords</text>
                    </td>
                  </tr>
                  <tr >
                    <td style="vertical-align: middle; text-align: right">
                      <text style="font-size: 1.4em">Select top keywords:</text>
                      <input class = "search" onkeypress="return isNumberKey(event)" 
                             style=" min-width: 15%;max-width: 15%; margin-left:30px;
                             margin-right:10px;" type="text" id="top-selection">

                      <input class="button" type="submit" value="Select" 
                             onclick="customTopSelection()" style="  width: 108px; 
                             margin-left:10px; margin-right:5%;"
                             data-toggle="tooltip" title="Select N most relevant keywords"/>
                    </td>

                  </tr>
                  <tr>
                    <td>
                      <div class = "listEnhance"  style=" min-width: 95%;
                           max-width: 95%; max-height: 230px; min-height: 230px; 
                           margin-right:5%; margin-bottom: 20px">
                        <table id="selected-table" >    
                        </table>
                      </div>
                    </td>
                  </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="text-align: right">
              <input class="button" type="submit" value="Clear" 
                     onclick="interfaceClearSelected(0)" style="  width: 70px; 
                     margin-right:10px; 
                     margin-bottom: 10px; margin-top: 10px"
                     data-toggle="tooltip" title="Remove all selected words"/>
              <input class="button" type="submit" value="Cluster" 
                     onclick="doCluster()" style="  width: 80px; 
                     margin-right:10px; 
                     margin-bottom: 10px; margin-top: 10px"
                     data-toggle="tooltip" title="Cluster selected words"/>
              <input class="button" type="submit" value="Suggest More" 
                     onclick="doExpand()" style="  width: 130px; 
                     margin-right:10px; 
                     margin-bottom: 10px; margin-top: 10px"
                     data-toggle="tooltip" title="Suggest some more words"/>
              <input class="button" id="revbutt" type="submit" value="Relevant reviews" 
                     onclick="createPopup()" style="  width: 160px; 
                     margin-right:5%;
                     margin-bottom: 10px; margin-top: 10px"
                     data-toggle="tooltip" title="Search for most relevant reviews to the selected words"/>

            </td>
          </tr>
        </table>


        </th>
        <th style="text-align: left; vertical-align: top">
        <table border="0" class="general"  style=" min-width: 100%; ">
          <thead>
            <tr>
              <td style="text-align: left">
                <text class ="generalTitle" id="intermediate-title" >Intermediate</text>
              </td>
            </tr>
            <tr>
              <td>
                <div class = "listEnhance"  style=" min-width: 100%; max-width: 100%;
                     margin-right:20px; margin-bottom: 30px;
                     margin-top: 10px; max-height: 350px; min-height: 350px; ">
                  <table id="intermediate-table" >    
                  </table>
                </div>
              </td>
            </tr>
        </table>

        </th>
        </tr>
        <tr>
          <td colspan="3">
            <div id="bigChart" class = "tsBig"></div>
          </td>
        </tr>
      </table>
    </div>
    <div id="clear-warning" style="display: none; font-size: 1.2em">
      Doing this will clear PREVIOUSLY selected keywords.
      </br>
      Do you really want to do it?
      </br>
      <input class="button" type="submit" value="Yes" 
             onclick="answerYes()" style="  width: 108px; 
             margin-left:10px; margin-right:20px; 
             margin-bottom: 11px; margin-top: 11px"/>
      <input class="button" type="submit" value="No" 
             onclick="answerNo()" style="  width: 108px; 
             margin-left:10px; margin-right:20px; 
             margin-bottom: 11px; margin-top: 11px"/>
    </div>

    <div  id="divrev" style=" background-color: #fff;
          min-height: 80%; max-width: 80%; min-width: 80%;
          max-height: 80%;
          display: none">
      <table style="
             width: 100%; 
             margin-left: 7%; margin-right: auto; 
             margin-bottom: auto; margin-top:  auto;">

        <tr>
          <td colspan="2" style ="text-align: right">
            <input class="button" type="submit" value="X" 
                   onclick="exitBlock()" style="  width: 20px; 
                   margin-left:10px;
                   font-size: 0.8em; height: 20px;
                   font-weight: bold;"/>
          </td>
        </tr>
        <tr>
          </br>
          <th colspan="2" style ="text-align: left">
            <text class="generalTitle" 
                  style="padding-left: 0px">
            Most relevant reviews
            </text>

          </th>
        </tr>
        <tr>
          <td style="text-align: left">
            <text style="font-size: 1.1em; font-weight: bold;
                  padding-right: 20px">Sort by:</text>
            <select id="revSortSelect" name="Sort"  style="margin-right: 30px; " onchange="reviewManip()">
              <option>Most relevant</option>
              <option>Rating: Low to High</option>
              <option>Rating: High to Low</option>
              <option>Most recent</option>
            </select>
            <text style="font-size: 1.1em; font-weight: bold; padding-right: 20px">Filter by: </text>
            <select id="revRateSelect" name="Rating" style="margin-right: 30px;"
                    onchange="reviewManip()">
              <option>All stars</option>
              <option>1 star only</option>
              <option>2 star only</option>
              <option>3 star only</option>
              <option>4 star only</option>
              <option>5 star only</option>
              <option>All positive</option>
              <option>All negative</option>
            </select>
          </td>
          <td style="text-align: right">
            <input class = "search" id="revSearch"
                   style=" width: 200px;" type="text">
            <input class="button" type="submit" value="Search" 
                   onclick="reviewManip()" style="  width: 80px; 
                   margin-left:10px; margin-right:32px; 
                   margin-bottom: 10px; margin-top: 10px"/>
          </td>
        </tr>
        <tr>
          <td style="text-align: left; vertical-align: top; width: 100%;"  colspan="2" >
            <table class="general" border="0" 
                   style="max-width: 100%; min-width: 100%;
                   margin-top: 20px  ">
              <tr>
                <td>
                  <div class="listEnhance"  id ="positive-rev"
                       style="
                       margin-left: auto; margin-right: auto; 
                       margin-bottom: 5%; margin-top:  auto;
                       white-space: pre-wrap; word-wrap: break-word;
                       text-align: left; overflow-x: hidden"></div></td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>



    <div  id="divdetail" style=" background-color: #fff;
          min-height: 80%; max-width: 100%; min-width: 100%;
          max-height: 80%; margin-top: auto; margin-bottom: auto;
          display: none">
      <table style="
             max-width: 100%; min-width: 100%;  margin-top: auto; margin-bottom: auto;">
        <tr >
          <td colspan="2" style ="text-align: right">
            <input class="button" type="submit" value="X" 
                   onclick="exitBlock()" style="  width: 20px; 
                   margin-left:10px; margin-right:20px; 
                   margin-top: 11px;font-size: 0.8em; height: 20px;
                   font-weight: bold;"/>
          </td>
        </tr>
        <tr>
          <td colspan="2" style ="text-align: left">
            </br>
            <text class="generalTitle" 
                  style="padding-left: 2%; ">
            Keyword Analysis:
            </text>
            <text class="appNames" id="key-analyzing" style="font-size: 1.6em; padding-left: 0px"></text>
          </td>
        </tr>
        <tr  style="height: 95%;">
          <td style="text-align: left; vertical-align: top; width: 50%;">

            <table border="0" 
                   style="max-width: 90%; min-width: 90%;
                   margin-left: auto; margin-right: auto; margin-top: 5% ">
              <tr>
                <td>
                  <text 
                    style="font-size: 1.5em; font-weight: bold;">Related Keywords
                  </text>

                </td>
              </tr>
              <tr>
                <td>
                  <div class="listEnhance"   id="divRelatedKeys"
                       style="max-width: 100%; min-width: 100%;">
                    <table id="related-keys" ></table>
                  </div>
                </td>
              </tr>
              <tr >
                <td>
                  <div class="listEnhance"  id ="smallChart"
                       style="max-width: 100%; min-width: 100%;
                       background-color: #fafffa; display: block; margin-bottom: 5%"></div>
                </td>
              </tr>
            </table>

          </td>
          <td style="text-align: left; vertical-align: top; width:  50%;">
            <table class="general" border="0" 
                   style="max-width: 90%; min-width: 90%; margin-top: 5%; margin-left: auto; margin-right: auto ">
              <tr>
                <td colspan="2"><text 
                    style="font-size: 1.5em; font-weight: bold">Most relevant reviews</text></td>
              </tr>
              <tr >
                <td style="text-align: left;">
                  <text style="font-size: 1.1em; font-weight: bold;
                        padding-right: 13px">Sort by:</text>
                  <select id="revSortSelectRel" name="Sort"  
                          style="margin-right: 20px; " onchange="reviewManipRel()">
                    <option>Most relevant</option>
                    <option>Rating: Low to High</option>
                    <option>Rating: High to Low</option>
                    <option>Most recent</option>
                  </select>
                  </br>
                  <text style="font-size: 1.1em; font-weight: bold; padding-right: 5px">Filter by: </text>
                  <select id="revRateSelectRel" name="Rating" 
                          onchange="reviewManipRel()">
                    <option>All stars</option>
                    <option>1 star only</option>
                    <option>2 star only</option>
                    <option>3 star only</option>
                    <option>4 star only</option>
                    <option>5 star only</option>
                    <option>All positive</option>
                    <option>All negative</option>
                  </select>
                </td>
                <td style="text-align: right">
                  <input class = "search" type="text" id="revSearchRel">
                  <input class="button" type="submit" value="Search" 
                         onclick="reviewManipRel()" style="  width: 70px; 
                         margin-left:10px; margin-right:32px; 
                         margin-bottom: 10px; margin-top: 10px"/>
                </td>
              </tr>
              <tr>
                <td colspan="2"><div class="listEnhance"  id ="relevant-rev"
                                     style="max-width: 100%; min-width: 100%;
                                     min-height:   380px; max-height:  380px;
                                     white-space: pre-wrap; word-wrap: break-word;
                                     text-align: left; overflow-x: hidden"></div></td>
              </tr>
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

