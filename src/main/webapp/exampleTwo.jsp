<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
  <head prefix="og: http://ogp.me/ns#">

    <meta name="description" content="The website of USEAL - DroidAssist" />
    <meta name="author" content="USEAL" />
    <meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <script src="js/myscripts.js"></script>

    <title>USEAL - MARK Tool</title>

    <!-- <link rel="alternate" type="application/rss+xml" title="USEAL - DoidAssist" href="atom.xml"> -->

    <link href="css/base.css" rel="stylesheet" type="text/css">

    <link href="lib/font-awesome/css/font-awesome.min.css" rel="stylesheet" type="text/css">

    <link href="http://fonts.googleapis.com/css?family=Droid+Sans:400,700" rel="stylesheet" type="text/css">



    <link href="lib/lightbox/css/lightbox.css" rel="stylesheet" type="text/css">
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
          <h2>Scenario 2: Multiple apps - Viber and Whatsapp</h2>

          <p>In the previous section, we demonstrate an analysis on Facebook Messenger. However, during the investigation process, we found two similar apps that may be interesting: Whatsapp and Viber. Both of them are mobile message and call apps, that can be activated on phones using sms or email. They often have a large number of users (millions) and activities. There functionalities are almost identical and could be considered as direct competitors.</p>
          <p>This raised up several questions for developers of similar apps: What are the common problems of such apps and what can we learn from them?.</p>
          <p>In this section, we will demonstrate how to answer such questions with MARK.</p>
          <img src="img/MultipleRanked.png" width="491" height="522" alt="MultipleRanked"style="border: 2px solid #E5E4D7"/>
          <h4>Figure 1: Ranked keywords for Whatsapp and Viber</h4>
          <p>We start with the Launching screen and type in their names to select them for analysis. After that, we go to the Keyword Selection screen as showed in Figure 1. In this screen, we can examine each keyword individually. For example, Figure 12 shows the report for keyword activation. As seen in the figure, MARK draws the trends of this keyword overtime, suggests related keywords, like login and email, and also lists the relevant reviews.</p>
          <img src="img/MultipleLoginDetail.png" width="1567" height="640" alt="MultipleLoginDetail" style="border: 2px solid #E5E4D7"/>
          <h4>Figure 2: Ranked keywords for Whatsapp and Viber </h4>
          
          <p>As read from the reviews, the users were having trouble with activating their account. We might wonder if this is the only problem they have, or there are more regarding this same topic of login and authentication. To further investigate, we choose the keywords that might relate to this problem. In this list, it seems like enter is the only keyword that does not really belong to our case.</p>
          <img src="img/MultipleSuggestion.png" width="1074" height="407" alt="MultipleSuggestion"style="border: 2px solid #E5E4D7"/>
          <h4>Figure 3: Suggested keywords for login and authentication problems</h4>

          <p>After that, we went back to the Keyword Selection screen. At this screen, we asked MARK to suggest more keywords (e.g. see Figure 3). We add some of them and search for the reviews, we show top 2 most relevant ones in Figure 4.</p>
          <img src="img/multipleTop2Reviews.png" width="1126" height="306" alt="multipleTop2Reviews"style="border: 2px solid #E5E4D7"/>
          <h4>Figure 4: Reviews of keyword for login and authentication problems</h4>

          <p>Much to our surprise, users also talked about the problem of not being able to sign in using Google email service for both apps. Therefore, in just several steps, we discovered at least two general problems of such apps. Developers of these apps or similar ones can now acknowledge those problems as a must-be-fixed or a potential threat in their development process, depends on the specific intentions.</p>

          <p>Overall, with this example, we have shown that our tool does not only increase the understanding of developers for certain categories of apps, but also give them a strategic vision if they want to develop a competitive solution.</p>
          
          <!-- <div class="end">
             
          </div> -->

        </div>
      </div>
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

  <!-- Mirrored from elementsofprogramminginterviews.com/ by HTTrack Website Copier/3.x [XR&CO'2014], Thu, 23 Jul 2015 22:03:50 GMT -->
</html>
