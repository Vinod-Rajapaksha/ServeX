import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { setOnboardingCompleted } from '../../utils/storage';

const { width, height } = Dimensions.get('window');

interface OnboardingItem {
  id: string;
  title: string;
  description: string;
  icon: any;
}

const ONBOARDING_DATA: OnboardingItem[] = [
  {
    id: '1',
    title: 'Find Local Experts',
    description: 'Discover the best local service providers in your area with ease.',
    icon: 'search-outline',
  },
  {
    id: '2',
    title: 'Book Instantly',
    description: 'Schedule services at your convenience with our real-time booking system.',
    icon: 'calendar-outline',
  },
  {
    id: '3',
    title: 'Quality Guaranteed',
    description: 'Read reviews and ratings from other users to ensure top-notch service.',
    icon: 'star-outline',
  },
];

const OnboardingScreen = ({ onComplete }: any) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleNext = async () => {
    if (currentIndex < ONBOARDING_DATA.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      await setOnboardingCompleted();
      onComplete();
    }
  };

  const handleSkip = async () => {
    await setOnboardingCompleted();
    onComplete();
  };

  const renderItem = ({ item }: { item: OnboardingItem }) => (
    <View style={styles.slide}>
      <View style={styles.iconContainer}>
        <Ionicons name={item.icon} size={120} color={COLORS.primary} />
      </View>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={ONBOARDING_DATA}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          setCurrentIndex(Math.round(e.nativeEvent.contentOffset.x / width));
        }}
        keyExtractor={(item) => item.id}
      />

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {ONBOARDING_DATA.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                currentIndex === index && styles.activeDot,
              ]}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {currentIndex === ONBOARDING_DATA.length - 1 ? 'Get Started' : 'Next'}
          </Text>
          <Ionicons
            name="arrow-forward"
            size={20}
            color={COLORS.white}
            style={{ marginLeft: SPACING.sm }}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    alignItems: 'flex-end',
  },
  skipText: {
    color: COLORS.textLight,
    ...TYPOGRAPHY.body,
  },
  slide: {
    width,
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: SPACING.xxl,
  },
  title: {
    ...TYPOGRAPHY.h1,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  description: {
    ...TYPOGRAPHY.body,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pagination: {
    flexDirection: 'row',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
    marginRight: 8,
  },
  activeDot: {
    backgroundColor: COLORS.primary,
    width: 20,
  },
  nextButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.round,
    alignItems: 'center',
  },
  nextButtonText: {
    color: COLORS.white,
    ...TYPOGRAPHY.h3,
  },
});

export default OnboardingScreen;
