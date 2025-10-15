export type MessageSender = 'user' | 'model';

export interface Source {
  uri: string;
  title: string;
}

export interface Message {
  id: string;
  text: string;
  sender: MessageSender;
  sources?: Source[];
}

// Types for structuring conversation history for the Gemini API
export interface ContentPart {
  text: string;
}

export interface Content {
  role: 'user' | 'model';
  parts: ContentPart[];
}
