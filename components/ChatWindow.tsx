import React, { useState, useRef, useEffect, useCallback } from 'react';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import SendIcon from './icons/SendIcon';
import PaperclipIcon from './icons/PaperclipIcon';
import MicrophoneIcon from './icons/MicrophoneIcon';
import XCircleIcon from './icons/XCircleIcon';
import VerificationCard from './VerificationCard';
import BotIcon from './icons/BotIcon';
import type { Language, Message, ConversationStep, Translations, ExtractedIdData } from '../types';
import { MessageSender } from '../types';

// Type definitions for the Web Speech API to satisfy TypeScript
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: SpeechRecognitionEvent) => void;
  onend: () => void;
  onerror: (event: Event) => void;
  start(): void;
  stop(): void;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface ChatWindowProps {
  language: Language;
  messages: Message[];
  onSendMessage: (messageText: string, file: File | null) => Promise<void>;
  isLoading: boolean;
  onReset: () => void;
  conversationStep: ConversationStep;
  onSelectIdType: (idType: 'Aadhaar' | 'PAN' | 'Passport') => void;
  translations: Translations | null;
  extractedIdData: ExtractedIdData | null;
  onConfirmVerification: () => void;
  onRetryVerification: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ 
  language, messages, onSendMessage, isLoading, onReset, 
  conversationStep, onSelectIdType, translations,
  extractedIdData, onConfirmVerification, onRetryVerification
}) => {
  const [inputText, setInputText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const isSpeechRecognitionSupported = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
  const isInputDisabled = isLoading || conversationStep === 'AWAITING_ID_TYPE' || conversationStep === 'AWAITING_CONFIRMATION';

  useEffect(() => {
    if (!isSpeechRecognitionSupported) return;

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognitionAPI();
    const recognition = recognitionRef.current;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = language.code;

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      setInputText(finalTranscript + interimTranscript);
    };
    
    recognition.onend = () => {
      setIsRecording(false);
    };

    return () => {
      recognition.stop();
    };
  }, [language.code, isSpeechRecognitionSupported]);

  const handleToggleRecording = () => {
    if (isInputDisabled) return;
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      try {
        recognitionRef.current?.start();
      } catch (e) {
        console.error("Speech recognition error:", e);
        setIsRecording(false);
        return;
      }
    }
    setIsRecording(!isRecording);
  };
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((inputText.trim() || file) && !isInputDisabled) {
      const textToSend = inputText.trim();
      await onSendMessage(textToSend, file);
      setInputText('');
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  const getPlaceholderText = useCallback(() => {
    if (!translations) {
      return "Ask me anything..."; // Fallback for safety
    }
    if (isRecording) {
      return translations.placeholderListening;
    }
    if (isInputDisabled) {
      return translations.placeholderInstructions;
    }
    if (conversationStep === 'AWAITING_NAME') {
      return translations.placeholderEnterName;
    }
    return translations.placeholderDefault;
  }, [isRecording, isInputDisabled, conversationStep, translations]);

  const ID_BUTTON_STYLE = "bg-white border border-blue-600 text-blue-600 rounded-full px-4 py-2 text-sm font-medium hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <div className="flex flex-col h-screen w-screen bg-white">
      <header className="flex shrink-0 items-center justify-between p-4 px-6 border-b border-gray-200">
        <div>
          <h1 className="text-lg font-semibold text-slate-800">{translations?.title || 'Kaabharat Onboarding'}</h1>
          <p className="text-sm text-blue-600">{translations?.conversationSubtitle || `${language.name} Conversation`}</p>
        </div>
        <button
          onClick={onReset}
          className="px-4 py-2 text-sm font-medium text-slate-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
        >
          {translations?.changeLanguageButton || 'Change Language'}
        </button>
      </header>
      
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl w-full space-y-6 p-6">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            {isLoading && messages.length > 0 && messages[messages.length - 1]?.sender === MessageSender.USER && (
                <div className="flex items-end gap-2 justify-start w-full">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                      <BotIcon className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="bg-gray-200 rounded-2xl">
                        <TypingIndicator />
                    </div>
                </div>
            )}
            {conversationStep === 'AWAITING_ID_TYPE' && !isLoading && translations && (
                <div className="flex justify-center items-center gap-3 pt-2">
                    <button onClick={() => onSelectIdType('Aadhaar')} className={ID_BUTTON_STYLE}>{translations.aadhaar}</button>
                    <button onClick={() => onSelectIdType('PAN')} className={ID_BUTTON_STYLE}>{translations.pan}</button>
                    <button onClick={() => onSelectIdType('Passport')} className={ID_BUTTON_STYLE}>{translations.passport}</button>
                </div>
            )}
            {conversationStep === 'AWAITING_CONFIRMATION' && extractedIdData && !isLoading && translations && (
              <VerificationCard
                data={extractedIdData}
                onConfirm={onConfirmVerification}
                onRetry={onRetryVerification}
                translations={translations}
              />
            )}
            <div ref={messagesEndRef} />
        </div>
      </main>
      
      <footer className="shrink-0 bg-white p-4">
        <div className="mx-auto max-w-3xl">
            {file && (
              <div className="relative inline-block bg-gray-100 p-2 rounded-lg mb-3">
                <p className="text-sm text-gray-700">{file.name}</p>
                <button
                  onClick={() => { setFile(null); if(fileInputRef.current) fileInputRef.current.value = ''; }}
                  className="absolute -top-2 -right-2 bg-gray-600 text-white rounded-full"
                >
                  <XCircleIcon className="w-5 h-5" />
                </button>
              </div>
            )}
            <form onSubmit={handleSendMessage} className="relative flex w-full items-center">
               <div className="flex w-full items-center rounded-2xl bg-gray-100 p-2">
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isInputDisabled}
                    className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full text-gray-600 transition-all duration-200 hover:bg-gray-300/50 disabled:opacity-50"
                    aria-label="Attach file"
                  >
                    <PaperclipIcon className="w-5 h-5" />
                  </button>

                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={getPlaceholderText()}
                    disabled={isInputDisabled}
                    className="flex-1 w-full px-2 py-2 bg-transparent focus:outline-none text-slate-800 placeholder:text-gray-500 disabled:opacity-50 disabled:placeholder:text-gray-400"
                    autoFocus
                  />

                  {isSpeechRecognitionSupported && (
                     <button
                      type="button"
                      onClick={handleToggleRecording}
                      disabled={isInputDisabled}
                      className={`w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full transition-all duration-200 disabled:opacity-50 ${isRecording ? 'bg-red-500/20 text-red-500' : 'text-gray-600 hover:bg-gray-300/50'}`}
                      aria-label={isRecording ? 'Stop recording' : 'Start recording'}
                    >
                      <MicrophoneIcon className="w-5 h-5" />
                    </button>
                  )}
               </div>

               <button
                  type="submit"
                  disabled={isInputDisabled || (!inputText.trim() && !file)}
                  className="ml-3 w-12 h-12 flex-shrink-0 flex items-center justify-center bg-blue-600 rounded-full text-white transition-all duration-200 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  aria-label="Send message"
                >
                  <SendIcon className="w-6 h-6" />
                </button>
            </form>
        </div>
      </footer>
    </div>
  );
};

export default ChatWindow;