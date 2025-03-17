import { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

export default function NewEntryScreen() {
  const [title, setTitle] = useState('');
  const [situation, setSituation] = useState('');
  const [immediateReaction, setImmediateReaction] = useState('');
  const [betterResponse, setBetterResponse] = useState('');
  const [followUpReflection, setFollowUpReflection] = useState('');

  const handleSave = () => {
    // TODO: Save the entry
    router.push('/journal');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView 
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.heading}>New Journal Entry</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Title</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="Give your entry a title..."
                returnKeyType="next"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Situation & Feelings</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={situation}
                onChangeText={setSituation}
                placeholder="Describe what happened and how you're feeling..."
                multiline
                numberOfLines={4}
                returnKeyType="next"
                blurOnSubmit={true}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Immediate Reaction</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={immediateReaction}
                onChangeText={setImmediateReaction}
                placeholder="What's your impulse? How do you feel like reacting?"
                multiline
                numberOfLines={4}
                returnKeyType="next"
                blurOnSubmit={true}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Better Response</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={betterResponse}
                onChangeText={setBetterResponse}
                placeholder="What would be a better way to handle this?"
                multiline
                numberOfLines={4}
                returnKeyType="next"
                blurOnSubmit={true}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Follow-up Reflection (24-72 hours later)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={followUpReflection}
                onChangeText={setFollowUpReflection}
                placeholder="Did your better response improve the outcome? What did you learn?"
                multiline
                numberOfLines={4}
                returnKeyType="done"
                blurOnSubmit={true}
              />
            </View>

            <TouchableOpacity 
              style={styles.button} 
              onPress={handleSave}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Save Entry</Text>
            </TouchableOpacity>
            
            <View style={styles.keyboardSpacer} />
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
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
    paddingBottom: 40,
  },
  heading: {
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
    color: '#1e293b',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#475569',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#1e293b',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#6366f1',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  keyboardSpacer: {
    height: 60,
  },
});