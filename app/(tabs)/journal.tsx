import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight } from 'lucide-react-native';

export default function JournalScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Your Journal</Text>
        
        <View style={styles.entryCard}>
          <View style={styles.entryHeader}>
            <Text style={styles.entryDate}>Today, 2:30 PM</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>Needs Reflection</Text>
            </View>
          </View>
          <Text style={styles.entryTitle}>Handling Work Pressure</Text>
          <Text style={styles.entryPreview} numberOfLines={2}>
            Today I faced a challenging situation at work when a deadline was suddenly moved up...
          </Text>
          <TouchableOpacity style={styles.viewButton}>
            <Text style={styles.viewButtonText}>View Entry</Text>
            <ChevronRight size={20} color="#6366f1" />
          </TouchableOpacity>
        </View>

        <View style={styles.entryCard}>
          <View style={styles.entryHeader}>
            <Text style={styles.entryDate}>Yesterday</Text>
            <View style={[styles.statusBadge, styles.completedBadge]}>
              <Text style={[styles.statusText, styles.completedText]}>Reflected</Text>
            </View>
          </View>
          <Text style={styles.entryTitle}>Family Discussion</Text>
          <Text style={styles.entryPreview} numberOfLines={2}>
            Had a difficult conversation with my sister about our holiday plans...
          </Text>
          <TouchableOpacity style={styles.viewButton}>
            <Text style={styles.viewButtonText}>View Entry</Text>
            <ChevronRight size={20} color="#6366f1" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 20,
  },
  heading: {
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
    color: '#1e293b',
    marginBottom: 24,
  },
  entryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  entryDate: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#64748b',
  },
  statusBadge: {
    backgroundColor: '#ede9fe',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#6366f1',
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  completedBadge: {
    backgroundColor: '#dcfce7',
  },
  completedText: {
    color: '#16a34a',
  },
  entryTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    color: '#1e293b',
    marginBottom: 8,
  },
  entryPreview: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 16,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#6366f1',
    marginRight: 4,
  },
});