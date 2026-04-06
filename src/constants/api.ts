// Chatwoot API endpoint paths — base URL is configured per user at login

export const API = {
  // Auth
  PROFILE: '/api/v1/profile',

  // Conversations
  CONVERSATIONS: (accountId: number) =>
    `/api/v1/accounts/${accountId}/conversations`,
  CONVERSATION: (accountId: number, id: number) =>
    `/api/v1/accounts/${accountId}/conversations/${id}`,
  CONVERSATION_MESSAGES: (accountId: number, id: number) =>
    `/api/v1/accounts/${accountId}/conversations/${id}/messages`,
  CONVERSATION_LABELS: (accountId: number, id: number) =>
    `/api/v1/accounts/${accountId}/conversations/${id}/labels`,
  CONVERSATION_TOGGLE_STATUS: (accountId: number, id: number) =>
    `/api/v1/accounts/${accountId}/conversations/${id}/toggle_status`,
  CONVERSATION_MARK_READ: (accountId: number, id: number) =>
    `/api/v1/accounts/${accountId}/conversations/${id}/update_last_seen`,
  CONVERSATION_FILTER: (accountId: number) =>
    `/api/v1/accounts/${accountId}/conversations/filter`,

  // Contacts
  CONTACTS_SEARCH: (accountId: number) =>
    `/api/v1/accounts/${accountId}/contacts/search`,
  CONTACT: (accountId: number, id: number) =>
    `/api/v1/accounts/${accountId}/contacts/${id}`,
  CONTACT_CONVERSATIONS: (accountId: number, id: number) =>
    `/api/v1/accounts/${accountId}/contacts/${id}/conversations`,

  // Labels
  LABELS: (accountId: number) =>
    `/api/v1/accounts/${accountId}/labels`,

  // Canned responses
  CANNED_RESPONSES: (accountId: number) =>
    `/api/v1/accounts/${accountId}/canned_responses`,

  // Teams + Inboxes
  TEAMS: (accountId: number) =>
    `/api/v1/accounts/${accountId}/teams`,
  INBOXES: (accountId: number) =>
    `/api/v1/accounts/${accountId}/inboxes`,
  AGENTS: (accountId: number) =>
    `/api/v1/accounts/${accountId}/agents`,

  // Assignments
  CONVERSATION_ASSIGNMENTS: (accountId: number, conversationId: number) =>
    `/api/v1/accounts/${accountId}/conversations/${conversationId}/assignments`,
  CONVERSATION_TEAMS: (accountId: number, conversationId: number) =>
    `/api/v1/accounts/${accountId}/conversations/${conversationId}/teams`,
  CONVERSATION_CREATE: (accountId: number) =>
    `/api/v1/accounts/${accountId}/conversations`,

  // WhatsApp templates — per-inbox
  WHATSAPP_TEMPLATES: (accountId: number, inboxId: number) =>
    `/api/v1/accounts/${accountId}/inboxes/${inboxId}/whatsapp_templates`,

  // Message reaction
  MESSAGE_REACTION: (accountId: number, conversationId: number, messageId: number) =>
    `/api/v1/accounts/${accountId}/conversations/${conversationId}/messages/${messageId}/create_reaction`,

  // Canned responses CRUD
  CANNED_RESPONSE_CREATE: (accountId: number) =>
    `/api/v1/accounts/${accountId}/canned_responses`,
  CANNED_RESPONSE_UPDATE: (accountId: number, id: number) =>
    `/api/v1/accounts/${accountId}/canned_responses/${id}`,
  CANNED_RESPONSE_DELETE: (accountId: number, id: number) =>
    `/api/v1/accounts/${accountId}/canned_responses/${id}`,

  // Labels CRUD
  LABEL_CREATE: (accountId: number) =>
    `/api/v1/accounts/${accountId}/labels`,
  LABEL_UPDATE: (accountId: number, id: number) =>
    `/api/v1/accounts/${accountId}/labels/${id}`,
  LABEL_DELETE: (accountId: number, id: number) =>
    `/api/v1/accounts/${accountId}/labels/${id}`,

  // Reports
  REPORTS: (accountId: number) =>
    `/api/v1/accounts/${accountId}/reports`,
  REPORTS_SUMMARY: (accountId: number) =>
    `/api/v1/accounts/${accountId}/reports/summary`,
  REPORTS_AGENTS: (accountId: number) =>
    `/api/v1/accounts/${accountId}/reports/agents/conversations`,

  // Profile availability
  UPDATE_PROFILE: '/api/v1/profile',

  // WebSocket — ActionCable endpoint
  WS_CABLE: '/cable',
} as const;

export const WS_CHANNELS = {
  ROOM: 'RoomChannel',
} as const;

export const WS_EVENTS = {
  MESSAGE_CREATED: 'message.created',
  CONVERSATION_CREATED: 'conversation.created',
  TYPING_ON: 'typing_on',
  TYPING_OFF: 'typing_off',
  PRESENCE_UPDATE: 'presence.update',
} as const;
