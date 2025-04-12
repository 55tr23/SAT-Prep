import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

interface ProgressChartProps {
  mathScore: number;
  verbalScore: number;
}

const ProgressChart: React.FC<ProgressChartProps> = ({ mathScore, verbalScore }) => {
  // Sample data with mock history (would be stored in real app)
  const data = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        data: [
          Math.max(0, mathScore - Math.floor(Math.random() * 30)),
          Math.max(0, mathScore - Math.floor(Math.random() * 25)),
          Math.max(0, mathScore - Math.floor(Math.random() * 20)),
          Math.max(0, mathScore - Math.floor(Math.random() * 15)),
          Math.max(0, mathScore - Math.floor(Math.random() * 10)),
          mathScore,
        ],
        color: (opacity = 1) => `rgba(66, 133, 244, ${opacity})`,
        strokeWidth: 2,
      },
      {
        data: [
          Math.max(0, verbalScore - Math.floor(Math.random() * 30)),
          Math.max(0, verbalScore - Math.floor(Math.random() * 25)),
          Math.max(0, verbalScore - Math.floor(Math.random() * 20)),
          Math.max(0, verbalScore - Math.floor(Math.random() * 15)),
          Math.max(0, verbalScore - Math.floor(Math.random() * 10)),
          verbalScore,
        ],
        color: (opacity = 1) => `rgba(239, 83, 80, ${opacity})`,
        strokeWidth: 2,
      },
    ],
    legend: ['Math', 'Verbal'],
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
    },
  };

  const screenWidth = Dimensions.get('window').width - 32 - 32; // Full width minus padding

  const getTotalScore = () => {
    return mathScore + verbalScore;
  };

  const getScoreColor = (score: number) => {
    if (score < 40) return '#ef4444'; // red
    if (score < 70) return '#f59e0b'; // yellow
    return '#10b981'; // green
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLabel}>Math</Text>
          <Text style={[styles.scoreValue, { color: getScoreColor(mathScore) }]}>
            {mathScore}%
          </Text>
        </View>
        <View style={styles.totalScoreContainer}>
          <Text style={styles.totalScoreLabel}>Total</Text>
          <Text style={styles.totalScoreValue}>
            {(getTotalScore() / 2).toFixed(0)}%
          </Text>
        </View>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLabel}>Verbal</Text>
          <Text style={[styles.scoreValue, { color: getScoreColor(verbalScore) }]}>
            {verbalScore}%
          </Text>
        </View>
      </View>

      <LineChart
        data={data}
        width={screenWidth}
        height={180}
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
        withInnerLines={false}
        withOuterLines={true}
        withDots={true}
        withShadow={false}
        fromZero={true}
        segments={4}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalScoreContainer: {
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  totalScoreLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  totalScoreValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});

export default ProgressChart; 