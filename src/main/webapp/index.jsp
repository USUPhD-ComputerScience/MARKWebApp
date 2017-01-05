<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
  <head prefix="og: http://ogp.me/ns#">
    <meta name="description" content="The website of USEAL - MARK tool" />
    <meta name="author" content="USEAL" />
    <meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1"/>
    <meta name="viewport" content="width=device-width, initial-scale=1"/>

    <script src="js/myscripts.js"></script>

    <title>USEAL - MARK Tool</title>

    <!-- <link rel="alternate" type="application/rss+xml" title="USEAL - DoidAssist" href="atom.xml"> -->

    <link href="css/base.css" rel="stylesheet" type="text/css"/>

    <link href="lib/font-awesome/css/font-awesome.min.css" rel="stylesheet" type="text/css"/>

    <link href="http://fonts.googleapis.com/css?family=Droid+Sans:400,700" rel="stylesheet" type="text/css"/>

    <link href="lib/lightbox/css/lightbox.css" rel="stylesheet" type="text/css"/>


  </head>

  <body onload='loadMenu()'>
    <div class="container">
      <div class="nav-button"><i class="icon-reorder"></i>
      </div>
      <div class="side" id="menu">
      </div>
      <div class="wrap">
        <div class="content" >
          <!-- Chinh sua content tai day -->
          <div id = "projectname">             
          </div>
          </br>
          <h2>Overview of MARK</h2>
          <p>Mobile app reviews often contain useful user opinions for app developers. However, manual analysis of those reviews is challenging due to their large volume and noisy nature. For that reason, we introduces MARK, a supporting tool for review analysis of mobile apps. With MARK, an analyst can describes his interests of one or more apps via a set of keywords. MARK then lists the reviews most relevant to those keywords for further analysis. It can also draw the trends over time of the selected keywords, which might help the analyst to detect sudden changes in the related user reviews. To help the analyst describe his interests more effectively, MARK can automatically extract and rank the keywords by their associations with negative reviews, divide a large set of keywords into more cohesive subgroups, or expand a small set into a broader one.</p>
          </br>
          </br>
          <h4> Below is a screen-shot image of MARK web-app</h4>
          <img src="img/Launching.png" width="1087" height="586" alt="Launching" border ="1"/>



          <!-- <div class="end">
             
          </div> -->

        </div>
      </div>
    </div>




    <script src="../ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js" type="text/javascript"></script>

    <script src="lib/lightbox/js/lightbox.js" type="text/javascript"></script>
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
<!-- Mirrored from elementsofprogramminginterviews.com/ by HTTrack Website Copier/3.x [XR&CO'2014], Thu, 23 Jul 2015 22:03:50 GMT -->

