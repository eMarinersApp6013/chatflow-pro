// WhatsApp-style ✓ ✓✓ check marks for message delivery status.
// pending = clock icon, failed = red x, sent = single grey, delivered = double grey, read = double blue

import { ActivityIndicator } from 'react-native';
import { Check, CheckCheck, X } from 'lucide-react-native';
import { useUIStore } from '../../store/uiStore';

interface Props {
  status: string;
  pending?: boolean;
}

export default function CheckMarks({ status, pending = false }: Props) {
  const { colors } = useUIStore();

  if (pending) {
    return <ActivityIndicator color="rgba(255,255,255,0.5)" size={10} />;
  }
  if (status === 'failed') {
    return <X color={colors.danger} size={13} />;
  }
  if (status === 'read') {
    return <CheckCheck color={colors.blueTick} size={14} />;
  }
  if (status === 'delivered') {
    return <CheckCheck color="rgba(255,255,255,0.6)" size={14} />;
  }
  // sent
  return <Check color="rgba(255,255,255,0.6)" size={14} />;
}
