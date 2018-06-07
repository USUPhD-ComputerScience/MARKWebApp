package analyzers;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.PrintWriter;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Scanner;
import java.util.Set;

import datastores.Vocabulary;
import mark.Application;

import java.util.Map.Entry;

import models.Word;
public class TimeAnalyzer {

    public static final long MONTHMILIS = 2592000000L;
    public static final long HOURMILIS = 3600000L;
    public static final long DAYMILIS = 86400000L;

    public static StringBuilder analyzeTime(Set<String> wordSet, Map<String, Word> voc, Application repApp) throws Throwable {
        // calculate the timeseries for set
        //   return null;
        int days = 250;//repApp.getDayIndex();
        long startDate = repApp.getStartDate();
        Vocabulary vins = Vocabulary.getInstance();
//        for (String word : wordSet) {
//            Word w = vins.getWord(voc, word);
//            if (w == null) {
//                continue;
//            }
//            int num = w.getCurrentDay();
//            if (num == 0) {
//                continue;
//            }
//            if (num < days) {
//                days = num;
//            }
//        }
        System.out.println("days = " + days);
        long[][] timeseries = new long[5][days];
        for (String word : wordSet) {
            Word w = vins.getWord(voc, word);
            if (w == null) {
                continue;
            }
            timeseries[0] = accumulateTimeseries(w.getCountByDay_R1(), startDate, timeseries, 0);
            //System.out.println(Arrays.toString(timeseries[0]));
            timeseries[1] = accumulateTimeseries(w.getCountByDay_R2(), startDate, timeseries, 1);
            timeseries[2] = accumulateTimeseries(w.getCountByDay_R3(), startDate, timeseries, 2);
            timeseries[3] = accumulateTimeseries(w.getCountByDay_R4(), startDate, timeseries, 3);
            timeseries[4] = accumulateTimeseries(w.getCountByDay_R5(), startDate, timeseries, 4);
        }

        // calc moving avr 
        long allRating[] = new long[timeseries[0].length];
        for (int i = 0; i < 5; i++) {
            for (int k = 0; k < timeseries[i].length; k++) {
                allRating[k] += timeseries[i][k];
            }
        }
        // calc moving average
        float[] movingAvr = calcMovingAverage(allRating, 20);
        // calc standard deviation
        double[] ratios = new double[allRating.length];
        double sigma = calcStandardDeviation(allRating, movingAvr);
        for (int k = 0; k < allRating.length; k++) {
            double error = allRating[k] - movingAvr[k];
            if (sigma != 0) {
                ratios[k] = error / sigma;
            }
        }
        //(1420095600000 = first of jan 2015)
        return makeXMLResult(allRating, movingAvr, ratios, convertTime(1420095600000l));
    }

    private static long[] accumulateTimeseries(Map<Long, Long> countMap, long startDate, long[][] timeseries, int rate) {
//        if (rate == 0) {
//            System.out.println("map: "+countMap.values().toString());
//        }
        long[] temp = new long[timeseries[rate].length];
        System.arraycopy(temp, 0, timeseries[rate], 0, timeseries[rate].length);
        for (Entry<Long, Long> entry : countMap.entrySet()) {
            int dayIndex = (int) ((entry.getKey() - startDate) / Application.DAYMILIS);
            temp[dayIndex] += entry.getValue();
        }
        return temp;
    }

    private static StringBuilder makeXMLResult(long allRating[], float[] movingAvr, double[] ratios, String firstDay) {
        if (allRating == null || movingAvr == null || ratios == null) {
            return null;
        }
        StringBuilder res = new StringBuilder();
        res.append("<timeseries>");
        res.append("<startdate>" + firstDay + "</startdate>");
        res.append("<data>");
        int loop = allRating.length;
        for (int i = 0; i < loop; i++) {
            res.append("<day>");
            res.append("<count>" + allRating[i] + "</count>");
            res.append("<movingavr>" + movingAvr[i] + "</movingavr>");
            res.append("<ratio>" + ratios[i] + "</ratio>");
            res.append("</day>");
        }
        res.append("</data>");
        res.append("</timeseries>");
        return res;
    }

    private static String convertTime(long milis) {
        return new SimpleDateFormat("YYYY-MM-DD").format(new Date(milis));
    }

    private static long convertTime(String time) throws Throwable {
        SimpleDateFormat f = new SimpleDateFormat("MMM dd,yyyy");
        Date date = (Date) f.parse(time);
        return date.getTime();
    }

    public static double calcStandardDeviation(long[] timeseries, float[] means) {
        double sigma = 0;
        for (int i = 0; i < timeseries.length; i++) {
            sigma += (timeseries[i] - means[i]) * (timeseries[i] - means[i]);
        }
        sigma = Math.sqrt(sigma / timeseries.length);
        return sigma;
    }

    public static float[] calcMovingAverage(long[] timeseries, int period) {
        float[] avr = new float[timeseries.length];
        avr[0] = timeseries[0];
        for (int i = 1; i < timeseries.length; i++) {
            int k = Math.max(0, i - period);
            int sum = 0;
            for (int j = k; j < i; j++) {
                sum += timeseries[j];
            }
            avr[i] = sum / (i - k);
        }

        return avr;
    }

}
