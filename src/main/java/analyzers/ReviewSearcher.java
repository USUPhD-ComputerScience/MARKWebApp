package analyzers;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;


import NLP.WordVec;
import datastores.ApplicationManager;
import datastores.Vocabulary;
import mark.Application;
import models.ReviewForAnalysis;
import models.Word;

public class ReviewSearcher {

    public static List search(Map<String, Word> voc, Set<String> keywords, List<String> appIDList, WordVec word2vec)
            throws Throwable {
        Map<ReviewForAnalysis, Double> resReviews = new HashMap<>();
        System.out.println("> Searching...");
        ApplicationManager appMan = ApplicationManager.getInstance();

        List<Application> appList = appMan.getSelectedApps(appIDList);
        for (Application app : appList) {
            for (ReviewForAnalysis rev : app.getReviews()) {
                // test

                HashMap<String, Double> foundKey = new HashMap<>();
                for (Word word : rev.getWordList()) {
                    String wstr = word.toString();
                    if (wstr.equals("") || wstr.equals("'")) {
                        continue;
                    }

                    if (keywords.contains(wstr)) {
                        Double tfidf = foundKey.get(wstr);
                        if (tfidf == null) {
                            foundKey.put(wstr, 1.0);
                        } else {
                            foundKey.put(wstr, tfidf + 1.0);
                        }
                    }
                }
                if (foundKey.size() < 1) {
                    continue;
                }

                resReviews.put(rev, cosineSimilarityOfTFIDF(voc, keywords, foundKey, true));
            }

        }
        List sortedReviews = new ArrayList(resReviews.entrySet());

        Collections.sort(sortedReviews, new Comparator() {
            public int compare(Object obj1, Object obj2) {
                return ((Comparable) ((Map.Entry) (obj2)).getValue()).compareTo(((Map.Entry) (obj1)).getValue());
            }
        });
        System.out.println("> Done!");

        //test idea of finding sentence
        findingBestMatchedSentence(resReviews, keywords, word2vec, appIDList, voc);
        return sortedReviews;
    }

    private static void findingBestMatchedSentence(
            Map<ReviewForAnalysis, Double> resReviews,
            Set<String> keywords, WordVec word2vec, List<String> appIDList, Map<String, Word> voc) throws Throwable {
        // extract sentence
        Set<Sentence> sentenceSet = new HashSet<>();
        Vocabulary originalVoc = Vocabulary.getInstance();
        for (ReviewForAnalysis rev : resReviews.keySet()) {
            int[][] sentencesInIDform = rev.getSentences();
            for (int i = 0; i < sentencesInIDform.length; i++) {
                String[] sentence = new String[sentencesInIDform[i].length];
                if (sentence.length < 2) {
                    continue;
                }
                for (int j = 0; j < sentencesInIDform[i].length; j++) {
                    sentence[j] = originalVoc.getWord(sentencesInIDform[i][j], rev.getApp(), false).toString();
                }
                sentenceSet.add(new Sentence(sentence));
            }
        }
        // do the THING
        Map<String, Double> wordScore = RankingKeywordAnalyzer.extractWordWeights_standard(voc, appIDList);
        Set<Sentence> selection = new HashSet<>();
        String[] keywordSequence = new String[keywords.size()];
        int k = 0;
        for (String word : keywords) {
            keywordSequence[k++] = word;
        }
        Sentence initial = new Sentence(keywordSequence);
        autoExploreSentence(sentenceSet, word2vec, initial, 0.9, wordScore);

    }

    public static void autoExploreSentence(Set<Sentence> sentenceSet,
            WordVec word2vec, Sentence selection, double threshold, Map<String, Double> wordScore) throws Throwable {
        System.out.println("Total number of Sentence: " + sentenceSet.size());
        System.out.println(">>Start!");
        List<Sentence> results = findTopSimilarSentence_monopoly(sentenceSet, word2vec, selection, 10, wordScore, threshold);
        for (Sentence sen : results) {
            double sim = sentenceSimilarity_doubleComplement(selection, sen, word2vec, wordScore, true);
            System.out.println(sen.toString() + "," + sim);
        }
    }

    private static List<Sentence> findTopSimilarSentence_monopoly(Set<Sentence> sentenceSet, WordVec word2vec, Sentence selection,
            int top, Map<String, Double> wordScore, double threshold) {
        Sentence[] sentences = new Sentence[top];
        double[] cosineDistance = new double[top];
        //Vocabulary vins = Vocabulary.getInstance();
        //NatureLanguageProcessor ntlins = NatureLanguageProcessor.getInstance();
        for (Sentence sen2 : sentenceSet) {
            if (selection.equals(sen2)) {
                continue;
            }

            double result = sentenceSimilarity_doubleComplement(selection, sen2, word2vec, wordScore, false);
            if (result < threshold) {
                continue;
            }
            //System.out.println(result);
            //System.out.println(result);
            for (int i = 0; i < top; i++) {

                //System.out.println(" for (int i = 0; i < top; i++) {" + result + " - " + cosineDistance[i]);
                if (result > cosineDistance[i]) {
                    double lastDistance = cosineDistance[i];
                    Sentence lastSentence = sentences[i];
                    cosineDistance[i] = result;
                    sentences[i] = sen2;
                    double currentDistance = lastDistance;
                    Sentence currentSentence = lastSentence;
                    for (int j = i + 1; j < top; j++) {
                        lastDistance = cosineDistance[j];
                        lastSentence = sentences[j];
                        cosineDistance[j] = currentDistance;
                        if (currentSentence == null) {
                            sentences[j] = null;
                        } else {
                            sentences[j] = currentSentence;
                        }
                        currentDistance = lastDistance;
                        currentSentence = lastSentence;
                        //System.out.println(" currentWord = lastWord;->" + words[i]);
                        //System.out.println(" currentWord = lastWord;->" + currentWord);
                    }
                    break;
                } else {
                    continue;
                }
            }
        }
        List<Sentence> results = new ArrayList<>();
        for (int i = 0; i < top; i++) {
            if (sentences[i] != null) {
                results.add(sentences[i]);
            }
        }
        return results;
    }

    private static double avgSimilarity(Collection<Sentence> selection, WordVec word2vec, Map<String, Double> wordScore) {
        double totalSim = 0;
        int count = 0;
        for (Sentence sen1 : selection) {
            for (Sentence sen2 : selection) {
                if (sen1 != sen2) {
                    totalSim += sentenceSimilarity_doubleComplement(sen1, sen2, word2vec, wordScore, false);
                    count++;
                }
            }
        }
        if (totalSim == 0) {
            return 0;
        }
        return totalSim / count;
    }

    private static List<Sentence> findTopSimilarSentence_average(Set<Sentence> sentenceSet, WordVec word2vec, Set<Sentence> selection,
            int top, Map<String, Double> wordScore) {
        Sentence[] sentences = new Sentence[top];
        double[] cosineDistance = new double[top];
        //Vocabulary vins = Vocabulary.getInstance();
        //NatureLanguageProcessor ntlins = NatureLanguageProcessor.getInstance();
        for (Sentence sen2 : sentenceSet) {
            if (selection.contains(sen2)) {
                continue;
            }

            double result = cosineSimilarityForSentence(selection, sen2, word2vec, wordScore);
            //System.out.println(result);
            //System.out.println(result);
            for (int i = 0; i < top; i++) {

                //System.out.println(" for (int i = 0; i < top; i++) {" + result + " - " + cosineDistance[i]);
                if (result > cosineDistance[i]) {
                    double lastDistance = cosineDistance[i];
                    Sentence lastSentence = sentences[i];
                    cosineDistance[i] = result;
                    sentences[i] = sen2;
                    double currentDistance = lastDistance;
                    Sentence currentSentence = lastSentence;
                    for (int j = i + 1; j < top; j++) {
                        lastDistance = cosineDistance[j];
                        lastSentence = sentences[j];
                        cosineDistance[j] = currentDistance;
                        if (currentSentence == null) {
                            sentences[j] = null;
                        } else {
                            sentences[j] = currentSentence;
                        }
                        currentDistance = lastDistance;
                        currentSentence = lastSentence;
                        //System.out.println(" currentWord = lastWord;->" + words[i]);
                        //System.out.println(" currentWord = lastWord;->" + currentWord);
                    }
                    break;
                } else {
                    continue;
                }
            }
        }
        List<Sentence> results = new ArrayList<>();
        for (int i = 0; i < top; i++) {
            results.add(sentences[i]);
        }
        return results;
    }

    public static double cosineSimilarityForSentence(Set<Sentence> sentences,
            Sentence sen2, WordVec word2vec, Map<String, Double> wordScore) {
        double score = 1.0;
        for (Sentence sen1 : sentences) {
            double sim = sentenceSimilarity_doubleComplement(sen1, sen2, word2vec, wordScore, false);
            if (sim == 0) {
                //System.out.println("ALERT SIM == 0");
            }
            score *= (1.0 - sim);
        }
        if (score == 0) {
            //System.out.println("ALERT SCORE == 0");
        }
        return 1.0 - score;
    }

    public static double sentenceSimilarity_doubleComplement(Sentence firstSentence,
            Sentence secondSentence, WordVec word2vec, Map<String, Double> wordScore, boolean debug) {
        if (firstSentence == null || secondSentence == null) {
            return 0;
        }
        String[] firstWordArray = firstSentence.mWordSequence;
        String[] secondWordArray = secondSentence.mWordSequence;
        double finalSim = 1;
        for (int j = 0; j < firstWordArray.length; j++) {
            Double score1 = wordScore.get(firstWordArray[j]);
            if (score1 == null) {
                score1 = 0d;
            }
//            if(score1 > 1)
//                score1 = new Double(1);
            float[] vectorWord1 = word2vec.getVectorForWord(firstWordArray[j]);
            if (vectorWord1 == null) {
                continue;
            }
            if (debug) {
                System.out.println("First Word = " + firstWordArray[j]);
            }
            double sequenceSim = 0;
            for (int i = 0; i < secondWordArray.length; i++) {
                Double score2 = wordScore.get(secondWordArray[i]);
                if (score2 == null) {
                    score2 = 0d;
                }
                //System.out.println("score1 = " + score1 + "; score2 = " + score2);
                float[] vectorWord2 = word2vec.getVectorForWord(secondWordArray[i]);
                if (vectorWord2 == null) {
                    continue;
                }
                double localSim = score1 * score2 * word2vec.cosineSimilarityForVectors(vectorWord1, vectorWord2, true);
                //System.out.println("localSim = " + localSim);
//                if (localSim == 1) {
//                    localSim = 0.999;
//                }
                if (sequenceSim < localSim) {
                    sequenceSim = localSim;
                    if (debug) {
                        System.out.println("Second Word = " + secondWordArray[i]);
                    }
                }
                //sequenceSim *= (1 - score1 * score2 * localSim);
                //System.out.println("sequenceSim = " + sequenceSim);
            }
            if (sequenceSim == 1) {
                sequenceSim = 0.999;
                //System.out.println("ALERT: sequence " + firstWordArray[j] + "---" + secondSentence.toString());
            }
            //sequenceSim = 1 - sequenceSim;
            //System.out.println(">>>>>>>>sequenceSim = " + sequenceSim);
            finalSim *= (1 - sequenceSim);
            //System.out.println("finalSim = " + finalSim);
        }
        if (finalSim == 1) {
            finalSim = 0.999;
            //System.out.println("ALERT: finalSim " + firstSentence.toString() + "---" + secondSentence.toString());
        }
        finalSim = 1 - finalSim;
        //System.out.println("______________finalSim = " + finalSim);
        return finalSim;
    }

    private static double cosineSimilarityOfTFIDF(Map<String, Word> voc, Set<String> keys,
            HashMap<String, Double> foundKey, boolean normalize) {

        double[] vector1 = new double[keys.size()];
        double[] vector2 = new double[keys.size()];
        int index = 0;
        Vocabulary vins = Vocabulary.getInstance();
        for (String key : keys) {
            Word keyWord = vins.getWord(voc, key);
            int keyWordCount = keyWord.getCount();

            vector1[index] = 1 / (1 + Math.log(keyWordCount));
            Double freq = foundKey.get(key);
            if (freq != null) {
                vector2[index] = freq / (1 + Math.log(keyWordCount));
            } else {
                vector2[index] = 0.0;
            }
            index++;
        }
        double sim = 0, square1 = 0, square2 = 0;
        if (vector1 == null || vector2 == null) {
            return 0;
        }
        for (int i = 0; i < vector1.length; i++) {
            square1 += vector1[i] * vector1[i];
            square2 += vector2[i] * vector2[i];
            sim += vector1[i] * vector2[i];
        }
        if (!normalize) {
            return sim / Math.sqrt(square1) / Math.sqrt(square2);
        } else {
            return (1 + sim / Math.sqrt(square1) / Math.sqrt(square2)) / 2;
        }
    }

    public static class Sentence {

        public String[] mWordSequence = null;
        private String mSentence = null;
        private int hash = 0;

        public Sentence(String[] sentence) {
            mWordSequence = sentence;
            StringBuilder strb = new StringBuilder();
            for (String word : sentence) {
                hash += word.hashCode();
                strb.append(word).append(" ");
            }
            mSentence = strb.toString().substring(0, strb.length() - 1);
        }

        @Override
        public int hashCode() {
            return hash; //To change body of generated methods, choose Tools | Templates.
        }

        @Override
        public boolean equals(Object obj) {
            if (obj instanceof Sentence) {
                Sentence sen2 = (Sentence) obj;
                if (mWordSequence.length != sen2.mWordSequence.length) {
                    return false;
                }
                for (int i = 0; i < mWordSequence.length; i++) {
                    if (!mWordSequence[i].equals(sen2.mWordSequence[i])) {
                        return false;
                    }
                }
                return true;
            } else {
                return false;
            }
        }

        @Override
        public String toString() {

            return mSentence; //To change body of generated methods, choose Tools | Templates.
        }
    }
}
