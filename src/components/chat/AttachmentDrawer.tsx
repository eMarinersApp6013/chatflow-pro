// AttachmentDrawer — bottom sheet for picking media to send.
// Options: Camera (take photo), Gallery (pick image), Document (pick file).
// Slides up from bottom with animated overlay.

import { useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Alert,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Camera, Image as ImageIcon, FileText, X } from 'lucide-react-native';
import { useUIStore } from '../../store/uiStore';

export interface PickedFile {
  uri: string;
  name: string;
  mimeType: string;
  type: 'image' | 'document';
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onFilePicked: (file: PickedFile) => void;
}

export default function AttachmentDrawer({ visible, onClose, onFilePicked }: Props) {
  const { colors } = useUIStore();
  const translateY = useSharedValue(300);
  const overlayOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      overlayOpacity.value = withTiming(1, { duration: 180 });
      translateY.value = withSpring(0, { damping: 22, stiffness: 200 });
    } else {
      overlayOpacity.value = withTiming(0, { duration: 150 });
      translateY.value = withTiming(300, { duration: 200 });
    }
  }, [visible]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));
  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const handleCamera = async () => {
    onClose();
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera permission is required to take photos.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: false,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const name = `photo_${Date.now()}.jpg`;
      onFilePicked({ uri: asset.uri, name, mimeType: 'image/jpeg', type: 'image' });
    }
  };

  const handleGallery = async () => {
    onClose();
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Gallery permission is required to pick images.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsMultipleSelection: false,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const ext = asset.uri.split('.').pop() ?? 'jpg';
      const mime = ext === 'png' ? 'image/png' : 'image/jpeg';
      onFilePicked({
        uri: asset.uri,
        name: asset.fileName ?? `image_${Date.now()}.${ext}`,
        mimeType: mime,
        type: 'image',
      });
    }
  };

  const handleDocument = async () => {
    onClose();
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        onFilePicked({
          uri: asset.uri,
          name: asset.name,
          mimeType: asset.mimeType ?? 'application/octet-stream',
          type: 'document',
        });
      }
    } catch {
      Alert.alert('Error', 'Could not pick document.');
    }
  };

  const s = StyleSheet.create({
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    sheet: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: colors.surface,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingBottom: 36,
      paddingTop: 8,
    },
    handle: {
      width: 36,
      height: 4,
      backgroundColor: colors.border,
      borderRadius: 2,
      alignSelf: 'center',
      marginBottom: 8,
    },
    title: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textDim,
      textAlign: 'center',
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      marginHorizontal: 20,
      marginBottom: 8,
    },
    optionsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingHorizontal: 24,
      paddingTop: 16,
    },
    option: { alignItems: 'center', gap: 10 },
    iconWrap: {
      width: 60,
      height: 60,
      borderRadius: 30,
      justifyContent: 'center',
      alignItems: 'center',
    },
    optionLabel: { fontSize: 13, fontWeight: '500', color: colors.text },
  });

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[s.overlay, overlayStyle]} />
      </TouchableWithoutFeedback>

      <Animated.View style={[s.sheet, sheetStyle]}>
        <View style={s.handle} />
        <Text style={s.title}>Send Attachment</Text>

        <View style={s.optionsRow}>
          <TouchableOpacity style={s.option} onPress={handleCamera} activeOpacity={0.7}>
            <View style={[s.iconWrap, { backgroundColor: colors.purple + '22' }]}>
              <Camera color={colors.purple} size={28} />
            </View>
            <Text style={s.optionLabel}>Camera</Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.option} onPress={handleGallery} activeOpacity={0.7}>
            <View style={[s.iconWrap, { backgroundColor: colors.green + '22' }]}>
              <ImageIcon color={colors.green} size={28} />
            </View>
            <Text style={s.optionLabel}>Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.option} onPress={handleDocument} activeOpacity={0.7}>
            <View style={[s.iconWrap, { backgroundColor: colors.orange + '22' }]}>
              <FileText color={colors.orange} size={28} />
            </View>
            <Text style={s.optionLabel}>Document</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
}
