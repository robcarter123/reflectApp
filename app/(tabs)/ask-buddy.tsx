import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Dimensions, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Send, Trash2, Sparkles, Bot, User, Clock } from 'lucide-react-native';
import { useState, useRef, useEffect } from 'react';
import { sendMessageToChatGPT } from '@/services/chatgpt';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Message = {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
};

const { width } = Dimensions.get('window');

export default function AskBuddyScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );
    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  const scrollToBottom = (animated = true) => {
    scrollViewRef.current?.scrollToEnd({ animated });
  };

  useEffect(() => {
    if (keyboardHeight > 0) {
      scrollToBottom();
    }
  }, [keyboardHeight]);

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    Keyboard.dismiss();

    try {
      const conversationHistory = messages.map(msg => ({
        role: msg.isUser ? 'user' as const : 'assistant' as const,
        content: msg.text
      }));

      const response = await sendMessageToChatGPT(userMessage.text, conversationHistory);
      
      const buddyMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, buddyMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert(
        'Error',
        'Failed to send message. Please try again later.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    Alert.alert(
      'Clear Chat',
      'Are you sure you want to clear the conversation?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => setMessages([])
        }
      ]
    );
  };

  const renderMessage = (message: Message) => {
    const isUser = message.isUser;
    return (
      <View key={message.id} style={[styles.messageWrapper, isUser ? styles.userMessageWrapper : styles.buddyMessageWrapper]}>
        <View style={styles.messageHeader}>
          {isUser ? (
            <View style={styles.userAvatar}>
              <User size={16} color="#fff" />
            </View>
          ) : (
            <View style={styles.buddyAvatar}>
              <Bot size={16} color="#fff" />
            </View>
          )}
          <Text style={styles.messageSender}>
            {isUser ? 'You' : 'Buddy'}
          </Text>
          <Text style={styles.timestamp}>
            {formatTimestamp(message.timestamp)}
          </Text>
        </View>
        <View style={[styles.messageBubble, isUser ? styles.userMessage : styles.buddyMessage]}>
          <Text style={[styles.messageText, isUser ? styles.userMessageText : null]}>
            {message.text}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={['#6366f1', '#818cf8']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={styles.buddyAvatarLarge}>
              <Bot size={24} color="#fff" />
            </View>
            <View>
              <Text style={styles.heading}>Ask Buddy</Text>
              <Text style={styles.subtitle}>Your emotional support companion</Text>
            </View>
          </View>
          {messages.length > 0 && (
            <TouchableOpacity onPress={handleClearChat} style={styles.clearButton}>
              <Trash2 size={20} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView 
          ref={scrollViewRef}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: keyboardHeight + 100 }
          ]}
          onContentSizeChange={() => scrollToBottom(false)}
          onLayout={() => scrollToBottom(false)}
          keyboardShouldPersistTaps="handled"
        >
          {messages.length === 0 ? (
            <View style={styles.welcomeContainer}>
              <View style={styles.welcomeIcon}>
                <Sparkles size={32} color="#6366f1" />
              </View>
              <Text style={styles.welcomeTitle}>Welcome to Buddy!</Text>
              <Text style={styles.welcomeText}>
                I'm here to help you process your feelings and provide emotional support. 
                Feel free to share your thoughts, and I'll respond with empathy and understanding.
              </Text>
              <View style={styles.suggestionContainer}>
                <Text style={styles.suggestionTitle}>Try asking about:</Text>
                <TouchableOpacity 
                  style={styles.suggestionButton}
                  onPress={() => setInputText("I'm feeling overwhelmed with work lately")}
                >
                  <Text style={styles.suggestionText}>Work stress</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.suggestionButton}
                  onPress={() => setInputText("I had a difficult conversation with a friend")}
                >
                  <Text style={styles.suggestionText}>Relationship issues</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.suggestionButton}
                  onPress={() => setInputText("I'm struggling with anxiety")}
                >
                  <Text style={styles.suggestionText}>Anxiety</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.messageContainer}>
              {messages.map(renderMessage)}
              {isLoading && (
                <View style={styles.buddyMessageWrapper}>
                  <View style={styles.messageHeader}>
                    <View style={styles.buddyAvatar}>
                      <Bot size={16} color="#fff" />
                    </View>
                    <Text style={styles.messageSender}>Buddy</Text>
                  </View>
                  <View style={[styles.messageBubble, styles.buddyMessage]}>
                    <ActivityIndicator color="#6366f1" />
                  </View>
                </View>
              )}
            </View>
          )}
        </ScrollView>

        <View style={[
          styles.inputContainer,
          { paddingBottom: insets.bottom + 16 }
        ]}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="Share your thoughts..."
            placeholderTextColor="#94a3b8"
            multiline
            value={inputText}
            onChangeText={setInputText}
            editable={!isLoading}
            maxLength={1000}
            textAlignVertical="center"
            blurOnSubmit={false}
          />
          <TouchableOpacity 
            style={[
              styles.sendButton,
              (!inputText.trim() || isLoading) && styles.sendButtonDisabled
            ]}
            onPress={handleSendMessage}
            disabled={!inputText.trim() || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Send size={24} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  heading: {
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
    color: '#fff',
    marginBottom: 2,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  buddyAvatarLarge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  welcomeContainer: {
    alignItems: 'center',
    paddingTop: 40,
  },
  welcomeIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#e0e7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  welcomeTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  suggestionContainer: {
    width: '100%',
    gap: 12,
  },
  suggestionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#1e293b',
    marginBottom: 8,
  },
  suggestionButton: {
    backgroundColor: '#f1f5f9',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  suggestionText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#64748b',
  },
  messageContainer: {
    gap: 24,
  },
  messageWrapper: {
    maxWidth: width * 0.85,
  },
  userMessageWrapper: {
    alignSelf: 'flex-end',
  },
  buddyMessageWrapper: {
    alignSelf: 'flex-start',
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  userAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buddyAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#818cf8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageSender: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#64748b',
  },
  messageBubble: {
    padding: 16,
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
  buddyMessage: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 4,
  },
  userMessage: {
    backgroundColor: '#6366f1',
    borderTopRightRadius: 4,
  },
  messageText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#1e293b',
    lineHeight: 20,
  },
  userMessageText: {
    color: '#fff',
  },
  timestamp: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: '#94a3b8',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: 24,
    padding: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    maxHeight: 120,
    minHeight: 48,
    color: '#1e293b',
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
});