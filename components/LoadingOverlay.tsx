import React, { useEffect } from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Animated,
  Text,
  Dimensions,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface LoadingOverlayProps {
  visible: boolean;
  isSuccess?: boolean;
  onSuccessComplete?: () => void;
}

const SCREEN_HEIGHT = Dimensions.get('window').height;

export function LoadingOverlay({ visible, isSuccess, onSuccessComplete }: LoadingOverlayProps) {
  const opacity = React.useRef(new Animated.Value(0)).current;
  const successScale = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isSuccess) {
      Animated.sequence([
        Animated.spring(successScale, {
          toValue: 1,
          tension: 40,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.delay(800),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start(() => {
        successScale.setValue(0);
        onSuccessComplete?.();
      });
    } else {
      successScale.setValue(0);
    }
  }, [isSuccess]);

  useEffect(() => {
    if (visible) {
      Animated.spring(opacity, {
        toValue: 1,
        tension: 65,
        friction: 7,
        useNativeDriver: true,
      }).start();
    } else if (!isSuccess) {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!visible && !isSuccess) return null;

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <View style={styles.content}>
        {!isSuccess ? (
          <>
            <ActivityIndicator size="large" color="#6366f1" />
            <Text style={styles.text}>Saving journal entry...</Text>
          </>
        ) : (
          <Animated.View style={[styles.successContainer, { transform: [{ scale: successScale }] }]}>
            <Ionicons name="checkmark-circle" size={64} color="#22c55e" />
            <Text style={styles.successText}>Saved successfully!</Text>
          </Animated.View>
        )}
      </View>
    </Animated.View>
  );
}

interface Styles {
  container: ViewStyle;
  content: ViewStyle;
  text: TextStyle;
  successContainer: ViewStyle;
  successText: TextStyle;
}

const styles = StyleSheet.create<Styles>({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  content: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  text: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748b',
    fontFamily: 'Inter_500Medium',
  },
  successContainer: {
    alignItems: 'center',
  },
  successText: {
    marginTop: 12,
    fontSize: 16,
    color: '#22c55e',
    fontFamily: 'Inter_600SemiBold',
  },
}); 