import { TouchableOpacity } from 'react-native';
import { Star } from 'lucide-react-native';
import { useUIStore } from '../../store/uiStore';

interface Props {
  starred: boolean;
  onToggle: () => void;
  size?: number;
}

export default function StarIcon({ starred, onToggle, size = 20 }: Props) {
  const { colors } = useUIStore();
  return (
    <TouchableOpacity onPress={onToggle} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
      <Star
        color={starred ? colors.yellow : colors.textDim}
        fill={starred ? colors.yellow : 'transparent'}
        size={size}
      />
    </TouchableOpacity>
  );
}
