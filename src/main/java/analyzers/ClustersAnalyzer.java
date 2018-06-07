package analyzers;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;
import java.util.Set;
import javax.swing.JFrame;
import javax.swing.JPanel;

import clustering.AverageLinkageStrategy;
import clustering.Cluster;
import clustering.ClusteringAlgorithm;
import clustering.DefaultClusteringAlgorithm;
import visualization.DendrogramPanel;

import com.itextpdf.text.Document;
import com.itextpdf.text.PageSize;
import com.itextpdf.text.pdf.PdfContentByte;
import com.itextpdf.text.pdf.PdfTemplate;
import com.itextpdf.text.pdf.PdfWriter;

import USU.CS.NLP.NatureLanguageProcessor;
import USU.CS.NLP.WordVec;
import USU.CS.Utils.Util;

import java.awt.BorderLayout;
import java.awt.Dimension;
import java.awt.Graphics2D;
import java.io.FileOutputStream;
import java.io.IOException;

public class ClustersAnalyzer {

    static private ArrayList<Item> words = null;

    public static List<List<String>> clusterWords(List<String> wordList, WordVec word2vec)
            throws Throwable {
        //System.out.println("> Read data from test files");
        loadTestSet(wordList, word2vec);
        List<List<String>> resultClusters = new ArrayList<>();
        for (List<Clusterable> cluster : cluster()) {
            List<String> res = new ArrayList<>();
            for (Clusterable item : cluster) {
                Item it = (Item) item;
                res.add(it.toString());
            }
            if (!res.isEmpty()) {
                resultClusters.add(res);
            }
        }
        return resultClusters;
    }

    public static void clusterwords_hierachical(String testFile,
            String vectorFile, int topWords, String outputFile)
            throws Throwable {
        WordVec word2vec;
        word2vec = new WordVec(vectorFile);
        System.out.println("> Reading top " + topWords + " keywords from file: "
                + testFile);
        ArrayList<Item> wordList = loadTestSet(new File(testFile), topWords,
                word2vec);
        cluster_hierachical(wordList, outputFile);
        System.out.println("> Done!");
    }

    private static ArrayList<Item> loadTestSet(File file, int topWords,
            WordVec word2vec) throws FileNotFoundException {
        // TODO Auto-generated method stub
        ArrayList<Item> words = new ArrayList<>();
        Scanner br = new Scanner(new FileReader(file));
        String first = br.nextLine();
        Set<String> stopwords = NatureLanguageProcessor.getInstance()
                .getStopWordSet();
        int count = 0;
        while (br.hasNextLine()) {
            String[] values = br.nextLine().split(",");
            if (values.length == 17) {
                String word = values[0];
                if (Util.isNumeric(word)) {
                    continue;
                }
                int p1 = (int) Double.parseDouble(values[1]);
                Item item = new Item(word, p1, word2vec);
                if (item.getVector() != null) {
                    words.add(item);
                }
                count++;
                if (count == topWords) {
                    break;
                }
            }
        }
        br.close();
        System.out.println(">> Done! Read " + count + " words!");
        return words;
    }

    private static void cluster_hierachical(ArrayList<Item> words,
            String filename) throws IOException {
        // TODO Auto-generated method stub
        int numberOfWords = words.size();
        if (numberOfWords == 0) {
            System.out.println("No word to cluster");
            return;
        }

        String[] names = new String[numberOfWords];
        double[][] vectors = new double[numberOfWords][];
        for (int i = 0; i < numberOfWords; i++) {
            names[i] = words.get(i).toString();
            vectors[i] = words.get(i).getVector();
        }

        ClusteringAlgorithm alg = new DefaultClusteringAlgorithm();
        Cluster cluster = alg.performClustering(computeDistanceMatrix(vectors),
                names, new AverageLinkageStrategy());

        DendrogramPanel dp = new DendrogramPanel();
        dp.setModel(cluster);
        javax.swing.SwingUtilities.invokeLater(new Runnable() {
            public void run() {
                createAndShowGUI(dp);
            }
        });
        // printToPDF(dp, new File(filename));
        PrintWriter pw = new PrintWriter(new FileWriter(filename));
        writeJson(pw, cluster);
        pw.close();
    }

    public static double[][] computeDistanceMatrix(double[][] vectors) {
        int dimension = vectors.length;
        double[][] distances = new double[dimension][dimension];
        for (int i = 0; i < dimension; i++) {
            for (int j = 0; j < dimension; j++) {
                distances[i][j] = KMeanClustering.cosineSimilarityForVectors(
                        vectors[i], vectors[j], true);
            }
        }
        return distances;
    }

    private static void createAndShowGUI(DendrogramPanel dp) {
        // Create and set up the window.
        JFrame frame = new JFrame("Hierarchical Clustering");
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);

        dp.setPreferredSize(new Dimension(300, 1000));
        frame.getContentPane().add(dp, BorderLayout.CENTER);
        // Display the window.
        frame.pack();
        frame.setVisible(true);
    }

    private static void printToPDF(DendrogramPanel dp, File outFile) {
        try {
            Document d = new Document(PageSize.A0);
            PdfWriter writer = PdfWriter.getInstance(d,
                    new FileOutputStream(outFile));
            d.open();

            PdfContentByte cb = writer.getDirectContent();
            PdfTemplate template = cb.createTemplate(PageSize.A0.getWidth() / 4,
                    PageSize.A0.getHeight());
            cb.addTemplate(template, 0, 0);

            Graphics2D g2d = template.createGraphics(PageSize.A0.getWidth() / 4,
                    PageSize.A0.getHeight());

            g2d.scale(0.5, 0.5);

            g2d.translate(dp.getBounds().x, dp.getBounds().y);
            if (dp instanceof JPanel) {
                dp.setBounds(0, 0, (int) PageSize.A0.getWidth() / 2,
                        (int) PageSize.A0.getHeight() * 2);
            }
            dp.paintAll(g2d);
            dp.addNotify();

            // for (int i = 0; i < dp.getComponents().length; i++) {
            // Component c = dp.getComponent(i);
            // if (c instanceof JLabel || c instanceof JScrollPane) {
            // g2d.translate(c.getBounds().x, c.getBounds().y);
            // if (c instanceof JScrollPane) {
            // c.setBounds(0, 0, (int) PageSize.A4.getWidth() * 2,
            // (int) PageSize.A4.getHeight() * 2);
            // }
            // c.paintAll(g2d);
            // c.addNotify();
            // System.err.println("done!");
            // }
            // }
            g2d.dispose();

            d.close();
        } catch (Exception e) {
            System.out.println(e.getStackTrace());
        }
    }

    private static void writeJson(PrintWriter pw, Cluster cluster) {
        List<Cluster> children = cluster.getChildren();
        if (children.size() == 0) {
            pw.print("{\"name\": \"" + cluster.getName() + "\", \"size\": 0}");
        } else {
            //pw.println("{");
            pw.println("{\"name\": \"" + cluster.getName() + "\",");
            pw.println("\"children\": [");
            for (int i = 0; i < children.size(); i++) {
                writeJson(pw, children.get(i));
                if (i != children.size() - 1) {
                    pw.println(",");
                } else {
                    pw.println();
                }
            }
            pw.println("]");
            pw.println("}");
        }
    }

    private static List<List<Clusterable>> cluster() throws Throwable {

        List<Clusterable> itemList = new ArrayList<>();
        if (words.isEmpty()) {
            return null;
        }
        for (Item word : words) {
            itemList.add(word);
        }
        List<List<Clusterable>> clusters = KMeanClustering.clusterBySimilarity(
                100, itemList, (int) Math.round(Math.sqrt(words.size() / 2)),
                KMeanClustering.COSINE_SIM);
        System.out.println("> Done!");
        return clusters;
//		List<List<Clusterable>> clusters = KMeanClustering.clusterBySimilarity(
//				100, itemList, 0.4, KMeanClustering.COSINE_SIM);
        //System.out.println("> Write clusters to file");
        //writeClustersToFile(clusters, file);
    }

    private static void writeClustersToFile(List<List<Clusterable>> clusters,
            File file) throws Throwable {
        PrintWriter pw = new PrintWriter(new FileWriter(file));

        for (List<Clusterable> cluster : clusters) {
            if (cluster.isEmpty()) {
                continue;
            }
            Item mainTopic = (Item) cluster.get(0);
            pw.print(mainTopic.toString() + ",");
            int totalCount = 0;
            String top = "";
            String second = "";
            double topscore = 0.0;
            for (Clusterable item : cluster) {
                Item word = (Item) item;
                pw.print("<" + word.toString() + ">");
                int frq = word.getFrequency();
                totalCount += frq;
                if (topscore < frq) {
                    topscore = frq;
                    second = top;
                    top = word.toString();
                }
            }
            pw.println("," + totalCount + "," + top + "_" + second + ","
                    + topscore);
        }
        pw.close();
    }

    private static void loadTestSet(List<String> wordList, WordVec word2vec) {
        // TODO Auto-generated method stub
        words = new ArrayList<>();
        int count = 0;
        for (String w : wordList) {
            Item item = new Item(w, 0, word2vec);
            if (item.getVector() != null) {
                words.add(item);
                count++;
            }

        }
//    Scanner br = new Scanner(new FileReader(file));
//    String first = br.nextLine();
//    Set<String> stopwords = NatureLanguageProcessor.getInstance()
//            .getStopWordSet();

//		while (br.hasNextLine()) {
//			String[] values = br.nextLine().split(",");
//			if (values.length == 10) {
//				String word = values[0];
//				if (stopwords.contains(word))
//					continue;
//				if (Util.isNumeric(word))
//					continue;
//				double ratio = (Double.parseDouble(values[1]) + Double
//						.parseDouble(values[2]))
//						/ (Double.parseDouble(values[4]) + Double
//								.parseDouble(values[5]));
//				if (ratio <= 1.2)
//					continue;
//				// if (Double.parseDouble(values[9]) <= 0.5)
//				// continue;
//				count++;
//				int ratioXDiff = (int) Double.parseDouble(values[9]);
//				Item item = new Item(word, ratioXDiff);
//				if (item.getVector() != null)
//					words.add(item);
//			}
//		}
//		br.close();
        System.out.println(">> Read " + count + " words!");
    }

    private static class Item extends Clusterable {

        double[] vector = null;
        int frequency;
        String word;
        boolean change = false;
        private WordVec word2vec;

        public Item(String str, int freq, WordVec word2vec) {
            // TODO Auto-generated constructor stub
            this.word2vec = word2vec;
            frequency = freq;
            word = str.intern();
            float[] tempVector = word2vec.getVectorForWord(word);
            if (tempVector != null) {
                vector = new double[WordVec.VECTOR_SIZE];
                for (int i = 0; i < WordVec.VECTOR_SIZE; i++) {
                    vector[i] = tempVector[i];
                }
            }
        }

        public String toString() {
            return word;
        }

        @Override
        public double[] getVector() {
            // TODO Auto-generated method stub
            return vector;
        }

        @Override
        public int getFrequency() {
            // TODO Auto-generated method stub
            return frequency;
        }

        @Override
        public void setChange(boolean isChanged) {
            // TODO Auto-generated method stub
            change = isChanged;
        }

        @Override
        public boolean isChanged() {
            // TODO Auto-generated method stub
            return change;
        }

    }
}
