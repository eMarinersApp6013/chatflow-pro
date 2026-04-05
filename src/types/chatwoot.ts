// Chatwoot API response types

export interface ChatwootProfile {
  id: number;
  name: string;
  email: string;
  account_id: number;
  access_token: string;
  pubsub_token: string;
  avatar_url: string;
  role: 'agent' | 'administrator';
}

export type ConversationStatus = 'open' | 'resolved' | 'pending' | 'snoozed';

export interface ChatwootLabel {
  id: number;
  title: string;
  description: string;
  color: string;
  show_on_sidebar: boolean;
}

export interface ChatwootContact {
  id: number;
  name: string;
  email: string | null;
  phone_number: string | null;
  avatar_url: string | null;
  identifier: string | null;
  location: string | null;
  created_at: string;
  additional_attributes: Record<string, unknown>;
}

export interface ChatwootInbox {
  id: number;
  name: string;
  channel_type: string;
  avatar_url: string | null;
}

export interface ChatwootAgent {
  id: number;
  name: string;
  email: string;
  avatar_url: string | null;
  role: 'agent' | 'administrator';
}

export interface ChatwootMeta {
  sender: Pick<ChatwootContact, 'id' | 'name' | 'avatar_url'>;
  assignee: ChatwootAgent | null;
  team: { id: number; name: string } | null;
}

export interface ChatwootConversation {
  id: number;
  inbox_id: number;
  status: ConversationStatus;
  unread_count: number;
  timestamp: number;
  created_at: number;
  updated_at: number;
  channel: string;
  labels: string[];
  meta: ChatwootMeta;
  last_activity_at: number;
  muted: boolean;
  can_reply: boolean;
  additional_attributes: Record<string, unknown>;
  // Last message preview
  messages?: ChatwootMessage[];
}

export type MessageType = 0 | 1 | 2 | 3; // incoming | outgoing | activity | template

export interface ChatwootAttachment {
  id: number;
  message_id: number;
  file_type: 'image' | 'audio' | 'video' | 'file' | 'location' | 'fallback' | 'share' | 'story_mention';
  account_id: number;
  file_url: string;
  thumb_url: string | null;
  file_size: number | null;
  data_url: string;
  extension: string | null;
  width: number | null;
  height: number | null;
}

export interface ChatwootMessage {
  id: number;
  conversation_id: number;
  message_type: MessageType;
  content: string | null;
  content_type: 'text' | 'input_select' | 'cards' | 'form' | 'article';
  content_attributes: Record<string, unknown>;
  created_at: number;
  private: boolean; // true = private note (yellow background)
  sender: Pick<ChatwootContact, 'id' | 'name' | 'avatar_url'> | null;
  attachments: ChatwootAttachment[] | null;
  status: 'sent' | 'delivered' | 'read' | 'failed';
}

export interface ChatwootConversationsResponse {
  data: {
    meta: {
      all_count: number;
      unassigned_count: number;
      assigned_count: number;
      resolved_count: number;
    };
    payload: ChatwootConversation[];
  };
}

export interface ChatwootMessagesResponse {
  payload: ChatwootMessage[];
}

export interface ChatwootSendMessagePayload {
  content: string;
  message_type?: 'outgoing';
  private?: boolean;
  content_type?: string;
  reply_to_id?: number;  // for threaded replies
}

export interface ChatwootWebSocketEvent {
  type: string;
  data: Record<string, unknown>;
}

export interface ChatwootTeam {
  id: number;
  name: string;
  description: string | null;
}

// ChatwootInbox is already declared above (ChatwootInbox interface).
// Re-exporting a richer form here for Phase 4.

export interface ChatwootTemplateComponent {
  type: 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTONS';
  text?: string;
  format?: string;
  buttons?: Array<{ type: string; text: string; url?: string; phone_number?: string }>;
}

export interface ChatwootTemplate {
  id: number;
  name: string;
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
  language: string;
  status: 'approved' | 'pending' | 'rejected';
  components: ChatwootTemplateComponent[];
}

export interface ChatwootReportSummary {
  account_conversations: number;
  incoming_messages_count: number;
  outgoing_messages_count: number;
  avg_first_response_time: number;
  avg_resolution_time: number;
  resolutions_count: number;
}

export interface ChatwootAgentReport {
  id: number;
  name: string;
  email: string;
  open_conversations_count: number;
  resolved_conversations_count: number;
}

export type AvailabilityStatus = 'online' | 'busy' | 'offline';
