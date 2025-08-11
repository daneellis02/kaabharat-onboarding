export enum MessageSender {
  USER = 'user',
  BOT = 'bot',
}

export type ConversationStep = 'GREETING' | 'AWAITING_NAME' | 'AWAITING_ID_TYPE' | 'AWAITING_ID_UPLOAD' | 'AWAITING_CONFIRMATION' | 'VERIFIED';

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  nativeAppName: string;
}

export interface Message {
  id: string;
  text: string;
  sender: MessageSender;
  file?: {
    url: string;
    name: string;
    type: string;
  }
}

export interface Translations {
  title: string;
  changeLanguageButton: string;
  conversationSubtitle: string;
  aadhaar: string;
  pan: string;
  passport: string;
  confirmDetailsTitle: string;
  confirmDetailsSubtitle: string;
  dataFieldName: string;
  dataFieldIdNumber: string;
  dataFieldDob: string;
  retryUploadButton: string;
  confirmAndContinueButton: string;
  placeholderListening: string;
  placeholderInstructions: string;
  placeholderEnterName: string;
  placeholderDefault: string;
}

export interface ExtractedIdData {
  name: string;
  idNumber: string;
  dob: string;
}