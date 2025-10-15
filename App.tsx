import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { Message, Content } from './types';
import { generateGroundedResponseStream } from './services/geminiService';
import Header from './components/Header';
import ChatInput from './components/ChatInput';
import ChatMessage from './components/ChatMessage';
import { BotIcon } from './components/IconComponents';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [history, setHistory] = useState<Content[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = useCallback(async (inputText: string) => {
    if (!inputText.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
    };
    
    setMessages(prev => [...prev, userMessage]);

    const modelMessageId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: modelMessageId, text: '', sender: 'model', sources: [] }]);

    try {
      const stream = await generateGroundedResponseStream(history, inputText);

      let fullText = '';
      let groundingChunks: any[] = [];

      for await (const chunk of stream) {
        const chunkText = chunk.text;
        if(chunkText) {
            fullText += chunkText;
        }
       
        const newChunks = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (newChunks) {
            groundingChunks.push(...newChunks);
        }

        setMessages(prev => 
          prev.map(msg => 
            msg.id === modelMessageId ? { ...msg, text: fullText } : msg
          )
        );
      }
      
      const sourceMap = new Map<string, { uri: string; title: string }>();
      groundingChunks.forEach(chunk => {
        if (chunk.web?.uri) {
          sourceMap.set(chunk.web.uri, { uri: chunk.web.uri, title: chunk.web.title || chunk.web.uri });
        }
      });
      const uniqueSources = Array.from(sourceMap.values());

      setMessages(prev => 
        prev.map(msg => 
          msg.id === modelMessageId ? { ...msg, text: fullText, sources: uniqueSources } : msg
        )
      );

      setHistory(prev => [...prev, 
        { role: 'user', parts: [{ text: inputText }] },
        { role: 'model', parts: [{ text: fullText }] }
      ]);

    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Error: ${errorMessage}`);
      setMessages(prev => prev.filter(msg => msg.id !== modelMessageId));
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, history]);

  return (
    <div className="flex flex-col h-screen bg-primary text-gray-200 font-sans">
      <Header />
      <main ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {messages.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                <BotIcon className="w-24 h-24 mb-4 text-accent/50"/>
                <h2 className="text-2xl font-medium text-gray-300">Zama AI Chat</h2>
                <p className="mt-2">Ask me anything about Zama.ai's documentation.</p>
            </div>
        )}
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
         {isLoading && messages[messages.length-1]?.sender === 'model' && (
            <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                    <BotIcon className="w-6 h-6 text-accent" />
                </div>
                <div className="p-4 rounded-lg bg-gray-800 animate-pulse w-16 h-8"></div>
            </div>
        )}
      </main>
      <footer className="p-4 md:p-6 border-t border-gray-700/50">
        <div className="max-w-3xl mx-auto">
          {error && <p className="text-red-500 text-center mb-2">{error}</p>}
          <ChatInput onSendMessage={sendMessage} isLoading={isLoading} />
        </div>
      </footer>
    </div>
  );
};

export default App;