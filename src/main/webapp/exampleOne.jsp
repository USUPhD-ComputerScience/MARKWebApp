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
          <h2>Scenario 1: Facebook Messenger</h2>

          <img src="img/Launching.png" width="1087" height="586" alt="Launching" style="border: 2px solid #E5E4D7;"/>
          <h4>Figure 1: Lauching screen of MARK</h4>
          <p>Let us demonstrate MARK via the following example. Assume that we are interested in negative user opinions about Facebook Messenger (one of the most popular apps on Google Play with around 500 millions to 1 billion users as of May 2015). Figure 1 shows the Launching screen, where we could choose this app for our analysis. To do that, we type in the word Messenger and apps with names most similar to that word are listed in the App Selection screen as in Figure 2. This screen also shows basic information about the apps such as description, average ratings, common keywords, etc. We can click on the link of Facebook Messenger to add it to the list of selected apps showed in the right and click on the Analyze button to go the next screen, the General Analyses screen.</p>

          <img src="img/messengerChoosingApp.png" width="1338" height="343" alt="messengerChoosingApp" style="border: 2px solid #E5E4D7"/>
          <h4>Figure 2: Selecting Facebook Messenger</h4>

          <p>Initially, we have no idea about which aspects of the app get negative opinions. Thus, MARK lists all potential keywords from raw reviews of Facebook Messenger and ranks those keywords based on their associations with negative ratings(e.g. top-ranked words like update or login occur most frequent in 1 or 2-star reviews) like in Figure 3. Because the list contains all possible keywords, to narrow down our analysis, we select the top 100 (i.e. most negative) out of it. Figure 4 shows the listed and selected keywords.</p>
          <img src="img/messengerRankedKeywords.png" width="428" height="417" alt="messengerRankedKeywords"style="border: 2px solid #E5E4D7"/>
          <h4>Figure 3: Negative keywords for Facebook Messenger</h4>
          <img src="img/selected100Messenger.png" width="654" height="392" alt="selected100Messenger"style="border: 2px solid #E5E4D7"/>
          <h4>Figure 4: Selection of top 100 keywords</h4>

          <p>As seen in the figure, several selected keywords are related and indicate a more general concern/issue. For example both keywords crash and freeze could be used to describe the app’s status when an “unrecoverable error” occurs. Or, battery and drain often go together to describe the bad “energy consumption” of the app. Therefore, we use the Cluster function of MARK to divide the 100 selected keywords into smaller groups, each potentially for a more general concern. Figure 5 shows the clustering results produced for Facebook Messenger.</p>
          <img src="img/cluster100Messenger.png" width="420" height="411" alt="cluster100Messenger"style="border: 2px solid #E5E4D7"/>
          <h4>Figure 5: Clustered keywords for Facebook Messenger</h4>

          <p>This clustering task is based on Word2Vec, a distributed,vector-based representation of words. Word2Vec represents each word in a vocabulary as a high dimensional vector learned from a large corpus of text. Words having similar or related syntactic roles or semantic meanings often have similar vectors. Thus, MARK divides a keyword set into smaller subsets of related ones by applying K-mean, a similarity-based clustering algorithm on their vectors. It should be noted that, because K-mean algorithm initializes its clusters randomly, the clustering results might be slightly different between uses!</p>

          <img src="img/suggestMessenger.png" width="1103" height="430" alt="suggestMessenger"style="border: 2px solid #E5E4D7"/>
          <h4>Figure 6: Suggested keywords for Facebook Messenger</h4>

          <p>Browsing the clusters, we find one containing keywords like battery and drain, i.e. possibly related to the user opinions about “energy consumption”. We select this cluster and remove some keywords that seem to be non-related like data and phone. We suspect that users might use some other keywords for this topic, thus, we ask MARK to suggest more (which is also performed based on the vector-based similarity of keywords). Figure 6 shows the suggested keywords, containing new ones like usage, deplete, and consumption.</p>

          <img src="img/MessengerTimeSeries.png" width="1796" height="396" alt="MessengerTimeSeries"style="border: 2px solid #E5E4D7"/>
          <h4>Figure 7: Trends of keywords for ”energy consumption” in Facebook Messenger</h4>

          <p>Once those keywords are selected, MARK visualizes the trends of their occurrences overtime which can be analyzed for abnormal patterns. Figure 7 shows the trends for the keywords related to energy consumption. We could see an unusually pike in occurrence of those keywords in Feb 2015, which was after the release of a new version of Facebook Messenger. Prior works suggest that sudden changes occurring when a new version of an app is released often contain some defects or issues that make many users unsatisfied. To detect such abnormalities, MARK considers the keyword occurrence counts as a time-series, computes its simple moving average (SMA), and differences between actual counts and its SMA values. If a difference value is significant higher (e.g. two times) than the standard deviation of those SMA values, it would indicate a sudden change in the corresponding occurrence count.</p>
          <img src="img/exampleReviews.png" width="821" height="623" alt="exampleReviews" style="border: 2px solid #E5E4D7"/>
          <h4>Figure 8: Reviews of keywords for ”energy consumption” in Facebook Messenger</h4>
          <p>We investigate further into this observation by asking MARK to query its review database and return reviews created in the selected time (Feb 2015) which are most relevant to the selected keywords. This querying task is based on the standard Vector Space Model. That is, MARK applies the tf.idf weighting scheme on the keywords and measures the relevance between the selected keywords to a review as the cosine similarity of their tf.idf feature vectors. Figure 8 shows the reviews listed in the Review Search screen. As seen, those reviews contain (mostly negative) user opinions about the energy consumption aspect of this app. In these reviews, the user complains this app drains his tablet’s battery and makes it overheated. The issue is so severe that he has to uninstall the app.</p>

          <p>According to a confirmation from a developer at Facebook, this problem was caused by a syncing error on Android (the app keeps syncing between the phone and the messaging server, thus utilizes a lot of CPU time which leads to high power consumption and overheat). A newly update version of Facebook Messenger has been released on February 13th to fix this problem.</p>

          <p>To help analysts reading the reviews more effectively, in the Review Search screen, MARK allows users to sorts the reviews by relevance (i.e. most related to keywords first), by time (e.g. most recent reviews first), or by rating (e.g. most negatively rated first). Users can also filter the listed reviews by their ratings (e.g. showing only 1-star reviews) or use fulltext search on the reviews.</p>
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
