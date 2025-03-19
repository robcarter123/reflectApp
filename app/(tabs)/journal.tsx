import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { router, useNavigation, usePathname } from 'expo-router';
import { getJournalEntries, type JournalEntry } from '../../services/journal';
import { format, isToday, isYesterday } from 'date-fns';

export default function JournalScreen() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  // Load entries when the screen comes into focus
  useEffect(() => {
    if (pathname === '/(tabs)/journal') {
      loadEntries();
    }
  }, [pathname]);

  const loadEntries = async () => {
    try {
      setLoading(true);
      const journalEntries = await getJournalEntries();
      setEntries(journalEntries);
    } catch (error) {
      console.error('Error loading journal entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: Date) => {
    if (isToday(timestamp)) {
      return `Today, ${format(timestamp, 'h:mm a')}`;
    } else if (isYesterday(timestamp)) {
      return 'Yesterday';
    } else {
      return format(timestamp, 'MMM d, yyyy');
    }
  };

  const getEntryStatus = (entry: JournalEntry) => {
    const hasFollowUp = entry.followUp?.trim().length > 0;
    return {
      text: hasFollowUp ? 'Reflected' : 'Needs Reflection',
      isCompleted: hasFollowUp
    };
  };

  const handleEntryPress = (entryId: string | undefined) => {
    if (entryId) {
      router.push({
        pathname: '/(tabs)/journal/[id]',
        params: { id: entryId }
      });
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Loading journal entries...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Your Journal</Text>
        
        {entries.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No journal entries yet</Text>
            <TouchableOpacity 
              style={styles.createButton}
              onPress={() => router.push('/new-entry')}
            >
              <Text style={styles.createButtonText}>Create Your First Entry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          entries.map(entry => {
            const status = getEntryStatus(entry);
            return (
              <View key={entry.id} style={styles.entryCard}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryDate}>{formatDate(entry.createdAt)}</Text>
                  <View style={[
                    styles.statusBadge,
                    status.isCompleted && styles.completedBadge
                  ]}>
                    <Text style={[
                      styles.statusText,
                      status.isCompleted && styles.completedText
                    ]}>{status.text}</Text>
                  </View>
                </View>
                <Text style={styles.entryTitle}>{entry.title}</Text>
                <Text style={styles.entryPreview} numberOfLines={2}>
                  {entry.situation}
                </Text>
                <TouchableOpacity 
                  style={styles.viewButton}
                  onPress={() => handleEntryPress(entry.id)}
                >
                  <Text style={styles.viewButtonText}>View Entry</Text>
                  <ChevronRight size={20} color="#6366f1" />
                </TouchableOpacity>
              </View>
            );
          })
        )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748b',
    fontFamily: 'Inter_500Medium',
  },
  emptyState: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
  },
  emptyStateText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: '#64748b',
    marginBottom: 16,
  },
  createButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
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