// SmartReply — rule-based quick reply suggestions shown above the message input.
// Analyzes the last incoming message and suggests 2-3 contextually relevant responses.
// No AI/API needed — pure local pattern matching.

import { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Zap } from 'lucide-react-native';
import { useUIStore } from '../../store/uiStore';

interface SmartReplyProps {
  lastMessageContent: string | null;
  onSelect: (reply: string) => void;
}

// Rule table — patterns → suggested replies
const RULES: Array<{ patterns: RegExp[]; replies: string[] }> = [
  {
    patterns: [/\b(hi|hello|hey|good\s*morning|good\s*evening|namaste)\b/i],
    replies: ['Hello! How can I help you today?', 'Hi there! What can I do for you?', 'Welcome! How may I assist you?'],
  },
  {
    patterns: [/\b(price|cost|how much|rate|pricing|kitna)\b/i],
    replies: ['Let me check the pricing for you.', "I'll share the price details shortly.", "Here's our current price list:"],
  },
  {
    patterns: [/\b(deliver|shipping|ship|dispatch|kab.*aayega|when.*arrive|track)\b/i],
    replies: ['Delivery takes 3–5 business days.', "Let me check the shipping status.", "I'll share the tracking details."],
  },
  {
    patterns: [/\b(stock|available|availability|in\s*stock|hai kya)\b/i],
    replies: ['Let me check stock availability.', "I'll verify the current stock for you.", 'One moment, checking inventory…'],
  },
  {
    patterns: [/\b(return|refund|exchange|replace|wapas)\b/i],
    replies: ['Our return policy allows returns within 7 days.', "I'll initiate the return process.", 'Let me check the return eligibility.'],
  },
  {
    patterns: [/\b(thank|thanks|thx|shukriya|appreciate|dhanyavaad)\b/i],
    replies: ["You're welcome!", 'Happy to help!', 'Glad I could assist!'],
  },
  {
    patterns: [/\b(order|placed|confirm|status|order.*kiya)\b/i],
    replies: ['Let me check your order status.', "I'll pull up the order details.", 'Your order is being processed.'],
  },
  {
    patterns: [/\b(size|sizing|measurement|fit|naap)\b/i],
    replies: ["Here's our size chart:", 'What size are you looking for?', 'I can help with sizing. What are your measurements?'],
  },
  {
    patterns: [/\b(discount|offer|coupon|sale|deal|offer.*hai)\b/i],
    replies: ['Let me check current offers.', "Here are our ongoing deals:", "I'll apply the best available discount."],
  },
  {
    patterns: [/\b(pay|payment|upi|card|cod|cash|paisa|paise)\b/i],
    replies: ['We accept UPI, cards, and COD.', 'Which payment method do you prefer?', 'COD is available for orders under ₹5000.'],
  },
  {
    patterns: [/\b(photo|image|pic|picture|dikhao|show)\b/i],
    replies: ["Here's the product image:", 'Let me send you the photos.', 'I can share more images if needed.'],
  },
  {
    patterns: [/\?/],
    replies: ["I'll look into that for you.", 'Let me find out and get back to you.', 'Good question — checking now.'],
  },
];

export function SmartReply({ lastMessageContent, onSelect }: SmartReplyProps) {
  const { colors } = useUIStore();

  const suggestions = useMemo(() => {
    if (!lastMessageContent || !lastMessageContent.trim()) return [];
    const text = lastMessageContent.toLowerCase();

    for (const rule of RULES) {
      if (rule.patterns.some((p) => p.test(text))) {
        return rule.replies.slice(0, 3);
      }
    }
    return [];
  }, [lastMessageContent]);

  if (suggestions.length === 0) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
      <View style={styles.labelRow}>
        <Zap color={colors.green} size={12} fill={colors.green} />
        <Text style={[styles.label, { color: colors.textDim2 }]}>Quick replies</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
        keyboardShouldPersistTaps="handled"
      >
        {suggestions.map((reply, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.chip, { backgroundColor: colors.greenDim, borderColor: colors.green + '44' }]}
            onPress={() => onSelect(reply)}
            activeOpacity={0.7}
          >
            <Text style={[styles.chipText, { color: colors.green }]} numberOfLines={1}>
              {reply}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: 6, paddingBottom: 4, borderTopWidth: 0.5 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 14, marginBottom: 4 },
  label: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  chips: { paddingHorizontal: 12, gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1 },
  chipText: { fontSize: 12, fontWeight: '500', maxWidth: 200 },
});
