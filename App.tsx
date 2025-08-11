
import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import type { Content, Part, GoogleGenAI as GoogleGenAIType } from "@google/genai";
import LanguageSelector from './components/LanguageSelector';
import ChatWindow from './components/ChatWindow';
import ApiKeyPrompt from './components/ApiKeyPrompt';
import { MessageSender } from './types';
import type { Language, Message, ConversationStep, Translations, ExtractedIdData } from './types';
import { fileToGenerativePart } from './utils';
import { TRANSLATIONS } from './translations';

// Add type definition for the non-standard window.process property
declare global {
  interface Window {
    process?: {
      env?: {
        API_KEY?: string;
      };
    };
  }
}

const getApiKey = (): string | null => {
  // Access the key safely from the window object.
  const key = window.process?.env?.API_KEY;
  if (key && key !== 'YOUR_GEMINI_API_KEY_HERE') {
    return key;
  }
  return null;
};

const App: React.FC = () => {
  // Initialize the AI client synchronously. If it fails or the key is missing, ai will be null.
  const [ai, setAi] = useState<GoogleGenAIType | null>(() => {
    const apiKey = getApiKey();
    if (apiKey) {
      try {
        return new GoogleGenAI({ apiKey });
      } catch (error) {
        console.error("Failed to initialize GoogleGenAI:", error);
        return null;
      }
    }
    return null;
  });
  
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [conversationStep, setConversationStep] = useState<ConversationStep>('GREETING');
  const [extractedIdData, setExtractedIdData] = useState<ExtractedIdData | null>(null);

  const currentTranslations = selectedLanguage ? TRANSLATIONS[selectedLanguage.code] : null;

  const handleSelectLanguage = useCallback((language: Language) => {
    setSelectedLanguage(language);
    setMessages([]);
    setConversationStep('GREETING');
    setExtractedIdData(null);
  }, []);

  const messagesToHistory = (msgs: Message[]): Content[] => {
    return msgs.map(msg => ({
      role: msg.sender === MessageSender.USER ? 'user' : 'model',
      parts: [{ text: msg.file ? `[User uploaded file: ${msg.file.name}] ${msg.text}` : msg.text }]
    }));
  };

  const getSystemInstruction = (language: Language) => {
      return `You are a helpful and friendly onboarding assistant. You must converse ONLY in ${language.name}. Your responses should be concise and guide the user through the steps as instructed by the user prompts.`;
  }

  const streamAIResponse = async (contents: Content[], systemInstruction?: string): Promise<string> => {
    if (!ai) return '';
    let fullResponse = '';
    const botMessageId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: botMessageId, text: '', sender: MessageSender.BOT }]);

    const responseStream = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents,
        config: {
          systemInstruction: systemInstruction || getSystemInstruction(selectedLanguage!),
          thinkingConfig: { thinkingBudget: 0 }
        },
      });

    for await (const chunk of responseStream) {
      fullResponse += chunk.text;
      setMessages(prev =>
        prev.map(m => m.id === botMessageId ? { ...m, text: fullResponse } : m)
      );
    }
    return fullResponse;
  };

  useEffect(() => {
    const fetchInitialMessage = async () => {
      if (ai && selectedLanguage && messages.length === 0 && conversationStep === 'GREETING') {
        setIsLoading(true);
        try {
          const initialPrompt = `You are a helpful and friendly onboarding assistant for "${selectedLanguage.nativeAppName}". 
          In a single, warm paragraph, greet the user in ${selectedLanguage.name} and then ask for their name to begin.`;
          
          await streamAIResponse([{ role: 'user', parts: [{ text: initialPrompt }] }], getSystemInstruction(selectedLanguage));
          
          setConversationStep('AWAITING_NAME');
        } catch (error) {
          console.error("Failed to get initial message:", error);
          setMessages([{
            id: 'error-init',
            text: 'Sorry, I encountered an error. Please try refreshing.',
            sender: MessageSender.BOT,
          }]);
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchInitialMessage();
  }, [ai, selectedLanguage, conversationStep]); // Removed messages.length dependency to prevent re-triggering

  const handleSendMessage = async (messageText: string, file: File | null) => {
    if (!selectedLanguage || isLoading || !ai) return;

    setIsLoading(true);

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: MessageSender.USER,
    };
    
    if (file) {
      userMessage.file = {
        url: URL.createObjectURL(file),
        name: file.name,
        type: file.type,
      }
    }
    
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);

    try {
      const history: Content[] = messagesToHistory(messages); // History before the new message
      
      let promptForAI: string | null = null;
      let parts: Part[] = [];

      if (file && conversationStep === 'AWAITING_ID_UPLOAD') {
        const idAnalysisPrompt = `The user has uploaded a document for ID verification. You have two primary tasks:

1.  **Validate Document Type**: First, you MUST determine if the attached image is one of the following three Indian government-issued documents: Aadhaar Card, PAN Card, or Passport. It cannot be any other type of ID (like a driver's license) or a random image.
2.  **Extract or Reject**:
    *   **If the document IS valid**: Extract the user's full name, their ID number, and their date of birth. Also, compose a short conversational message in ${selectedLanguage.name} asking the user to confirm these details.
    *   **If the document IS NOT valid**: Do NOT attempt to extract any information. Instead, compose a polite rejection message in ${selectedLanguage.name} explaining that the uploaded document is not one of the accepted types and asking them to upload either an Aadhaar, PAN, or Passport.

You must return your response as a single JSON object that adheres to the provided schema.`;

        const schema = {
            type: Type.OBJECT,
            properties: {
                isValidDocument: { type: Type.BOOLEAN, description: "True if the document is an Aadhaar, PAN, or Passport. False otherwise." },
                name: { type: Type.STRING, description: "The user's full name. Only present if isValidDocument is true." },
                idNumber: { type: Type.STRING, description: "The ID number. Only present if isValidDocument is true." },
                dob: { type: Type.STRING, description: "The user's date of birth. Only present if isValidDocument is true." },
                confirmationMessage: { type: Type.STRING, description: `The message to show the user for confirmation. Only present if isValidDocument is true.` },
                rejectionMessage: { type: Type.STRING, description: `The polite rejection message. Only present if isValidDocument is false.` }
            },
            required: ["isValidDocument"]
        };
        
        const imagePart = await fileToGenerativePart(file);
        parts.push({ text: idAnalysisPrompt });
        parts.push(imagePart);
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ role: 'user', parts }],
            config: {
                responseMimeType: 'application/json',
                responseSchema: schema,
                systemInstruction: getSystemInstruction(selectedLanguage),
            },
        });

        const jsonResponse = JSON.parse(response.text);

        if (jsonResponse.isValidDocument) {
            const extractedData: ExtractedIdData = { 
                name: jsonResponse.name || 'N/A', 
                idNumber: jsonResponse.idNumber || 'N/A', 
                dob: jsonResponse.dob || 'N/A' 
            };
            setExtractedIdData(extractedData);
            setMessages(prev => [...prev, {
                id: 'bot-confirm', 
                text: jsonResponse.confirmationMessage || 'Please confirm your details.',
                sender: MessageSender.BOT
            }]);
            setConversationStep('AWAITING_CONFIRMATION');
        } else {
            setMessages(prev => [...prev, {
                id: 'bot-reject', 
                text: jsonResponse.rejectionMessage || 'The uploaded document is not valid. Please upload Aadhaar, PAN, or Passport.',
                sender: MessageSender.BOT
            }]);
            setConversationStep('AWAITING_ID_UPLOAD');
        }

      } else {
          switch (conversationStep) {
              case 'AWAITING_NAME':
                  promptForAI = `The user's name is "${messageText}". Acknowledge their name in ${selectedLanguage.name}, and then concisely ask them to select their ID type using the buttons that will be displayed. It's crucial that you DO NOT mention "Aadhaar, PAN, or Passport" in your text response.`;
                  setConversationStep('AWAITING_ID_TYPE');
                  break;
              default:
                  promptForAI = messageText;
                  break;
          }
          
          if(promptForAI) {
            await streamAIResponse([...history, { role: 'user', parts: [{ text: promptForAI }] }], getSystemInstruction(selectedLanguage));
          }
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessages(prev => [...prev, {
        id: 'error-send',
        text: 'Sorry, I encountered an error. Please try again.',
        sender: MessageSender.BOT,
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectIdType = async (idType: 'Aadhaar' | 'PAN' | 'Passport') => {
    if (!selectedLanguage || !currentTranslations || !ai) return;
    
    setIsLoading(true);

    const userMessageText = currentTranslations[idType.toLowerCase() as 'aadhaar' | 'pan' | 'passport'] || idType;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: userMessageText,
      sender: MessageSender.USER,
    };
    
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);

    const history = messagesToHistory(newMessages);
    const prompt = `The user has selected their ID type. In a very short message, acknowledge their choice of "${userMessageText}" and ask them to upload the document.`;
    
    await streamAIResponse([...history.slice(0, -1), {role: 'user', parts: [{text: prompt}]}]);
    
    setConversationStep('AWAITING_ID_UPLOAD');
    setIsLoading(false);
  };

  const handleConfirmVerification = async () => {
    if (!selectedLanguage || !ai) return;
    setIsLoading(true);
    setExtractedIdData(null);
    const prompt = `The user confirmed the extracted details were correct. Respond with a final, friendly confirmation message in ${selectedLanguage.name} saying their verification is complete.`;
    const history = messagesToHistory(messages);
    await streamAIResponse([...history, { role: 'user', parts: [{ text: prompt }] }]);
    setConversationStep('VERIFIED');
    setIsLoading(false);
  };
  
  const handleRetryVerification = async () => {
    if (!selectedLanguage || !ai) return;
    setIsLoading(true);
    setExtractedIdData(null);
    const prompt = `The user said the extracted details were incorrect and wants to retry. In ${selectedLanguage.name}, ask them to upload their ID document again.`;
    const history = messagesToHistory(messages);
    await streamAIResponse([...history, { role: 'user', parts: [{ text: prompt }] }]);
    setConversationStep('AWAITING_ID_UPLOAD');
    setIsLoading(false);
  };

  const onReset = () => {
    setSelectedLanguage(null);
    setMessages([]);
    setConversationStep('GREETING');
    setExtractedIdData(null);
  };

  // If the ai client failed to initialize (e.g., missing key), show the prompt.
  if (!ai) {
    return <ApiKeyPrompt />;
  }

  if (!selectedLanguage) {
    return <LanguageSelector onSelectLanguage={handleSelectLanguage} />;
  }

  return (
    <ChatWindow
      language={selectedLanguage}
      messages={messages}
      onSendMessage={handleSendMessage}
      isLoading={isLoading}
      onReset={onReset}
      conversationStep={conversationStep}
      onSelectIdType={handleSelectIdType}
      translations={currentTranslations}
      extractedIdData={extractedIdData}
      onConfirmVerification={handleConfirmVerification}
      onRetryVerification={handleRetryVerification}
    />
  );
};

export default App;
