import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const HISTORY_DATA = [
  {
    id: '1',
    date: 'Wednesday, Feb 12th',
    time: '12:00 pm',
    duration: '60min',
    type: 'OTHER',
    title: 'Club Check In',
    location: 'EG Wellbeing | EG Wellbeing...',
    instructor: 'w/ Fitness Seattle',
  },
  {
    id: '2',
    date: 'Monday, Feb 10th',
    time: '12:00 pm',
    duration: '60min',
    type: 'OTHER',
    title: 'Club Check In',
    location: 'EG Wellbeing | EG Wellbeing...',
    instructor: 'w/ Fitness Seattle',
  },
  {
    id: '3',
    date: 'Wednesday, Feb 5th',
    time: '1:00 pm',
    duration: '60min',
    type: 'OTHER',
    title: 'Club Check In',
    location: 'EG Wellbeing | EG Wellbeing...',
    instructor: 'w/ Fitness Seattle',
  },
];

export default function ClassHistory() {
  const renderItem = ({ item }) => (
    <View style={styles.historyItem}>
      <Text style={styles.date}>{item.date}</Text>
      <View style={styles.classCard}>
        <View style={styles.classInfo}>
          <View style={styles.timeContainer}>
            <Text style={styles.time}>{item.time}</Text>
            <Text style={styles.duration}>({item.duration})</Text>
          </View>
          <View style={styles.classDetails}>
            <Text style={styles.type}>{item.type}</Text>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.location}>{item.location}</Text>
            <Text style={styles.instructor}>{item.instructor}</Text>
          </View>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.moreButton}>
            <MaterialCommunityIcons name="dots-horizontal" size={24} color="#666666" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.bookAgainButton}>
            <Text style={styles.bookAgainText}>Book Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={HISTORY_DATA}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  listContent: {
    padding: 20,
  },
  historyItem: {
    marginBottom: 24,
  },
  date: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 12,
  },
  classCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
  },
  classInfo: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timeContainer: {
    marginRight: 16,
  },
  time: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
  },
  duration: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
  },
  classDetails: {
    flex: 1,
  },
  type: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  instructor: {
    fontSize: 14,
    color: '#666666',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#333333',
    paddingTop: 16,
  },
  moreButton: {
    padding: 4,
  },
  bookAgainButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#b0fb50',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  bookAgainText: {
    color: '#b0fb50',
    fontSize: 14,
    fontWeight: '600',
  },
});