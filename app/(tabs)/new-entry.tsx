import { useState, useRef, useEffect } from 'react';
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
  InputAccessoryView,
  Dimensions,
  LayoutAnimation,
  UIManager,
  ViewStyle,
  TextStyle,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChevronUp, ChevronDown } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Ionicons from '@expo/vector-icons/Ionicons';
import { saveJournalEntry } from '../../services/journal';
import { LoadingOverlay } from '../../components/LoadingOverlay';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const JOURNAL_INPUT_ACCESSORY_ID = 'journalInputAccessoryID';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Styles extends StyleSheet.NamedStyles<{
  container: ViewStyle;
  content: ViewStyle;
  heading: TextStyle;
  input: TextStyle;
  textArea: TextStyle;
  inputFocused: TextStyle;
  label: TextStyle;
  charCount: ViewStyle;
  charCountText: TextStyle;
  inputAccessoryContainer: ViewStyle;
  inputAccessoryContent: ViewStyle;
  navButton: ViewStyle;
  navButtonDisabled: ViewStyle;
  doneButton: ViewStyle;
  doneButtonText: TextStyle;
}> {}

export default function JournalEntryScreen() {
  const [journalTitle, setJournalTitle] = useState('');
  const [journalSituation, setJournalSituation] = useState('');
  const [journalImmediateReaction, setJournalImmediateReaction] = useState('');
  const [journalBetterResponse, setJournalBetterResponse] = useState('');
  const [journalFollowUp, setJournalFollowUp] = useState('');
  const [activeInputField, setActiveInputField] = useState('');
  const [keyboardSpacing, setKeyboardSpacing] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaveSuccess, setIsSaveSuccess] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  
  const journalTitleRef = useRef<TextInput>(null);
  const journalSituationRef = useRef<TextInput>(null);
  const journalReactionRef = useRef<TextInput>(null);
  const journalResponseRef = useRef<TextInput>(null);
  const journalFollowUpRef = useRef<TextInput>(null);
  const journalScrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    setTimeout(() => {
      journalScrollViewRef.current?.scrollTo({
        y: 0,
        animated: false
      });
    }, 0);
  }, []);

  const clearForm = () => {
    setJournalTitle('');
    setJournalSituation('');
    setJournalImmediateReaction('');
    setJournalBetterResponse('');
    setJournalFollowUp('');
    setActiveInputField('');
    journalScrollViewRef.current?.scrollTo({
      y: 0,
      animated: false
    });
  };

  useEffect(() => {
    return () => {
      clearForm();
    };
  }, []);

  const handleJournalSave = async () => {
    try {
      if (!journalTitle.trim()) {
        Alert.alert('Error', 'Please enter a title for your journal entry');
        return;
      }

      setIsLoading(true);
      
      // Add artificial delay for better UX
      await Promise.all([
        saveJournalEntry({
          title: journalTitle,
          situation: journalSituation,
          immediateReaction: journalImmediateReaction,
          betterResponse: journalBetterResponse,
          followUp: journalFollowUp,
        }),
        new Promise(resolve => setTimeout(resolve, 1500)) // Minimum 1.5s loading time
      ]);

      // Dismiss keyboard first
      Keyboard.dismiss();
      setActiveInputField('');

      // Clear all form fields
      setJournalTitle('');
      setJournalSituation('');
      setJournalImmediateReaction('');
      setJournalBetterResponse('');
      setJournalFollowUp('');

      // Reset scroll position
      journalScrollViewRef.current?.scrollTo({
        y: 0,
        animated: false
      });

      setIsLoading(false);
      setIsSaveSuccess(true);
    } catch (error) {
      console.error('Error saving journal entry:', error);
      setIsLoading(false);
      Alert.alert('Error', 'Failed to save journal entry. Please try again.');
    }
  };

  const handleSaveComplete = () => {
    router.replace('/journal');
  };

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      e => setKeyboardSpacing(e.endCoordinates.height)
    );
    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardSpacing(0)
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  useEffect(() => {
    if (activeInputField) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 1,
          tension: 20,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 20,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [activeInputField]);

  const handleJournalFieldFocus = (fieldName: string, scrollPosition: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveInputField(fieldName);
    Haptics.selectionAsync();
    
    setTimeout(() => {
      journalScrollViewRef.current?.scrollTo({
        y: scrollPosition,
        animated: true
      });
    }, 100);
  };

  const handleJournalFieldBlur = () => {
    requestAnimationFrame(() => {
      if (!Keyboard.isVisible()) {
        setActiveInputField('');
      }
    });
  };

  const navigateToNextJournalField = (currentField: string) => {
    Haptics.selectionAsync();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    
    switch (currentField) {
      case 'title':
        journalSituationRef.current?.focus();
        setActiveInputField('situation');
        break;
      case 'situation':
        journalReactionRef.current?.focus();
        setActiveInputField('immediateReaction');
        break;
      case 'immediateReaction':
        journalResponseRef.current?.focus();
        setActiveInputField('betterResponse');
        break;
      case 'betterResponse':
        journalFollowUpRef.current?.focus();
        setActiveInputField('followUp');
        break;
      case 'followUp':
        Keyboard.dismiss();
        setActiveInputField('');
        break;
    }
  };

  const navigateToPreviousJournalField = (currentField: string) => {
    Haptics.selectionAsync();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    
    switch (currentField) {
      case 'followUp':
        journalResponseRef.current?.focus();
        setActiveInputField('betterResponse');
        break;
      case 'betterResponse':
        journalReactionRef.current?.focus();
        setActiveInputField('immediateReaction');
        break;
      case 'immediateReaction':
        journalSituationRef.current?.focus();
        setActiveInputField('situation');
        break;
      case 'situation':
        journalTitleRef.current?.focus();
        setActiveInputField('title');
        break;
    }
  };

  const handleJournalKeyPress = (fieldName: string, event: any) => {
    if (event.nativeEvent.key === 'Enter' && !event.nativeEvent.shiftKey) {
      event.preventDefault?.();
      navigateToNextJournalField(fieldName);
      return true;
    }
    return false;
  };

  const renderJournalInputAccessory = () => {
    if (Platform.OS !== 'ios') return null;

    const isFirstField = activeInputField === 'title';
    const isLastField = activeInputField === 'followUp';

    return (
      <InputAccessoryView nativeID={JOURNAL_INPUT_ACCESSORY_ID}>
        <View style={styles.inputAccessoryContainer}>
          <View style={styles.inputAccessoryContent}>
            <TouchableOpacity
              onPress={() => navigateToPreviousJournalField(activeInputField)}
              disabled={isFirstField}
              style={[styles.navButton, isFirstField && styles.navButtonDisabled]}
            >
              <Ionicons
                name="chevron-up"
                size={24}
                color={isFirstField ? '#94a3b8' : '#0284c7'}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigateToNextJournalField(activeInputField)}
              disabled={isLastField}
              style={[styles.navButton, isLastField && styles.navButtonDisabled]}
            >
              <Ionicons
                name="chevron-down"
                size={24}
                color={isLastField ? '#94a3b8' : '#0284c7'}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                Keyboard.dismiss();
                setActiveInputField('');
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={styles.doneButton}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </InputAccessoryView>
    );
  };

  const renderJournalCharCount = (text: string, maxLength: number = 500) => {
    const percentage = (text.length / maxLength) * 100;
    const color = percentage > 90 ? '#ef4444' : percentage > 75 ? '#f59e0b' : '#94a3b8';
    
    return (
      <Text style={[styles.charCountText, { color }]}>
        {text.length}/{maxLength}
      </Text>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LoadingOverlay 
        visible={isLoading} 
        isSuccess={isSaveSuccess}
        onSuccessComplete={handleSaveComplete}
      />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView 
            ref={journalScrollViewRef}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={true}
            scrollIndicatorInsets={{ right: 1 }}
          >
            <Text style={styles.heading}>New Journal Entry</Text>
            
            <Animated.View style={[
              styles.inputGroup,
              {
                transform: [{
                  scale: activeInputField === 'title' ? 1.02 : 1,
                }],
              }
            ]}>
              <Text style={styles.label}>Title</Text>
              <TextInput
                ref={journalTitleRef}
                style={[
                  styles.input,
                  activeInputField === 'title' && styles.inputFocused
                ]}
                value={journalTitle}
                onChangeText={setJournalTitle}
                placeholder="Give your entry a title..."
                placeholderTextColor="#94a3b8"
                returnKeyType="next"
                onFocus={() => handleJournalFieldFocus('title', 0)}
                onBlur={handleJournalFieldBlur}
                onSubmitEditing={() => navigateToNextJournalField('title')}
                blurOnSubmit={false}
                inputAccessoryViewID={JOURNAL_INPUT_ACCESSORY_ID}
                maxLength={100}
              />
              {renderJournalCharCount(journalTitle, 100)}
            </Animated.View>

            <Animated.View style={[
              styles.inputGroup,
              {
                transform: [{
                  scale: activeInputField === 'situation' ? 1.02 : 1,
                }],
              }
            ]}>
              <Text style={styles.label}>Situation & Feelings</Text>
              <TextInput
                ref={journalSituationRef}
                style={[
                  styles.input,
                  styles.textArea,
                  activeInputField === 'situation' && styles.inputFocused
                ]}
                value={journalSituation}
                onChangeText={setJournalSituation}
                placeholder="Describe what happened and how you're feeling..."
                placeholderTextColor="#94a3b8"
                multiline={true}
                textAlignVertical="top"
                returnKeyType="next"
                blurOnSubmit={false}
                onFocus={() => handleJournalFieldFocus('situation', 150)}
                onBlur={handleJournalFieldBlur}
                onSubmitEditing={() => navigateToNextJournalField('situation')}
                onKeyPress={(e) => handleJournalKeyPress('situation', e)}
                inputAccessoryViewID={JOURNAL_INPUT_ACCESSORY_ID}
                maxLength={500}
                enablesReturnKeyAutomatically={true}
              />
              {renderJournalCharCount(journalSituation)}
            </Animated.View>

            <Animated.View style={[
              styles.inputGroup,
              {
                transform: [{
                  scale: activeInputField === 'immediateReaction' ? 1.02 : 1,
                }],
              }
            ]}>
              <Text style={styles.label}>Immediate Reaction</Text>
              <TextInput
                ref={journalReactionRef}
                style={[
                  styles.input,
                  styles.textArea,
                  activeInputField === 'immediateReaction' && styles.inputFocused
                ]}
                value={journalImmediateReaction}
                onChangeText={setJournalImmediateReaction}
                placeholder="What's your impulse? How do you feel like reacting?"
                placeholderTextColor="#94a3b8"
                multiline={true}
                textAlignVertical="top"
                returnKeyType="next"
                blurOnSubmit={false}
                onFocus={() => handleJournalFieldFocus('immediateReaction', 300)}
                onBlur={handleJournalFieldBlur}
                onSubmitEditing={() => navigateToNextJournalField('immediateReaction')}
                onKeyPress={(e) => handleJournalKeyPress('immediateReaction', e)}
                inputAccessoryViewID={JOURNAL_INPUT_ACCESSORY_ID}
                maxLength={500}
                enablesReturnKeyAutomatically={true}
              />
              {renderJournalCharCount(journalImmediateReaction)}
            </Animated.View>

            <Animated.View style={[
              styles.inputGroup,
              {
                transform: [{
                  scale: activeInputField === 'betterResponse' ? 1.02 : 1,
                }],
              }
            ]}>
              <Text style={styles.label}>Better Response</Text>
              <TextInput
                ref={journalResponseRef}
                style={[
                  styles.input,
                  styles.textArea,
                  activeInputField === 'betterResponse' && styles.inputFocused
                ]}
                value={journalBetterResponse}
                onChangeText={setJournalBetterResponse}
                placeholder="What would be a better way to handle this?"
                placeholderTextColor="#94a3b8"
                multiline={true}
                textAlignVertical="top"
                returnKeyType="next"
                blurOnSubmit={false}
                onFocus={() => handleJournalFieldFocus('betterResponse', 450)}
                onBlur={handleJournalFieldBlur}
                onSubmitEditing={() => navigateToNextJournalField('betterResponse')}
                onKeyPress={(e) => handleJournalKeyPress('betterResponse', e)}
                inputAccessoryViewID={JOURNAL_INPUT_ACCESSORY_ID}
                maxLength={500}
                enablesReturnKeyAutomatically={true}
              />
              {renderJournalCharCount(journalBetterResponse)}
            </Animated.View>

            <Animated.View style={[
              styles.inputGroup,
              {
                transform: [{
                  scale: activeInputField === 'followUp' ? 1.02 : 1,
                }],
              }
            ]}>
              <Text style={styles.label}>Follow-up Reflection (24-72 hours later)</Text>
              <TextInput
                ref={journalFollowUpRef}
                style={[
                  styles.input,
                  styles.textArea,
                  activeInputField === 'followUp' && styles.inputFocused
                ]}
                value={journalFollowUp}
                onChangeText={setJournalFollowUp}
                placeholder="Did your better response improve the outcome? What did you learn?"
                placeholderTextColor="#94a3b8"
                multiline={true}
                textAlignVertical="top"
                returnKeyType="done"
                blurOnSubmit={true}
                onFocus={() => handleJournalFieldFocus('followUp', 750)}
                onBlur={handleJournalFieldBlur}
                onSubmitEditing={() => Keyboard.dismiss()}
                onKeyPress={(e) => handleJournalKeyPress('followUp', e)}
                inputAccessoryViewID={JOURNAL_INPUT_ACCESSORY_ID}
                maxLength={500}
                enablesReturnKeyAutomatically={true}
              />
              {renderJournalCharCount(journalFollowUp)}
            </Animated.View>

            <TouchableOpacity 
              style={styles.button} 
              onPress={() => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                handleJournalSave();
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Save Entry</Text>
            </TouchableOpacity>
            
            <View style={[styles.keyboardSpacer, { height: keyboardSpacing > 0 ? keyboardSpacing : 60 }]} />
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
      {renderJournalInputAccessory()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  } as ViewStyle,
  content: {
    padding: 16,
    paddingBottom: 32,
  } as ViewStyle,
  heading: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 24,
    color: '#0f172a',
    marginBottom: 24,
  } as TextStyle,
  inputGroup: {
    marginBottom: 20,
    borderRadius: 16,
    backgroundColor: '#fff',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
  } as ViewStyle,
  label: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  } as TextStyle,
  input: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#0f172a',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f8fafc',
  } as TextStyle,
  inputFocused: {
    borderColor: '#0284c7',
    backgroundColor: '#fff',
    shadowColor: '#0284c7',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  } as TextStyle,
  textArea: {
    minHeight: 120,
    maxHeight: 200,
    textAlignVertical: 'top',
  } as TextStyle,
  button: {
    backgroundColor: '#6366f1',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#6366f1',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  } as ViewStyle,
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  } as TextStyle,
  keyboardSpacer: {
    height: 60,
  } as ViewStyle,
  inputAccessoryContainer: {
    backgroundColor: '#f8fafc',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    padding: 8,
  } as ViewStyle,
  inputAccessoryContent: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 8,
  } as ViewStyle,
  navButton: {
    padding: 8,
    marginHorizontal: 4,
  } as ViewStyle,
  navButtonDisabled: {
    opacity: 0.5,
  } as ViewStyle,
  doneButton: {
    marginLeft: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  } as ViewStyle,
  doneButtonText: {
    color: '#0284c7',
    fontSize: 16,
    fontWeight: '600',
  } as TextStyle,
  charCount: {
    alignSelf: 'flex-end',
    marginTop: 4,
  } as ViewStyle,
  charCountText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#94a3b8',
  } as TextStyle,
});