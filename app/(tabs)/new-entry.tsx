import { useState, useRef } from 'react';
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
  Keyboard,
  Animated,
  InputAccessoryView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { X } from 'lucide-react-native';

const INPUT_ACCESSORY_VIEW_ID = 'uniqueID';

export default function NewEntryScreen() {
  const [title, setTitle] = useState('');
  const [situation, setSituation] = useState('');
  const [immediateReaction, setImmediateReaction] = useState('');
  const [betterResponse, setBetterResponse] = useState('');
  const [followUpReflection, setFollowUpReflection] = useState('');
  const [focusedField, setFocusedField] = useState('');
  
  // Refs for text inputs to handle focus
  const situationRef = useRef<TextInput>(null);
  const immediateReactionRef = useRef<TextInput>(null);
  const betterResponseRef = useRef<TextInput>(null);
  const followUpRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleSave = () => {
    // TODO: Save the entry
    router.push('/journal');
  };

  const renderInputAccessory = () => {
    if (Platform.OS === 'ios') {
      return (
        <InputAccessoryView nativeID={INPUT_ACCESSORY_VIEW_ID}>
          <View style={styles.inputAccessory}>
            <TouchableOpacity 
              style={styles.doneButton} 
              onPress={Keyboard.dismiss}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </InputAccessoryView>
      );
    }
    return null;
  };

  const renderCharCount = (text: string, maxLength: number = 500) => {
    return (
      <Text style={styles.charCount}>
        {text.length}/{maxLength}
      </Text>
    );
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
            ref={scrollViewRef}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={true}
            scrollIndicatorInsets={{ right: 1 }}
          >
            <Text style={styles.heading}>New Journal Entry</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Title</Text>
              <TextInput
                style={[
                  styles.input,
                  focusedField === 'title' && styles.inputFocused
                ]}
                value={title}
                onChangeText={setTitle}
                placeholder="Give your entry a title..."
                returnKeyType="next"
                onFocus={() => setFocusedField('title')}
                onBlur={() => setFocusedField('')}
                onSubmitEditing={() => situationRef.current?.focus()}
                inputAccessoryViewID={INPUT_ACCESSORY_VIEW_ID}
                maxLength={100}
              />
              {renderCharCount(title, 100)}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Situation & Feelings</Text>
              <TextInput
                ref={situationRef}
                style={[
                  styles.input,
                  styles.textArea,
                  focusedField === 'situation' && styles.inputFocused
                ]}
                value={situation}
                onChangeText={setSituation}
                placeholder="Describe what happened and how you're feeling..."
                multiline
                numberOfLines={4}
                returnKeyType="next"
                blurOnSubmit={false}
                onFocus={() => {
                  setFocusedField('situation');
                  scrollViewRef.current?.scrollTo({ y: 100, animated: true });
                }}
                onBlur={() => setFocusedField('')}
                onSubmitEditing={() => immediateReactionRef.current?.focus()}
                inputAccessoryViewID={INPUT_ACCESSORY_VIEW_ID}
                maxLength={500}
              />
              {renderCharCount(situation)}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Immediate Reaction</Text>
              <TextInput
                ref={immediateReactionRef}
                style={[
                  styles.input,
                  styles.textArea,
                  focusedField === 'immediateReaction' && styles.inputFocused
                ]}
                value={immediateReaction}
                onChangeText={setImmediateReaction}
                placeholder="What's your impulse? How do you feel like reacting?"
                multiline
                numberOfLines={4}
                returnKeyType="next"
                blurOnSubmit={false}
                onFocus={() => {
                  setFocusedField('immediateReaction');
                  scrollViewRef.current?.scrollTo({ y: 250, animated: true });
                }}
                onBlur={() => setFocusedField('')}
                onSubmitEditing={() => betterResponseRef.current?.focus()}
                inputAccessoryViewID={INPUT_ACCESSORY_VIEW_ID}
                maxLength={500}
              />
              {renderCharCount(immediateReaction)}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Better Response</Text>
              <TextInput
                ref={betterResponseRef}
                style={[
                  styles.input,
                  styles.textArea,
                  focusedField === 'betterResponse' && styles.inputFocused
                ]}
                value={betterResponse}
                onChangeText={setBetterResponse}
                placeholder="What would be a better way to handle this?"
                multiline
                numberOfLines={4}
                returnKeyType="next"
                blurOnSubmit={false}
                onFocus={() => {
                  setFocusedField('betterResponse');
                  scrollViewRef.current?.scrollTo({ y: 400, animated: true });
                }}
                onBlur={() => setFocusedField('')}
                onSubmitEditing={() => followUpRef.current?.focus()}
                inputAccessoryViewID={INPUT_ACCESSORY_VIEW_ID}
                maxLength={500}
              />
              {renderCharCount(betterResponse)}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Follow-up Reflection (24-72 hours later)</Text>
              <TextInput
                ref={followUpRef}
                style={[
                  styles.input,
                  styles.textArea,
                  focusedField === 'followUp' && styles.inputFocused
                ]}
                value={followUpReflection}
                onChangeText={setFollowUpReflection}
                placeholder="Did your better response improve the outcome? What did you learn?"
                multiline
                numberOfLines={4}
                returnKeyType="done"
                blurOnSubmit={true}
                onFocus={() => {
                  setFocusedField('followUp');
                  scrollViewRef.current?.scrollTo({ y: 550, animated: true });
                }}
                onBlur={() => setFocusedField('')}
                inputAccessoryViewID={INPUT_ACCESSORY_VIEW_ID}
                maxLength={500}
              />
              {renderCharCount(followUpReflection)}
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
      {renderInputAccessory()}
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
    borderWidth: 2,
    borderColor: 'transparent',
  },
  inputFocused: {
    borderColor: '#6366f1',
    shadowOpacity: 0.1,
    shadowRadius: 5,
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
  inputAccessory: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  doneButton: {
    padding: 12,
  },
  doneButtonText: {
    color: '#6366f1',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  charCount: {
    color: '#94a3b8',
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    textAlign: 'right',
    marginTop: 4,
  },
});