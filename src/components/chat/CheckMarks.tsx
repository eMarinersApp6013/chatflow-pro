// WhatsApp-style ✓ ✓✓ check marks for message delivery status

import { View } from 'react-native';
import { Check, CheckCheck } from 'lucide-react-native';
import { useUIStore } from '../../store/uiStore';

interface Props {
  status: string;
}

export default function CheckMarks({ status }: Props) {
  const { colors } = useUIStore();

  if (status === 'read') {
    return <CheckCheck color={colors.blueTick} size={14} />;
  }
  if (status === 'delivered') {
    return <CheckCheck color={colors.textDim2} size={14} />;
  }
  if (status === 'sent') {
    return <Check color={colors.textDim2} size={14} />;
  }
  // pending/failed
  return <Check color={colors.textDim2} size={14} style={{ opacity: 0.5 }} />;
}
