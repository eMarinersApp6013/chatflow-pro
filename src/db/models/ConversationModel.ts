import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';
import { Associations } from '@nozbe/watermelondb/Model';

export default class ConversationModel extends Model {
  static table = 'conversations';

  static associations: Associations = {
    messages: { type: 'has_many', foreignKey: 'conversation_id' },
  };

  @field('remote_id') remoteId!: number;
  @field('inbox_id') inboxId!: number;
  @field('status') status!: string;
  @field('unread_count') unreadCount!: number;
  @field('last_activity_at') lastActivityAt!: number;
  @field('contact_id') contactId!: string | null;
  @field('contact_name') contactName!: string;
  @field('contact_avatar') contactAvatar!: string | null;
  @field('assignee_id') assigneeId!: number | null;
  @field('assignee_name') assigneeName!: string | null;
  @field('labels') labelsJson!: string;
  @field('last_message_content') lastMessageContent!: string | null;
  @field('last_message_at') lastMessageAt!: number | null;
  @field('muted') muted!: boolean;
  @field('channel') channel!: string | null;
  @field('is_starred') isStarred!: boolean;
  @field('synced_at') syncedAt!: number;

  // Parse labels JSON array
  get labels(): string[] {
    try {
      return JSON.parse(this.labelsJson || '[]');
    } catch {
      return [];
    }
  }
}
