'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { 
  ChatBubbleLeftRightIcon, 
  XMarkIcon, 
  PaperAirplaneIcon,
  UserIcon,
  SparklesIcon,
  ClockIcon,
  AcademicCapIcon,
  ListBulletIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatHistory {
  _id: string;
  title: string;
  lastUpdated: string;
  messages: any[];
}

interface CourseContext {
  title: string;
  description: string;
  content?: string;
}

interface ChatbotProps {
  courseContext?: CourseContext;
}

export default function Chatbot({ courseContext }: ChatbotProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [chatHistories, setChatHistories] = useState<ChatHistory[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [dynamicCourseContext, setDynamicCourseContext] = useState<CourseContext | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your AI learning assistant. I can help you understand course material, explain concepts, and answer questions. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
      fetchChatHistory();
    }
  }, [isOpen]);

  // Fetch dynamic course context based on URL
  useEffect(() => {
    const courseIdMatch = pathname?.match(/\/courses\/([a-zA-Z0-9_-]+)/);
    if (courseIdMatch && courseIdMatch[1]) {
      const courseId = courseIdMatch[1];
      
      // Avoid fetching if it's the `page.tsx` base path or specific paths that don't hold IDs 
      if (courseId.length > 5) {
        fetch(`/auth/api/courses/${courseId}`)
          .then(res => res.json())
          .then(data => {
            if (data.success && data.course) {
              setDynamicCourseContext({
                title: data.course.title,
                description: data.course.description,
                content: `Category: ${data.course.category}, Level: ${data.course.level}`
              });
            }
          })
          .catch(err => console.error("Failed to fetch course context", err));
      }
    } else {
      setDynamicCourseContext(null);
    }
  }, [pathname]);

  const fetchChatHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch('/auth/api/chat', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setChatHistories(data.chats);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadChat = (chatId: string) => {
    const history = chatHistories.find(c => c._id === chatId);
    if (history) {
      setCurrentChatId(chatId);
      setMessages(history.messages.map((msg, index) => ({
        id: index.toString(),
        role: msg.role,
        content: msg.content,
        timestamp: new Date(msg.timestamp || Date.now())
      })));
      setShowHistory(false);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please sign in to use the chatbot');
      }

      const activeContext = courseContext || dynamicCourseContext;
      const contextString = activeContext ? JSON.stringify(activeContext) : undefined;

      const response = await fetch('/auth/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          courseContent: contextString,
          chatId: currentChatId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }

      // Add empty assistant message that we will populate
      const assistantMessageId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date()
      }]);
      setIsLoading(false);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.slice(6).trim();
              if (!dataStr) continue;

              try {
                const parsed = JSON.parse(dataStr);
                
                if (parsed.text) {
                  assistantContent += parsed.text;
                  setMessages(prev => prev.map(msg => 
                    msg.id === assistantMessageId 
                      ? { ...msg, content: assistantContent }
                      : msg
                  ));
                }

                if (parsed.done && parsed.chatId && !currentChatId) {
                  setCurrentChatId(parsed.chatId);
                  fetchChatHistory();
                }
              } catch (e) {
                console.error("Error parsing stream chunk", e);
              }
            }
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send message');
      
      // Add error message from assistant
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I apologize, but I encountered an error: ${err.message}. Please try again.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const suggestedQuestions = [
    "Explain the main concept of this course",
    "What are the key takeaways?",
    "Can you give me an example?",
    "Help me understand this topic",
    "What should I focus on for the quiz?"
  ];

  const clearChat = () => {
    setCurrentChatId(null);
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: 'Hello! I\'m your AI learning assistant. I can help you understand course material, explain concepts, and answer questions. How can I help you today?',
        timestamp: new Date()
      }
    ]);
  };

  const activeContext = courseContext || dynamicCourseContext;

  return (
    <>
      {/* Chatbot Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:scale-105 group"
        aria-label="Open chatbot"
      >
        <ChatBubbleLeftRightIcon className="h-6 w-6" />
        <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs animate-pulse">
          <SparklesIcon className="h-3 w-3 text-white" />
        </span>
      </button>

      {/* Chatbot Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center sm:p-0">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* Chat Container */}
          <div className="relative w-full max-w-2xl h-[80vh] sm:h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden transform transition-all">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-full">
                    <AcademicCapIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">AI Learning Assistant</h3>
                    <p className="text-blue-100 text-sm truncate max-w-[200px] sm:max-w-xs">
                      {activeContext ? `Helping with: ${activeContext.title}` : 'Ready to help you learn!'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setShowHistory(!showHistory);
                      if (!showHistory) fetchChatHistory();
                    }}
                    className="p-2 hover:bg-white/20 rounded-full transition"
                    title="Toggle History"
                  >
                    <ListBulletIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={clearChat}
                    className="px-3 py-1 text-sm bg-white/20 rounded-lg hover:bg-white/30 transition"
                    title="New chat"
                  >
                    New
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-white/20 rounded-full transition"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {showHistory ? (
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-2">
                <h4 className="text-sm font-semibold text-gray-600 mb-2 px-2 uppercase tracking-wide">Your Conversations</h4>
                {chatHistories.length === 0 ? (
                  <p className="text-gray-500 p-4 text-center">No past conversations found.</p>
                ) : (
                  chatHistories.map(chat => (
                    <button
                      key={chat._id}
                      onClick={() => loadChat(chat._id)}
                      className="text-left w-full p-4 bg-white hover:bg-blue-50 border border-gray-100 rounded-xl shadow-sm hover:shadow transition-all duration-200 group"
                    >
                      <p className="font-medium text-gray-800 group-hover:text-blue-600 truncate">{chat.title}</p>
                      <p className="text-xs text-gray-400 mt-1 flex items-center">
                        <ClockIcon className="h-3 w-3 mr-1 inline" />
                        {new Date(chat.lastUpdated).toLocaleDateString()} {new Date(chat.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </button>
                  ))
                )}
              </div>
            ) : (
              <>
                {/* Suggested Questions */}
                <div className="px-4 py-3 bg-gray-50 border-b overflow-x-auto">
                  <div className="flex space-x-2">
                    {suggestedQuestions.map((question, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setInput(question);
                          setTimeout(() => inputRef.current?.focus(), 100);
                        }}
                       className="flex-shrink-0 px-4 py-2 text-sm font-medium text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition shadow-sm hover:shadow"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl p-4 ${
                          message.role === 'user'
                            ? 'bg-blue-600 text-white rounded-br-none'
                            : 'bg-gray-100 text-gray-800 rounded-bl-none'
                        }`}
                      >
                        <div className="flex items-center mb-1">
                          {message.role === 'assistant' ? (
                            <div className="flex items-center space-x-2">
                              <AcademicCapIcon className="h-4 w-4 text-purple-600" />
                              <span className="text-xs font-medium">AI Assistant</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <UserIcon className="h-4 w-4 text-blue-300" />
                              <span className="text-xs font-medium text-blue-200">You</span>
                            </div>
                          )}
                          <span className="text-xs opacity-75 ml-3">
                            <ClockIcon className="h-3 w-3 inline mr-1" />
                            {formatTime(message.timestamp)}
                          </span>
                        </div>
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                  ))}

                  {/* Loading Indicator */}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="max-w-[80%] rounded-2xl p-4 bg-gray-100 text-gray-800 rounded-bl-none">
                        <div className="flex items-center space-x-2 mb-2">
                          <AcademicCapIcon className="h-4 w-4 text-purple-600" />
                          <span className="text-xs font-medium">AI Assistant</span>
                        </div>
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Error Message */}
                  {error && (
                    <div className="text-center p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="border-t p-4">
                  <div className="relative">
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask me anything about the course..."
                      className="w-full p-4 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none bg-white text-black placeholder:text-gray-500"
                      rows={2}
                      disabled={isLoading}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={isLoading || !input.trim()}
                      className={`absolute right-3 bottom-3 p-2 rounded-lg ${
                        isLoading || !input.trim()
                          ? 'bg-gray-300 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700'
                      } transition`}
                    >
                      <PaperAirplaneIcon className="h-5 w-5 text-white" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Powered by Google Gemini AI • Your conversations are private
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}