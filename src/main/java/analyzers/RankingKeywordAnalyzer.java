package analyzers;

import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import models.Word;

import java.util.Set;

import USU.CS.NLP.NatureLanguageProcessor;
import USU.CS.Utils.Util;


public class RankingKeywordAnalyzer {

    private static final HashSet<String> POSTAG_OF_NVA = new HashSet<>(
            Arrays.asList(new String[]{ "ADJP", "JJ", "JJR", "JJS"}));

    public static List<Map.Entry> extractKeyWordsAllMethods(Map<String, Word> voc, List<String> appIDList,boolean negative) throws Throwable {
        Map<Word, Double> rankedKeywords = new HashMap<>();
        Set<String> stopwords = NatureLanguageProcessor.getInstance()
                .getStopWordSet();
        // build voc for the app ID list
        System.out.println("Start to find keywords from the App List:" + appIDList.toString());
        System.out.println("Start to rank keywords");

        int n = 5, wcount = 0;
        int lengthNA = 0, stopNA = 0, NumericNA = 0, POSNA = 0, statNA = 0;
        for (Entry<String, Word> entry : voc.entrySet()) {
            wcount++;
            Word w = entry.getValue();
            if (stopwords.contains(w.toString())) {
                stopNA++;
                continue;
            }
            if (w.toString().length() < 3) {
                lengthNA++;
                continue;
            }
            if (Util.isNumeric(w.toString())) {
                NumericNA++;
                continue;
            }
            if (!POSTAG_OF_NVA.contains(w.getPOS())) {
                POSNA++;
                continue;
            }
            int[] count = w.getCountByRating();

            double sum = 0;
            for (int i = 0; i < n; i++) {
                sum += count[i];
            }

            if (sum < 21 || (count[0] + count[1]) < 21) {
                statNA++;
                continue;
            }
            double[] ratio = ratio(count[0], count[1], count[2], count[3],
                    count[4],negative);
            rankedKeywords.put(w, ratio[1]);
        }
        List sortedKeyword = new ArrayList(rankedKeywords.entrySet());

        Collections.sort(sortedKeyword, new Comparator() {
            public int compare(Object obj1, Object obj2) {
                return ((Comparable) ((Map.Entry) (obj2)).getValue()).compareTo(((Map.Entry) (obj1)).getValue());
            }
        });
        System.out.println("Done ranking for total keywords of " + wcount);
        System.out.println("Length less than 3: " + lengthNA);
        System.out.println("Stopwords: " + stopNA);
        System.out.println("nummeric: " + NumericNA);
        System.out.println("POS tag not right: " + POSNA);
        System.out.println("statistic not enough: " + statNA);
        System.out.println("ACtual Keywords left " + sortedKeyword.size());
        return sortedKeyword;
    }

    public static Map<String, Double> extractWordWeights_standard(Map<String, Word> voc, List<String> appIDList) throws Throwable {
        Map<Word, Double> rankedKeywords = new HashMap<>();
        // build voc for the app ID list
        System.out.println("Start to find keywords from the App List:" + appIDList.toString());
        System.out.println("Start to rank keywords");

        int n = 5, wcount = 0;
        int sum = 0;
        for (Entry<String, Word> entry : voc.entrySet()) {
            wcount++;
            Word w = entry.getValue();
            if (w.toString().length() < 3) {
                continue;
            }
            if (Util.isNumeric(w.toString())) {
                continue;
            }
            int[] count = w.getCountByRating();

            double[] ratio = ratio(count[0], count[1], count[2], count[3],
                    count[4],true);
            if (ratio[1] < 0) {
                ratio[1] *= -1;
            }
            if (ratio[1] == 0) {
                ratio[1] = 0.00001;
            }
            rankedKeywords.put(w, Math.log(ratio[1]));
            sum += ratio[1];
        }
        // score = (x-mean)/standard deviation
        int N = rankedKeywords.size();
        double mean = (double) sum / N;
        double standardDeviation = 0;
        for (Entry<Word, Double> entry : rankedKeywords.entrySet()) {
            standardDeviation += (entry.getValue() - mean) * (entry.getValue() - mean);
        }
        standardDeviation = Math.sqrt(standardDeviation / N);

        PrintWriter outfileWeight = new PrintWriter("D:\\projects\\MARK\\TestData\\phraseExperiments\\wordScoreDistribution.csv");
        outfileWeight.println("word,weight,score,mean,standardDev");
        Map<String, Double> resultWeights = new HashMap<>();
        for (Entry<Word, Double> entry : rankedKeywords.entrySet()) {
            double weight = (entry.getValue() - mean) / standardDeviation;
            if (weight < 0) {
                weight *= -1;
            }
            if (weight > 1) {
                weight = 1;
            }
            outfileWeight.println(entry.getKey() + "," + weight + "," + entry.getValue() + "," + mean + "," + standardDeviation);
            resultWeights.put(entry.getKey().toString(), weight);
        }
        outfileWeight.close();

        return resultWeights;
    }

    public static Map<String, Double> extractWordWeights_rank(Map<String, Word> voc, List<String> appIDList) throws Throwable {
        Map<Word, Double> rankedKeywords = new HashMap<>();
        // build voc for the app ID list
        System.out.println("Start to find keywords from the App List:" + appIDList.toString());
        System.out.println("Start to rank keywords");

        int n = 5, wcount = 0;
        int sum = 0;
        for (Entry<String, Word> entry : voc.entrySet()) {
            wcount++;
            Word w = entry.getValue();
            if (w.toString().length() < 3) {
                continue;
            }
            if (Util.isNumeric(w.toString())) {
                continue;
            }
            int[] count = w.getCountByRating();

            double[] ratio = ratio(count[0], count[1], count[2], count[3],
                    count[4],true);
            rankedKeywords.put(w, ratio[1]);
            sum += ratio[1];
        }
        // score = (x-mean)/standard deviation
        int N = rankedKeywords.size();
        List<Entry<Word, Double>> sortedKeyword = new ArrayList(rankedKeywords.entrySet());

        Collections.sort(sortedKeyword, new Comparator() {
            public int compare(Object obj1, Object obj2) {
                return ((Comparable) ((Map.Entry) (obj2)).getValue()).compareTo(((Map.Entry) (obj1)).getValue());
            }
        });

        Map<String, Double> resultWeights = new HashMap<>();

        for (int i = 0; i < N; i++) {
            resultWeights.put(sortedKeyword.get(i).getKey().toString(), (double) (N - i) / N);
        }
        return resultWeights;
    }

    private static double[] ratio(int x1, int x2, int x3, int x4, int x5, boolean negative) {
        double bad = x1 + x2 + 1;
        double good = x4 + x5 + 1;
        if(negative){
        double score = bad * (bad - good) / good;
        double ratio = bad / good;
        return new double[]{ratio, score};
        }else{
        double score = good * (good - bad) / bad;
        double ratio = good / bad;
        return new double[]{ratio, score};
            
        }

    }

    private static double skewness(int[] x) {
        double[] prob = new double[x.length];
        double sum = 0;
        double mean = 0.0;
        for (int i = 0; i < x.length; i++) {
            sum += x[i];
            mean += x[i] * (1 + i);
        }
        mean = mean / sum;

        double m3 = 0; // sample third central moment
        double s3 = 0; // cubic of sample standard deviation.

        for (int i = 0; i < x.length; i++) {
            prob[i] = (double) x[i] / sum;
        }

        for (int i = 0; i < x.length; i++) {
            m3 += prob[i] * Math.pow(i + 1 - mean, 3.0);
            s3 += prob[i] * Math.pow(i + 1 - mean, 2.0);
        }

        s3 = Math.pow(s3, 1.5);

        return m3 / s3 * Math.log(sum);
    }

    // R
    private static double pearsonCorrelation(int[] x) {
        double mean = 0;
        double xybar = 0;
        double ysqbar = 0;
        for (int i = 0; i < 5; i++) {
            mean += (double) x[i] / 5;
            xybar += ((double) x[i] * (1 + i)) / 5;
            ysqbar += ((double) x[i] * x[i]) / 5;
        }
        double numerator = (xybar - 3 * mean);
        double denominator = Math.sqrt(2 * (ysqbar - mean * mean));
        if (denominator == Double.NaN) {
            return 0;
        }
        return numerator / denominator;
    }

}
