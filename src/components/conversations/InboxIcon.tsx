import { View } from 'react-native';
import { MessageCircle, Mail, Globe, Phone } from 'lucide-react-native';
import { useUIStore } from '../../store/uiStore';

interface Props {
  channel: string;
  size?: number;
}

export default function InboxIcon({ channel, size = 16 }: Props) {
  const { colors } = useUIStore();
  const color = colors.textDim;

  if (channel?.includes('whatsapp')) return <MessageCircle color={colors.green} size={size} />;
  if (channel?.includes('email')) return <Mail color={color} size={size} />;
  if (channel?.includes('web')) return <Globe color={color} size={size} />;
  if (channel?.includes('api')) return <Phone color={color} size={size} />;
  return <MessageCircle color={color} size={size} />;
}
