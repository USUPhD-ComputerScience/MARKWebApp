/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package analyzers;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Scanner;
import java.util.Set;

import Utils.Util;
import datastores.ApplicationManager;
import datastores.ReviewDB;
import datastores.Vocabulary;
import mark.Application;
import models.ReviewForAnalysis;

/**
 *
 * @author Science
 */
public class ReviewFeatureExplanation {

    Set<String> wordListBad = null;
    Set<String> wordListGood = null;

    Map<String, Set<String>> topics = new HashMap<>();
    ApplicationManager appMan = ApplicationManager.getInstance();

    public ReviewFeatureExplanation() throws Throwable {
        wordListBad = loadWordsSet(new File("D:\\projects\\concernsReviews\\ADJ\\badADJ.txt"));
        wordListGood = loadWordsSet(new File("D:\\projects\\concernsReviews\\ADJ\\goodADJ.txt"));
        List<String> topicFiles = Util.listFilesForFolder("D:\\projects\\concernsReviews\\topics");
        for (String topicFile : topicFiles) {
            Set<String> wordList = loadWordsSet(new File(topicFile));
            String[] values = topicFile.split("\\\\");
            String topicName = values[values.length - 1].replace(".txt", "");
            topics.put(topicName, wordList);
            //System.out.println("topic: "+topicName);
        }
        readData(1000, appMan,"D:\\projects\\concernsReviews\\appCategories\\all.txt");
    }

    public void writeGoodBad(PrintWriter outputGood, PrintWriter outputBad,
            PrintWriter outputNeutral, Map<String, Integer> TopicBadSenticount,
            Map<String, Integer> TopicGoodSenticount, Map<String, Integer> TopicWordcount,
            int rating) throws Throwable {
        for (String topic : topics.keySet()) {
            Integer count = TopicWordcount.get(topic);
            if (count == null) {
                count = 0;
            }
            Integer badcount = TopicBadSenticount.get(topic);
            if (badcount == null) {
                badcount = 0;
            }
            Integer goodcount = TopicGoodSenticount.get(topic);
            if (goodcount == null) {
                goodcount = 0;
            }
            outputNeutral.print(count + ",");
            outputBad.print(badcount + ",");
            outputGood.print(goodcount + ",");

        }
        outputNeutral.print(rating);
        outputBad.print(rating);
        outputGood.print(rating);
        outputNeutral.println();
        outputBad.println();
        outputGood.println();
    }

    public void writeGoodBad_init(PrintWriter outputGood, PrintWriter outputBad,
            PrintWriter outputNeutral) throws Throwable {
        for (String topic : topics.keySet()) {
            outputNeutral.print(topic + ",");
            outputBad.print(topic + ",");
            outputGood.print(topic + ",");

        }
        outputNeutral.print("rating");
        outputBad.print("rating");
        outputGood.print("rating");
        outputNeutral.println();
        outputBad.println();
        outputGood.println();
    }

    private int minReviewsBasedOnRating(){
        List<Application> appList = appMan.getAppList();
        int[] countRating = new int[5];
        for (Application app : appList) {
            for (ReviewForAnalysis rev : app.getReviewList()) {
                int rating = rev.getRating();
                switch(rating){
                    case 1:
                        countRating[0]++;
                        break;
                    case 2:
                        countRating[1]++;
                        break;
                    case 3:
                        countRating[2]++;
                        break;
                    case 4:
                        countRating[3]++;
                        break;
                    case 5:
                        countRating[4]++;
                        break;
                }
            }
        }
        
        int min = Integer.MAX_VALUE;
        for(int i =0 ; i<5; i++){
            if(countRating[i] < min)
                min = countRating[i];
        }
        return min;
    }
    public void analysis(int range, String directory) throws Throwable {

        PrintWriter outputGood = new PrintWriter(directory + "\\goodTable.txt");
        PrintWriter outputBad = new PrintWriter(directory + "\\badTable.txt");
        PrintWriter outputNeutral = new PrintWriter(directory + "\\countTable.txt");
        PrintWriter outputReviews = new PrintWriter(directory + "\\reviews.txt");
        outputReviews.println("Review");
        writeGoodBad_init(outputGood, outputBad, outputNeutral);
        int minRev = minReviewsBasedOnRating();
        List<Application> appList = appMan.getAppList();
        int[] countRev = new int[5];
        for (Application app : appList) {
            for (ReviewForAnalysis rev : app.getReviewList()) {

                if (rev.toProperString().split("[^a-z0-9']+").length < 20) {
                    continue;
                }
                if(countRev[rev.getRating()-1] > minRev)
                    continue;
                countRev[rev.getRating()-1]++;
                Map<String, Integer> TopicWordcount = new HashMap<>();
                Map<String, Integer> TopicBadSenticount = new HashMap<>();
                Map<String, Integer> TopicGoodSenticount = new HashMap<>();

                String[] sentences = rev.toProperString().split("\\.+");
                for (String sen : sentences) {
                    String[] words = sen.split("[^a-z0-9']+");
                    for (int i = 0; i < words.length; i++) {
                        for (Entry<String, Set<String>> topic : topics.entrySet()) {
                            String topicName = topic.getKey();
                            Set<String> wordSet = topic.getValue();
                            if (wordSet.contains(words[i])) {
                                Integer count = TopicWordcount.get(topicName);
                                if (count == null) {
                                    TopicWordcount.put(topicName, 1);
                                } else {
                                    TopicWordcount.put(topicName, count + 1);
                                }
                                ///
                                int bad = searchBackAndForth(range, i, words, wordListBad);
                                if (bad > 0) {
                                    Integer Badcount = TopicBadSenticount.get(topicName);
                                    if (Badcount == null) {
                                        TopicBadSenticount.put(topicName, bad);
                                    } else {
                                        TopicBadSenticount.put(topicName, Badcount + bad);

                                    }
                                }

                                int good = searchBackAndForth(range, i, words, wordListGood);
                                if (good > 0) {
                                    Integer Goodcount = TopicGoodSenticount.get(topicName);
                                    if (Goodcount == null) {
                                        TopicGoodSenticount.put(topicName, good);
                                    } else {
                                        TopicGoodSenticount.put(topicName, Goodcount + good);
                                    }
                                }
                            }

                        }
                    }
                }
                writeGoodBad(outputGood, outputBad, outputNeutral, TopicBadSenticount, TopicGoodSenticount, TopicWordcount, rev.getRating());
                outputReviews.println(rev.toProperString());
            }
        }

        outputBad.close();
        outputGood.close();
        outputNeutral.close();
        outputReviews.close();
        System.out.println("Done Writing Feature Tables for " + countRev + " reviews");
    }

    private static int searchBackAndForth(int range, int index, String[] words, Set<String> referSet) {
        int count = 0;
        int forwardIndex = index + range;
        int BackwardIndex = index - range;
        for (int i = index + 1; i <= forwardIndex && i < words.length; i++) {
            if (referSet.contains(words[i])) {
//                if (words[i].contains("frustrating")) {
//                    System.out.println(words[i]);
//                }
                count++;
            }
        }
        for (int i = index - 1; i >= BackwardIndex && i >= 0; i--) {
            if (referSet.contains(words[i])) {
                count++;
            }
        }
        return count;
    }

    private static Set<String> loadWordsSet(File testDataFile)
            throws FileNotFoundException {
        // TODO Auto-generated method stub
        Set<String> results = new HashSet<>();
        Scanner br = new Scanner(new FileReader(testDataFile));
        while (br.hasNextLine()) {
            String[] words = br.nextLine().split(",");
            results.add(words[0]);
        }
        br.close();
        return results;
    }

    public static void main(String[] args) throws Throwable {
        ReviewFeatureExplanation RFE = new ReviewFeatureExplanation();
        RFE.analysis(15, "D:\\projects\\concernsReviews\\topicTables");
    }

    public static void readData(int minReviews, ApplicationManager appMan, String appidListFile) throws Throwable {
        Set<String> appidSet = loadWordsSet(new File(appidListFile));
//        
//        for(String appid:appidSet){
//            System.out.println(appid);
//        }
        System.out.println("----------------+++++++++++++++");
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
            String appid = app.getAppID();
           // System.out.println(appid);
            if(!appidSet.contains(appid))
                continue;
            appCount++;
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
//                if (count == 100000) {
//                    return;
//                }
            }
            //appMan.addApp(app);
            //app.calculateSummarization();
            System.out.println("        Done for This app");
        }
        System.out.println("Done Reading Data! Found " + +totalReview
                + " pre-processed reviews in "
                + (double) (System.currentTimeMillis() - start) / 1000 / 60
                + "minutes");
        System.out.println("Additional statistics: \n Average of " + (double) totalWords / totalReview + " words per review");
    }

}
