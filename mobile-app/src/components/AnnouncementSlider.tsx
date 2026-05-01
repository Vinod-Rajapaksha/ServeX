import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Image,
  Dimensions,
  TouchableOpacity,
  Animated,
  Modal,
  ScrollView,
} from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');
const ITEM_WIDTH = width - SPACING.lg * 2;

interface AnnouncementSliderProps {
  data: any[];
}

const AnnouncementSlider = ({ data }: AnnouncementSliderProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);


  useEffect(() => {
    if (data.length > 1) {
      const timer = setInterval(() => {
        const nextIndex = (currentIndex + 1) % data.length;
        flatListRef.current?.scrollToIndex({
          index: nextIndex,
          animated: true,
        });
        setCurrentIndex(nextIndex);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [currentIndex, data.length]);

  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.itemContainer}>
      <TouchableOpacity 
        activeOpacity={0.9} 
        style={styles.card}
        onPress={() => setSelectedAnnouncement(item)}
      >
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.placeholder]}>
            <Text style={styles.placeholderText}>ServeX</Text>
          </View>
        )}
        <View style={styles.overlay}>
          <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.content} numberOfLines={2}>{item.content}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  if (!data || data.length === 0) return null;

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={data}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        snapToInterval={width}
        decelerationRate="fast"
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        keyExtractor={(item) => item._id}
      />
      
      {data.length > 1 && (
        <View style={styles.pagination}>
          {data.map((_, index) => {
            const opacity = scrollX.interpolate({
              inputRange: [(index - 1) * width, index * width, (index + 1) * width],
              outputRange: [0.4, 1, 0.4],
              extrapolate: 'clamp',
            });
            const scale = scrollX.interpolate({
              inputRange: [(index - 1) * width, index * width, (index + 1) * width],
              outputRange: [0.8, 1.2, 0.8],
              extrapolate: 'clamp',
            });
            return (
              <Animated.View
                key={index}
                style={[
                  styles.dot,
                  { opacity, transform: [{ scale }] }
                ]}
              />
            );
          })}
        </View>
      )}

      {/* Announcement Detail Modal */}
      <Modal
        visible={!!selectedAnnouncement}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSelectedAnnouncement(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={() => setSelectedAnnouncement(null)}
            >
              <Ionicons name="close" size={28} color={COLORS.text} />
            </TouchableOpacity>

            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedAnnouncement?.image ? (
                <Image source={{ uri: selectedAnnouncement.image }} style={styles.modalImage} />
              ) : (
                <View style={[styles.modalImage, styles.placeholder]}>
                  <Text style={styles.placeholderText}>ServeX</Text>
                </View>
              )}
              
              <View style={styles.modalBody}>
                <Text style={styles.modalTitle}>{selectedAnnouncement?.title}</Text>
                <View style={styles.divider} />
                <Text style={styles.modalDesc}>{selectedAnnouncement?.content}</Text>
                
                {selectedAnnouncement?.createdAt && (
                  <Text style={styles.modalDate}>
                    Posted on: {new Date(selectedAnnouncement.createdAt).toLocaleDateString()}
                  </Text>
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );

};

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.md,
  },
  itemContainer: {
    width: width,
    paddingHorizontal: SPACING.lg,
  },
  card: {
    width: ITEM_WIDTH,
    height: 160,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
    elevation: 4,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    ...TYPOGRAPHY.h1,
    color: COLORS.white,
    opacity: 0.2,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.md,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  title: {
    ...TYPOGRAPHY.h3,
    color: COLORS.white,
    marginBottom: 2,
  },
  content: {
    ...TYPOGRAPHY.caption,
    color: COLORS.white,
    opacity: 0.9,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginHorizontal: 3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    height: height * 0.8,
    paddingTop: SPACING.xl,
  },

  closeButton: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    zIndex: 10,
    padding: 8,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    elevation: 5,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  modalImage: {
    width: width,
    height: 250,
  },
  modalBody: {
    padding: SPACING.lg,
  },
  modalTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  divider: {
    height: 3,
    width: 40,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
    marginBottom: SPACING.md,
  },
  modalDesc: {
    ...TYPOGRAPHY.body,
    lineHeight: 24,
    color: COLORS.text,
    marginBottom: SPACING.xl,
  },
  modalDate: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textLight,
    fontStyle: 'italic',
  },
});


export default AnnouncementSlider;
