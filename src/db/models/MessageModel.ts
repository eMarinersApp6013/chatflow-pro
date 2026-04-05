import { Model } from '@nozbe/watermelondb';
import { field, relation } from '@nozbe/watermelondb/decorators';
import { Associations } from '@nozbe/watermelondb/Model';
import ConversationModel from './ConversationModel';
import type { ChatwootAttachment } from '../../types/chatwoot';

export default class MessageModel extends Model {
  static table = 'messages';

  static associations: Associations = {
    conversations: { type: 'belongs_to', key: 'conversation_id' },
  };

  @field('remote_id') remoteId!: number;
  @field('conversation_id') conversationId!: string;
  @field('conversation_remote_id') conversationRemoteId!: number;
  @field('message_type') messageType!: number;
  @field('content') content!: string | null;
  @field('private') isPrivate!: boolean;
  @field('status') status!: string;
  @field('created_at') createdAt!: number;
  @field('sender_id') senderId!: number | null;
  @field('sender_name') senderName!: string | null;
  @field('sender_avatar') senderAvatar!: string | null;
  @field('attachments') attachmentsJson!: string | null;
  @field('is_pending') isPending!: boolean;
  @field('is_starred') isStarred!: boolean;
  @field('reply_to_id') replyToId!: number | null;
  @field('reactions_json') reactionsJson!: string | null;

  @relation('conversations', 'conversation_id') conversation!: ConversationModel;

  get attachments(): ChatwootAttachment[] {
    try {
      return JSON.parse(this.attachmentsJson || '[]');
    } catch {
      return [];
    }
  }

  // true = message sent by the agent (outgoing)
  get isOutgoing(): boolean {
    return this.messageType === 1;
  }

  // true = incoming from contact
  get isIncoming(): boolean {
    return this.messageType === 0;
  }

  // true = activity (conversation assigned, etc.)
  get isActivity(): boolean {
    return this.messageType === 2;
  }

  // Returns reaction counts: { "👍": 2, "❤️": 1 }
  get reactions(): Record<string, number> {
    if (!this.reactionsJson) return {};
    try {
      return JSON.parse(this.reactionsJson) as Record<string, number>;
    } catch {
      return {};
    }
  }
}
