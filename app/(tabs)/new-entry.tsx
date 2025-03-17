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
  UIManager
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChevronUp, ChevronDown } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const INPUT_ACCESSORY_VIEW_ID = 'uniqueID';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function NewEntryScreen() {
  // State management
  const [title, setTitle] = useState('');
  const [situation, setSituation] = useState('');
  const [immediateReaction, setImmediateReaction] = useState('');
  const [betterResponse, setBetterResponse] = useState('');
  const [followUpReflection, setFollowUpReflection] = useState('');
  const [focusedField, setFocusedField] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  
  // Refs
  const titleRef = useRef<TextInput>(null);
  const situationRef = useRef<TextInput>(null);
  const immediateReactionRef = useRef<TextInput>(null);
  const betterResponseRef = useRef<TextInput>(null);
  const followUpRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleSave = () => {
    // TODO: Save the entry
    router.push('/journal');
  };

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      e => setKeyboardHeight(e.endCoordinates.height)
    );
    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardHeight(0)
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  useEffect(() => {
    if (focusedField) {
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
  }, [focusedField]);

  const handleFieldFocus = (fieldName: string, scrollPosition: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setFocusedField(fieldName);
    Haptics.selectionAsync();
    
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        y: scrollPosition,
        animated: true
      });
    }, 100);
  };

  const moveToNextField = (currentField: string) => {
    Haptics.selectionAsync();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    
    switch (currentField) {
      case 'title':
        situationRef.current?.focus();
        break;
      case 'situation':
        immediateReactionRef.current?.focus();
        break;
      case 'immediateReaction':
        betterResponseRef.current?.focus();
        break;
      case 'betterResponse':
        followUpRef.current?.focus();
        break;
      case 'followUp':
        Keyboard.dismiss();
        break;
    }
  };

  const moveToPreviousField = (currentField: string) => {
    Haptics.selectionAsync();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    
    switch (currentField) {
      case 'followUp':
        betterResponseRef.current?.focus();
        break;
      case 'betterResponse':
        immediateReactionRef.current?.focus();
        break;
      case 'immediateReaction':
        situationRef.current?.focus();
        break;
      case 'situation':
        titleRef.current?.focus();
        break;
    }
  };

  const renderInputAccessory = () => {
    if (Platform.OS === 'ios') {
      const isFirstField = focusedField === 'title';
      const isLastField = focusedField === 'followUp';

      return (
        <InputAccessoryView nativeID={INPUT_ACCESSORY_VIEW_ID}>
          <Animated.View 
            style={[
              styles.inputAccessory,
              {
                transform: [{
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                }],
                opacity: fadeAnim,
              },
            ]}
          >
            <View style={styles.accessoryContent}>
              <View style={styles.navigationButtons}>
                <TouchableOpacity 
                  style={[styles.navButton, isFirstField && styles.navButtonDisabled]}
                  onPress={() => !isFirstField && moveToPreviousField(focusedField)}
                  disabled={isFirstField}
                >
                  <ChevronUp 
                    size={24} 
                    color={isFirstField ? '#94a3b8' : '#6366f1'} 
                    style={styles.navIcon}
                  />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.navButton, isLastField && styles.navButtonDisabled]}
                  onPress={() => !isLastField && moveToNextField(focusedField)}
                  disabled={isLastField}
                >
                  <ChevronDown 
                    size={24} 
                    color={isLastField ? '#94a3b8' : '#6366f1'} 
                    style={styles.navIcon}
                  />
                </TouchableOpacity>
              </View>
              <TouchableOpacity 
                style={styles.doneButton} 
                onPress={() => {
                  Haptics.selectionAsync();
                  Keyboard.dismiss();
                }}
              >
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </InputAccessoryView>
      );
    }
    return null;
  };

  const renderCharCount = (text: string, maxLength: number = 500) => {
    const percentage = (text.length / maxLength) * 100;
    const color = percentage > 90 ? '#ef4444' : percentage > 75 ? '#f59e0b' : '#94a3b8';
    
    return (
      <Text style={[styles.charCount, { color }]}>
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
            
            <Animated.View style={[
              styles.inputGroup,
              {
                transform: [{
                  scale: focusedField === 'title' ? 1.02 : 1,
                }],
              }
            ]}>
              <Text style={styles.label}>Title</Text>
              <TextInput
                ref={titleRef}
                style={[
                  styles.input,
                  focusedField === 'title' && styles.inputFocused
                ]}
                value={title}
                onChangeText={setTitle}
                placeholder="Give your entry a title..."
                placeholderTextColor="#94a3b8"
                returnKeyType="next"
                onFocus={() => handleFieldFocus('title', 0)}
                inputAccessoryViewID={INPUT_ACCESSORY_VIEW_ID}
                maxLength={100}
              />
              {renderCharCount(title, 100)}
            </Animated.View>

            <Animated.View style={[
              styles.inputGroup,
              {
                transform: [{
                  scale: focusedField === 'situation' ? 1.02 : 1,
                }],
              }
            ]}>
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
                placeholderTextColor="#94a3b8"
                multiline
                textAlignVertical="top"
                returnKeyType="next"
                blurOnSubmit={false}
                onFocus={() => handleFieldFocus('situation', 150)}
                inputAccessoryViewID={INPUT_ACCESSORY_VIEW_ID}
                maxLength={500}
              />
              {renderCharCount(situation)}
            </Animated.View>

            <Animated.View style={[
              styles.inputGroup,
              {
                transform: [{
                  scale: focusedField === 'immediateReaction' ? 1.02 : 1,
                }],
              }
            ]}>
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
                placeholderTextColor="#94a3b8"
                multiline
                textAlignVertical="top"
                returnKeyType="next"
                blurOnSubmit={false}
                onFocus={() => handleFieldFocus('immediateReaction', 300)}
                inputAccessoryViewID={INPUT_ACCESSORY_VIEW_ID}
                maxLength={500}
              />
              {renderCharCount(immediateReaction)}
            </Animated.View>

            <Animated.View style={[
              styles.inputGroup,
              {
                transform: [{
                  scale: focusedField === 'betterResponse' ? 1.02 : 1,
                }],
              }
            ]}>
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
                placeholderTextColor="#94a3b8"
                multiline
                textAlignVertical="top"
                returnKeyType="next"
                blurOnSubmit={false}
                onFocus={() => handleFieldFocus('betterResponse', 450)}
                inputAccessoryViewID={INPUT_ACCESSORY_VIEW_ID}
                maxLength={500}
              />
              {renderCharCount(betterResponse)}
            </Animated.View>

            <Animated.View style={[
              styles.inputGroup,
              {
                transform: [{
                  scale: focusedField === 'followUp' ? 1.02 : 1,
                }],
              }
            ]}>
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
                placeholderTextColor="#94a3b8"
                multiline
                textAlignVertical="top"
                returnKeyType="done"
                blurOnSubmit={true}
                onFocus={() => handleFieldFocus('followUp', 750)}
                inputAccessoryViewID={INPUT_ACCESSORY_VIEW_ID}
                maxLength={500}
              />
              {renderCharCount(followUpReflection)}
            </Animated.View>

            <TouchableOpacity 
              style={styles.button} 
              onPress={() => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                handleSave();
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Save Entry</Text>
            </TouchableOpacity>
            
            <View style={[styles.keyboardSpacer, { height: keyboardHeight > 0 ? keyboardHeight : 60 }]} />
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
  },
  label: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#475569',
    marginBottom: 8,
  },
  input: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#1e293b',
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  inputFocused: {
    borderColor: '#6366f1',
    backgroundColor: '#fff',
    shadowColor: '#6366f1',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  textArea: {
    minHeight: 120,
    maxHeight: 200,
    paddingTop: 16,
    textAlignVertical: 'top',
  },
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
    backgroundColor: '#f8fafc',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  accessoryContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  navigationButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  navButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#ede9fe',
  },
  navButtonDisabled: {
    backgroundColor: '#f1f5f9',
  },
  doneButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#6366f1',
    shadowColor: '#6366f1',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  doneButtonText: {
    color: '#fff',
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
  navIcon: {
    shadowColor: '#6366f1',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
});