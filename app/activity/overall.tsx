import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type TimeRange = 'day' | 'week' | 'month';

export default function OverallActivity() {
  const [timeRange, setTimeRange] = useState<TimeRange>('month');

  const getDateRange = () => {
    const now = new Date();
    if (timeRange === 'day') {
      return now.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    } else if (timeRange === 'week') {
      const start = new Date(now);
      start.setDate(now.getDate() - 7);
      return `${start.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })} - ${now.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })}`;
    } else {
      return `${now.toLocaleDateString('en-US', {
        month: 'short',
      })} 1 - ${now.toLocaleDateString('en-US', { month: 'short' })} ${new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0
      ).getDate()}`;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.subtitle}>Your Activity Data</Text>

        <View style={styles.timeRangeContainer}>
          <TouchableOpacity
            style={[
              styles.timeRangeButton,
              timeRange === 'day' && styles.activeTimeRange,
            ]}
            onPress={() => setTimeRange('day')}
          >
            <Text
              style={[
                styles.timeRangeText,
                timeRange === 'day' && styles.activeTimeRangeText,
              ]}
            >
              TODAY
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.timeRangeButton,
              timeRange === 'week' && styles.activeTimeRange,
            ]}
            onPress={() => setTimeRange('week')}
          >
            <Text
              style={[
                styles.timeRangeText,
                timeRange === 'week' && styles.activeTimeRangeText,
              ]}
            >
              WEEK
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.timeRangeButton,
              timeRange === 'month' && styles.activeTimeRange,
            ]}
            onPress={() => setTimeRange('month')}
          >
            <Text
              style={[
                styles.timeRangeText,
                timeRange === 'month' && styles.activeTimeRangeText,
              ]}
            >
              MONTH
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.dateRange}>{getDateRange()}</Text>

        <View style={styles.statsContainer}>
          <View style={styles.circleContainer}>
            <View style={styles.circle}>
              <Text style={styles.circleNumber}>32</Text>
              <Text style={styles.circleLabel}>Classes</Text>
            </View>
          </View>

          <View style={styles.additionalStats}>
            <View style={styles.statItem}>
              <MaterialCommunityIcons
                name="shoe-print"
                size={24}
                color="#666666"
              />
              <Text style={styles.statLabel}>Steps Taken</Text>
              <Text style={styles.statValue}>12,458</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="fire" size={24} color="#666666" />
              <Text style={styles.statLabel}>Calories Burned</Text>
              <Text style={styles.statValue}>847</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.connectButton}>
          <Text style={styles.connectButtonText}>Connect Fitness Tracker</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    padding: 20,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 20,
    textAlign: 'center',
  },
  timeRangeContainer: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 25,
    padding: 4,
    marginBottom: 20,
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
  },
  activeTimeRange: {
    backgroundColor: '#ffffff',
  },
  timeRangeText: {
    color: '#666666',
    fontSize: 14,
    fontWeight: '600',
  },
  activeTimeRangeText: {
    color: '#000000',
    fontWeight: '800',
  },
  dateRange: {
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 30,
  },
  statsContainer: {
    alignItems: 'center',
  },
  circleContainer: {
    marginBottom: 40,
  },
  circle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 8,
    borderColor: '#b0fb50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  circleLabel: {
    fontSize: 18,
    color: '#666666',
  },
  additionalStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#1a1a1a',
    marginHorizontal: 20,
  },
  statLabel: {
    color: '#666666',
    fontSize: 14,
    marginVertical: 8,
  },
  statValue: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
  },
  connectButton: {
    backgroundColor: '#b0fb50',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    marginTop: 40,
  },
  connectButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
