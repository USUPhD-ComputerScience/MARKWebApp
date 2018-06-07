package com.ajax;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.sql.SQLException;
import java.text.DecimalFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.Enumeration;
import javax.servlet.ServletConfig;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Scanner;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;
//import java.util.logging.Logger;
import org.apache.lucene.analysis.KeywordAnalyzer;

import USU.CS.NLP.NatureLanguageProcessor;
import USU.CS.NLP.WordVec;
import USU.CS.Utils.Util;
import analyzers.ClustersAnalyzer;
import analyzers.RankingKeywordAnalyzer;
import analyzers.ReviewSearcher;
import analyzers.TimeAnalyzer;
import datastores.ApplicationManager;
import datastores.ReviewDB;
import datastores.Vocabulary;
import mark.Application;
import mark.KeywordExplorer;
import models.ReviewForAnalysis;
import models.Word;

/**
 *
 * @author nbuser
 */
public class AutoCompleteServlet extends HttpServlet {

    private ServletContext context;
    private static Map<Integer, Map<String, Word>> vocList = new HashMap<>();
    private static Map<Integer, Application> commonRepresentativeApps = new HashMap<>();
    private static Map<Integer, List<Map.Entry>> queriedReviews = new HashMap<>();
    private static Map<Integer, List<ReviewForAnalysis>> pagingReviews = new HashMap<>();
    private static int idIndex = 0;
    //private static Map<String, Word> voc = null;
    ApplicationManager appMan = ApplicationManager.getInstance();
    private List<Application> apps = new ArrayList<>();
    private static final WordVec word2vec = new WordVec();

    //private static Map<String, Word> voc = null;
    //private static String vochash = "";
    @Override
    public void init(ServletConfig config) throws ServletException {
        try {
            NatureLanguageProcessor.getInstance();
            this.context = config.getServletContext();

            readData(300000, appMan);
            //Application app = new Application("yo.lo.swag.boy", "yolo super swaggypants", 1000, null, 0, 0);
            // appMan = ApplicationManager.getInstance();
            // appMan.addApp(app); 
            for (Application app : appMan.getAppList()) {
                apps.add(app);
            }
            apps.sort(new Comparator<Application>() {

                @Override
                public int compare(Application o1, Application o2) {
                    return o1.getDBCount() - o2.getDBCount();
                }
            });
        } catch (Throwable ex) {
            Logger.getLogger(AutoCompleteServlet.class.getName()).log(Level.SEVERE, null, ex);
        }
    }

    public static void readData(int minReviews, ApplicationManager appMan) throws Throwable {
        // read each review from the database: Table Reviews.
        System.out.println("> Querying apps that has at least " + minReviews
                + " reviews");
        long start = System.currentTimeMillis();
        Vocabulary voc = Vocabulary.getInstance();
        ReviewDB reviewDB = ReviewDB.getInstance();
        //appMan = ApplicationManager.getInstance();

        reviewDB.queryMultipleAppsInfo(minReviews);
        List<Application> appList = appMan.getAppList();
        System.out.println("====> Queried " + appList.size() + " apps!");
        System.out.println("> Querying reviews for each apps now:");
        int totalReview = 0;
        long totalWords = 0;
        int appCount = 0;
        for (Application app : appList) {
            appCount++;
            String appid = app.getAppID();
            System.out.println("      " + appCount + ". " + appid + ":");
            System.out.println("        Query Keywords: "
                    + voc.loadDBKeyword(app) + " keywords!");
//            logger.info("        Query Keywords: "
//                    + voc.loadDBKeyword(app) + " keywords!");
            System.out.print("        Querying pre-processed reviews: ");
            reviewDB.queryReviewsforAProduct(app,
                    false);
            Set<ReviewForAnalysis> reviewList = app.getReviewList();
            System.out.println(reviewList.size() + " pre-processed reviews");
            totalReview += reviewList.size();
            for (ReviewForAnalysis rev : reviewList) {
                //app.addReview(rev);
                int[][] sens = rev.getSentences();
                for (int[] sen : sens) {
                    totalWords += sen.length;
                }
            }
            //appMan.addApp(app);
            app.calculateSummarization();
            System.out.println("        Done for This app");
        }
        System.out.println("Done Reading Data! Found " + +totalReview
                + " pre-processed reviews in "
                + (double) (System.currentTimeMillis() - start) / 1000 / 60
                + "minutes");
        System.out.println("Additional statistics: \n Average of " + (double) totalWords / totalReview + " words per review");
    }

    /**
     * Handles the HTTP <code>GET</code> method.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    @Override
    public void doGet(HttpServletRequest request, HttpServletResponse response)
            throws IOException, ServletException {

        String action = request.getParameter("action");
        StringBuffer sb = new StringBuffer();

        boolean namesAdded = false;
        int count2 = 0;
        if (action.equals("complete")) {
            String targetId = request.getParameter("id");
            if (targetId == null) {
                context.getRequestDispatcher("/error.jsp").forward(request, response);
            }
            DecimalFormat newFormat = new DecimalFormat("#.#");
            // check if user sent empty string

            if (!targetId.equals("")) {

                for (Application app : apps) {
                    String name = app.getName().replaceAll("&", "and");
                    if (name.toLowerCase().startsWith(targetId)) {
                        count2++;
                        sb.append("<app>");
                        sb.append("<appID>" + app.getAppID() + "</appID>");
                        sb.append("<appName>" + name + "</appName>");
                        sb.append("<appDBCount>" + app.getDBCount() + "</appDBCount>");
                        sb.append("<rate>" + Double.valueOf(newFormat.format(app.getRate())) + "</rate>");
                        sb.append("<exampleKeys>" + app.getExampleKeywords() + "</exampleKeys>");
                        sb.append("<appStart>" + Util.convertTime(app.getStartDate()) + "</appStart>");
                        sb.append("<appEnd>" + Util.convertTime(app.getPreprocessedDate()) + "</appEnd>");
                        sb.append("</app>");
                        namesAdded = true;
                    }
                }
                //if (namesAdded) {
                response.setContentType("text/xml");
                response.setHeader("Cache-Control", "no-cache");
                response.getWriter().write("<apps>" + sb.toString() + "</apps>");
                System.out.println("sending " + count2 + "app(s)");
                //} else {
                //nothing to show
                //  response.setStatus(HttpServletResponse.SC_NO_CONTENT);
                //}
            }

        }
        if (action.equals("all")) {

            DecimalFormat newFormat = new DecimalFormat("#.#");
            // check if user sent empty string
            for (Application app : apps) {
                String name = app.getName().replaceAll("&", "and");
                sb.append("<app>");
                sb.append("<appID>" + app.getAppID() + "</appID>");
                sb.append("<appName>" + name + "</appName>");
                sb.append("<appDBCount>" + app.getDBCount() + "</appDBCount>");
                sb.append("<rate>" + Double.valueOf(newFormat.format(app.getRate())) + "</rate>");
                sb.append("<exampleKeys>" + app.getExampleKeywords() + "</exampleKeys>");
                sb.append("<appStart>" + Util.convertTime(app.getStartDate()) + "</appStart>");
                sb.append("<appEnd>" + Util.convertTime(app.getPreprocessedDate()) + "</appEnd>");
                sb.append("</app>");
                namesAdded = true;
            }

            if (namesAdded) {
                response.setContentType("text/xml");
                response.setHeader("Cache-Control", "no-cache");
                response.getWriter().write("<apps>" + sb.toString() + "</apps>");
            } else {
                //nothing to show
                response.setStatus(HttpServletResponse.SC_NO_CONTENT);
            }

        }
        if (action.equals("rank")) {

//      if ((targetId != null) ) {
//        request.setAttribute("app", targetId);
//        context.getRequestDispatcher("/app.jsp").forward(request, response);
//      }
            List<Map.Entry> rankedWords = null;
            String targetId = request.getParameter("id");
            if ((targetId != null)) {
                try {
                    //List<String> IDList = Arrays.asList(targetId.toLowerCase().split(","));
                    /////////////
                    List<String> IDList = new ArrayList<>();
                    List<Application> appList = appMan.getAppList();
                    for (Application app : appList) {
                        IDList.add(app.getAppID());
                    }
                    ///////////
                    int vochash = buildHashOfVoc(IDList);
                    Map<String, Word> voc = vocList.get(vochash);
                    if (voc == null) {
                        try {
                            voc = Vocabulary.getInstance().buildCustomVoc(IDList);
                            vocList.put(vochash, voc);
                            Application representativeApp = appMan.buildRepresentativeApp(IDList);
                            commonRepresentativeApps.put(vochash, representativeApp);
                        } catch (SQLException ex) {
                            Logger.getLogger(AutoCompleteServlet.class.getName()).log(Level.SEVERE, null, ex);
                        }
                    }
                    rankedWords = RankingKeywordAnalyzer.extractKeyWordsAllMethods(voc, IDList, false);
                } catch (Throwable ex) {
                    Logger.getLogger(AutoCompleteServlet.class.getName()).log(Level.SEVERE, null, ex);
                }

            }

            if (rankedWords != null && rankedWords.size() > 0) {
                for (Map.Entry entry : rankedWords) {
                    sb.append("<key>" + entry.getKey() + "</key>");
                }
                sb.append("<id>" + idIndex + "</id>");
                queriedReviews.put(idIndex, null);
                idIndex++;
                response.setContentType("text/xml");
                response.setHeader("Cache-Control", "no-cache");
                response.getWriter().write("<rankedkey>" + sb.toString() + "</rankedkey>");
                System.out.println("Sending" + rankedWords.size());
            } else {
                //nothing to show
                response.setStatus(HttpServletResponse.SC_NO_CONTENT);
            }
        }
        if (action.equals("cluster")) {

//      if ((targetId != null) ) {
//        request.setAttribute("app", targetId);
//        context.getRequestDispatcher("/app.jsp").forward(request, response);
//      }
            List<List<String>> resultClusters = null;
            try {
                String words = "";
                for (Entry<String, String[]> entry : request.getParameterMap().entrySet()) {
                    String[] value = entry.getValue();
                    for (String val : value) {
                        words = val;
                    }
                }
                 List<String> wordList = Arrays.asList(words.toLowerCase().split(","));
//                List<String> wordList = loadTestWords(new File(getClass().
//                        getClassLoader().getResource("testSets\\allkeyword.txt").getPath()));
                System.out.println(wordList.toString());
                resultClusters = ClustersAnalyzer.clusterWords(wordList, word2vec);

                if (resultClusters == null || resultClusters.isEmpty()) {
                    response.setStatus(HttpServletResponse.SC_NO_CONTENT);
                } else {
                    int count = 0;
                    for (List<String> cluster : resultClusters) {
                        sb.append("<cluster>");
                        for (String item : cluster) {
                            sb.append("<item>" + item + "</item>");
                            count++;
                        }
                        sb.append("</cluster>");
                    }
                    response.setContentType("text/xml");
                    response.setHeader("Cache-Control", "no-cache");
                    response.getWriter().write("<clusters>" + sb.toString() + "</clusters>");
                    System.out.println("sending words total " + count);
                }
            } catch (Throwable ex) {
                Logger.getLogger(AutoCompleteServlet.class.getName()).log(Level.SEVERE, null, ex);
            }
        }
        if (action.equals("expand")) {

//      if ((targetId != null) ) {
//        request.setAttribute("app", targetId);
//        context.getRequestDispatcher("/app.jsp").forward(request, response);
//      }
            Set<String> resultExplored = null;
            try {
                //String[] vals = targetId.toLowerCase().split(";");
                String words = "";
                for (Entry<String, String[]> entry : request.getParameterMap().entrySet()) {
                    String[] value = entry.getValue();
                    for (String val : value) {
                        words = val;
                    }
                }
                List<String> wordList = Arrays.asList(words.toLowerCase().split(","));
                //List<String> IDList = Arrays.asList(vals[1].toLowerCase().split(","));
                /////////////
                List<String> IDList = new ArrayList<>();
                List<Application> appList = appMan.getAppList();
                for (Application app : appList) {
                    IDList.add(app.getAppID());
                }
                ///////////
                System.out.println(IDList.toString());

                int vochash = buildHashOfVoc(IDList);
                Map<String, Word> voc = vocList.get(vochash);
                System.out.println(wordList.toString());
                resultExplored = KeywordExplorer.explore(voc, wordList, word2vec);

                if (resultExplored == null || resultExplored.isEmpty()) {
                    response.setStatus(HttpServletResponse.SC_NO_CONTENT);
                } else {
                    int count = 0;
                    System.out.println(resultExplored.size());
                    for (String word : resultExplored) {
                        sb.append("<word>" + word + "</word>");
                        count++;
                    }
                    response.setContentType("text/xml");
                    response.setHeader("Cache-Control", "no-cache");
                    response.getWriter().write("<expansion>" + sb.toString() + "</expansion>");
                    System.out.println("sending words total " + count);
                }
            } catch (Throwable ex) {
                Logger.getLogger(AutoCompleteServlet.class.getName()).log(Level.SEVERE, null, ex);
            }
        }
        if (action.equals("search")) {
           String targetId = request.getParameter("id");
            searchQuery(targetId, request, response);
//             List<List<String>> resultClusters = null;
//            try {
//                String words = "";
//                for (Entry<String, String[]> entry : request.getParameterMap().entrySet()) {
//                    String[] value = entry.getValue();
//                    for (String val : value) {
//                        words = val;
//                    }
//                }
//                // List<String> wordList = Arrays.asList(words.toLowerCase().split(","));
//                List<String> wordList = loadTestWords(new File(getClass().
//                        getClassLoader().getResource("testSets\\allkeyword.txt").getPath()));
//                System.out.println(wordList.toString());
//                resultClusters = ClustersAnalyzer.clusterWords(wordList, word2vec);
//
//                if (resultClusters == null || resultClusters.isEmpty()) {
//                    response.setStatus(HttpServletResponse.SC_NO_CONTENT);
//                } else {
//                    int count = 0;
//                    for (List<String> cluster : resultClusters) {
//                        sb.append("<cluster>");
//                        for (String item : cluster) {
//                            sb.append("<item>" + item + "</item>");
//                            count++;
//                        }
//                        sb.append("</cluster>");
//                    }
//                    response.setContentType("text/xml");
//                    response.setHeader("Cache-Control", "no-cache");
//                    response.getWriter().write("<clusters>" + sb.toString() + "</clusters>");
//                    System.out.println("sending words total " + count);
//                }
//            } catch (Throwable ex) {
//                Logger.getLogger(AutoCompleteServlet.class.getName()).log(Level.SEVERE, null, ex);
//            }
        }
        if (action.equals("page")) {
            String targetId = request.getParameter("id");
            pageQuery(targetId, request, response);
        }
        if (action.equals("time")) {
            StringBuilder res = null;
            //if ((targetId != null)) {

            try {
                String data = "";
                for (Entry<String, String[]> entry : request.getParameterMap().entrySet()) {
                    String[] value = entry.getValue();
                    for (String val : value) {
                        data = val;
                    }

                }
                String[] vals = data.toLowerCase().split(";");
                Set<String> wordList = new HashSet<>(Arrays.asList(vals[0].toLowerCase().split(",")));
                System.out.println(wordList.toString());
                //List<String> IDList = Arrays.asList(vals[1].toLowerCase().split(","));
                /////////////
                List<String> IDList = new ArrayList<>();
                List<Application> appList = appMan.getAppList();
                for (Application app : appList) {
                    IDList.add(app.getAppID());
                }
                ///////////
                System.out.println(IDList.toString());

                int vochash = buildHashOfVoc(IDList);
                Map<String, Word> voc = vocList.get(vochash);
                res = TimeAnalyzer.analyzeTime(wordList, voc, commonRepresentativeApps.get(vochash));
            } catch (Throwable ex) {
                Logger.getLogger(AutoCompleteServlet.class.getName()).log(Level.SEVERE, null, ex);
            }

            //}
            if (res != null) {
                response.setContentType("text/xml");
                response.setHeader("Cache-Control", "no-cache");
                response.getWriter().write(res.toString());
            } else {
                //nothing to show
                response.setStatus(HttpServletResponse.SC_NO_CONTENT);
            }
        }

    }

    private static List<String> loadTestWords(File testDataFile)
            throws FileNotFoundException {
        // TODO Auto-generated method stub
        List<String> results = new ArrayList<>();
        Scanner br = new Scanner(new FileReader(testDataFile));
        while (br.hasNextLine()) {
            String[] wordList = br.nextLine().split(",");
            for (String word : wordList) {
                results.add(word);
            }
        }
        br.close();
        return results;
    }

    private int buildHashOfVoc(List<String> IDList) {
        final int prime = 31;
        int result = 1;
        for (String s : IDList) {
            result = result * prime + s.hashCode();
        }

        return result;
    }

    private int buildHashOfWord(Set<String> wordList) {
        final int prime = 31;
        int result = 1;
        for (String s : wordList) {
            result = result * prime + s.hashCode();
        }

        return result;
    }

    // Based on code from: http://www.coderanch.com/t/383310/java/java/parse-url-query-string-parameter
    private static Map<String, String> makeQueryMap(String query) throws UnsupportedEncodingException {
        String[] params = query.split("&");
        Map<String, String> map = new HashMap<String, String>();
        for (String param : params) {
            String[] split = param.split("=");
            map.put(URLDecoder.decode(split[0], "UTF-8"), URLDecoder.decode(split[1], "UTF-8"));
        }
        return map;
    }

    private void searchQuery(String targetId, HttpServletRequest request, HttpServletResponse response) throws IOException {
        List<Map.Entry> rankedReviews = null;
        Set<String> wordList = null;
        System.out.println("searching...");
        if ((targetId != null)) {
            String apps = request.getParameter("apps");
            String sort = request.getParameter("sort");
            String filter = request.getParameter("filter");
            String search = request.getParameter("search");
            String first = request.getParameter("first");
            int sesID = Integer.parseInt(request.getParameter("secid"));
            String startTime = request.getParameter("start");
            String endTime = request.getParameter("end");
            System.out.println("----" + sort + "-" + filter + "-" + search + "-" + first + "-" + sesID);
            wordList = new HashSet<>(Arrays.asList(targetId.toLowerCase().split(",")));
            List<String> IDList = Arrays.asList(apps.toLowerCase().split(","));

            List<ReviewForAnalysis> res = new ArrayList<>();

            int vochash = buildHashOfVoc(IDList);
            Map<String, Word> voc = vocList.get(vochash);
            if (voc == null) {
                try {
                    voc = Vocabulary.getInstance().buildCustomVoc(IDList);
                    vocList.put(vochash, voc);
                } catch (SQLException ex) {
                    Logger.getLogger(AutoCompleteServlet.class.getName()).log(Level.SEVERE, null, ex);
                }
            }
            if (first.equals("yes")) {
                try {
                    rankedReviews = ReviewSearcher.search(voc, wordList, IDList, word2vec);
                    queriedReviews.put(sesID, rankedReviews);
                } catch (Throwable ex) {
                    Logger.getLogger(AutoCompleteServlet.class.getName()).log(Level.SEVERE, null, ex);
                }
            } else {
                rankedReviews = queriedReviews.get(sesID);
            }
            if (rankedReviews != null) {
                int revCount = 0;
                for (Map.Entry entry : rankedReviews) {

                    if (startTime != null
                            && Long.parseLong(startTime) > ((ReviewForAnalysis) entry.getKey()).getCreationTime()) {
                        continue;
                    }

                    if (endTime != null
                            && Long.parseLong(endTime) < ((ReviewForAnalysis) entry.getKey()).getCreationTime()) {
                        continue;
                    }
                    ReviewForAnalysis rev = (ReviewForAnalysis) entry.getKey();
                    res.add(rev);
                    revCount++;
                    //if (revCount < 100) {
                    //rev.extractPhrases();
                    //}

                }
                //POSPatternMatcher.getInstance().printPatternAnalytic();
                if (first.equals("no")) {
                    // sort
                    if (sort.equals("high")) {
                        Collections.sort(res, new Comparator() {
                            public int compare(Object obj1, Object obj2) {
                                return ((ReviewForAnalysis) obj2).getRating() - ((ReviewForAnalysis) obj1).getRating();
                            }
                        });
                    }

                    if (sort.equals("low")) {
                        Collections.sort(res, new Comparator() {
                            public int compare(Object obj1, Object obj2) {
                                return ((ReviewForAnalysis) obj1).getRating() - ((ReviewForAnalysis) obj2).getRating();
                            }
                        });
                    }
                    if (sort.equals("recent")) {
                        Collections.sort(res, new Comparator() {
                            public int compare(Object obj1, Object obj2) {
                                return ((Long) ((ReviewForAnalysis) obj2).getCreationTime()).
                                        compareTo(((ReviewForAnalysis) obj1).getCreationTime());
                            }
                        });
                    }
                    // filter + search

                    List<ReviewForAnalysis> resTemp = new ArrayList<>();
                    for (ReviewForAnalysis rev : res) {
                        if (!rev.toProperString().contains(search)) {
                            continue;
                        }

                        switch (filter) {
                            case "all":
                                resTemp.add(rev);
                                break;
                            case "1":
                                if (rev.getRating() == 1) {
                                    resTemp.add(rev);
                                }
                                break;
                            case "2":
                                if (rev.getRating() == 2) {
                                    resTemp.add(rev);
                                }
                                break;
                            case "3":
                                if (rev.getRating() == 3) {
                                    resTemp.add(rev);
                                }
                                break;
                            case "4":
                                if (rev.getRating() == 4) {
                                    resTemp.add(rev);
                                }
                                break;
                            case "5":
                                if (rev.getRating() == 5) {
                                    resTemp.add(rev);
                                }
                                break;
                            case "positive":
                                if (rev.getRating() > 2) {
                                    resTemp.add(rev);
                                }
                                break;
                            case "negative":
                                if (rev.getRating() < 3) {
                                    resTemp.add(rev);
                                }
                                break;
                        }
                    }
                    res = resTemp;
                }
                pagingReviews.put(sesID, res);
                int count = 0;
                StringBuilder sb = new StringBuilder();
                if (res.size() != 0) {
                    for (int i = 0; i < 10; i++) {
                        ReviewForAnalysis rev = res.get(i);
                        count++;
                        sb.append("<review>");

                        // rating
                        sb.append("<rating>" + rev.getRating() + "</rating>");
                        // ID
                        sb.append("<id>" + rev.getReviewId() + "</id>");
                        // time
                        sb.append("<time>" + Util.convertTimeDetail(rev.getCreationTime()) + "</time>");
                        // app
                        sb.append("<app>" + rev.getApp().getName().replaceAll("&", "and") + "</app>");
                        // cleansed and notated content
                        StringBuilder cleansedText = new StringBuilder();
                        StringBuilder keywords = new StringBuilder();
                        String[] sentences = rev.toProperString().split("\\.+");
                        Set<String> badWords = NatureLanguageProcessor.getInstance().getBadWordSet();
                        int sencount = 0;
                        Set<String> keywordset = new HashSet<>();
                        for (String sen : sentences) {
                            if (sencount == 0) {
                                // title
                                sb.append("<title>" + sen + "</title>");
                                sencount = 1;
                            }
                            for (String w : sen.split(" ")) {
                                if (badWords.contains(w)) {
                                    cleansedText.append("****");
                                } else {
                                    if (wordList.contains(w)) {
                                        cleansedText.append(w.toUpperCase());
                                        keywordset.add(w);
                                    } else {
                                        cleansedText.append(w);
                                    }
                                }
                                cleansedText.append(" ");
                            }
                            cleansedText.append(". ");
                        }
                        sb.append("<text>" + cleansedText.toString() + "</text>");
                        for (String w : keywordset) {
                            keywords.append(w + " ");
                        }
                        sb.append("<keywords>" + keywords.toString() + "</keywords>");
                        sb.append("</review>");
                    }
                    sb.append("<totalpage>" + ((res.size() / 10)) + "</totalpage>");
                    sb.append("<currentpage>" + 1 + "</currentpage>");
                }

                response.setContentType("text/xml");
                response.setHeader("Cache-Control", "no-cache");
                response.getWriter().write("<rankedreviews>" + sb.toString() + "</rankedreviews>");
                System.out.println("Sending reviews: " + count);
            } else {
                //nothing to show
                response.setStatus(HttpServletResponse.SC_NO_CONTENT);
            }
        } else {
            //nothing to show
            response.setStatus(HttpServletResponse.SC_NO_CONTENT);
        }

    }

    private void pageQuery(String targetId, HttpServletRequest request, HttpServletResponse response) throws IOException {
        int sesID = Integer.parseInt(request.getParameter("secid"));
        int page = Integer.parseInt(request.getParameter("page"));
        Set<String> wordList = new HashSet<>(Arrays.asList(targetId.toLowerCase().split(",")));

        List<ReviewForAnalysis> res = pagingReviews.get(sesID);
        int start = page * 10 - 10;
        int end = page * 10;
        if (end > res.size()) {
            end = res.size();
        }
        int count = 0;
        StringBuilder sb = new StringBuilder();
        for (int i = start; i < end; i++) {
            ReviewForAnalysis rev = res.get(i);
            count++;

            sb.append("<review>");

            // rating
            sb.append("<rating>" + rev.getRating() + "</rating>");
            // ID
            sb.append("<id>" + rev.getReviewId() + "</id>");
            // time
            sb.append("<time>" + Util.convertTimeDetail(rev.getCreationTime()) + "</time>");
            // app
            sb.append("<app>" + rev.getApp().getName().replaceAll("&", "and") + "</app>");
            // cleansed and notated content
            StringBuilder cleansedText = new StringBuilder();
            StringBuilder keywords = new StringBuilder();
            String[] sentences = rev.toProperString().split("\\.+");
            Set<String> badWords = NatureLanguageProcessor.getInstance().getBadWordSet();
            int sencount = 0;
            Set<String> keywordset = new HashSet<>();
            for (String sen : sentences) {
                if (sencount == 0) {
                    // title
                    sb.append("<title>" + sen + "</title>");
                    sencount = 1;
                }
                for (String w : sen.split(" ")) {
                    if (badWords.contains(w)) {
                        cleansedText.append("****");
                    } else {
                        if (wordList.contains(w)) {
                            cleansedText.append(w.toUpperCase());
                            keywordset.add(w);
                        } else {
                            cleansedText.append(w);
                        }
                    }
                    cleansedText.append(" ");
                }
                cleansedText.append(". ");
            }
            sb.append("<text>" + cleansedText.toString() + "</text>");
            for (String w : keywordset) {
                keywords.append(w + " ");
            }
            sb.append("<keywords>" + keywords.toString() + "</keywords>");
            sb.append("</review>");
        }
        sb.append("<totalpage>" + ((res.size() / 10)) + "</totalpage>");
        System.out.println("size of Res: " + res.size());
        sb.append("<currentpage>" + page + "</currentpage>");
        response.setContentType("text/xml");
        response.setHeader("Cache-Control", "no-cache");
        response.getWriter().write("<rankedreviews>" + sb.toString() + "</rankedreviews>");
        System.out.println("Sending reviews: " + count);
    }
}
