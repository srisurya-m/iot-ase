import axios from "axios";
import { Send, Sparkles } from "lucide-react";
import React, { useRef, useState, useEffect } from "react";

interface ChatMessage {
  sender: "user" | "bot";
  text: string;
}

interface ApiResponse {
  success: boolean;
  answer?: string;
  message?: string;
  queryType?: string;
}

const Home = () => {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatDisplayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatDisplayRef.current) {
      chatDisplayRef.current.scrollTop = chatDisplayRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage: ChatMessage = { sender: "user", text: message };

    setChatHistory((prev) => [...prev, userMessage]);
    setMessage("");
    setIsLoading(true);
    setError(null);

    try {
      const res = await axios.post<ApiResponse>(
        `${import.meta.env.VITE_SERVER}/api/v1/search/new`,
        { query: message }
      );

      console.log("Backend response:", res.data); 
      if (res.data && res.data.success) {
        const botMessage: ChatMessage = {
          sender: "bot",
          text: res.data.answer || "Sorry, I couldn't find an answer.",
        };
        setChatHistory((prev) => [...prev, botMessage]);
      } else {
        throw new Error(res.data.message || "Invalid response from server.");
      }
    } catch (error) {
      console.error("Error:", error);

      let errorMessage = "An unknown error occurred.";


      if (error && typeof error === 'object' && 'response' in error) {

        const axiosError = error as { response?: { data?: { message?: string } }, message?: string };
        
        errorMessage =
          axiosError.response?.data?.message ||
          axiosError.message ||
          "An unknown error occurred.";
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      setError(errorMessage);
      const botErrorMessage: ChatMessage = {
        sender: "bot",
        text: `Sorry, something went wrong: ${errorMessage}`,
      };
      setChatHistory((prev) => [...prev, botErrorMessage]);
    } finally {
      setIsLoading(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setMessage(suggestion);
    textareaRef.current?.focus();
  };

  const suggestions = [
    "How to use AI?",
    "What is ChatGPT?",
    "Examples of prompts",
  ];

  return (
    <div className="home">
      <div className="home__background">
        <div className="home__particle home__particle--1"></div>
        <div className="home__particle home__particle--2"></div>
        <div className="home__particle home__particle--3"></div>
        <div className="home__particle home__particle--4"></div>
        <div className="home__particle home__particle--5"></div>
        <div className="home__particle home__particle--6"></div>
        <div className="home__particle home__particle--7"></div>
        <div className="home__particle home__particle--8"></div>

        <div className="home__shape home__shape--1"></div>
        <div className="home__shape home__shape--2"></div>
        <div className="home__shape home__shape--3"></div>

        <div className="home__line home__line--1"></div>
        <div className="home__line home__line--2"></div>
        <div className="home__line home__line--3"></div>
      </div>


      <div className="home__content">
        <h1 className="home__title">What's on your mind today?</h1>
        <p className="home__subtitle">Explore advanced IOT solutions...</p>

        <div className="home__chat-window">
          <div className="home__chat-display" ref={chatDisplayRef}>
            {chatHistory.map((msg, index) => (
              <div
                key={index}
                className={`home__chat-message home__chat-message--${msg.sender}`}
              >
                {msg.text}
              </div>
            ))}
            {isLoading && (
              <div className="home__chat-message home__chat-message--bot home__loader">
                <span></span>
                <span></span>
                <span></span>
              </div>
            )}
            {error && (
              <div className="home__error-message">Error: {error}</div>
            )}
          </div>


          <div className="home__chat-input-area">
            <div className="home__input-container">
              <textarea
                ref={textareaRef}
                className="home__input"
                placeholder="Send a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                disabled={isLoading}
              />
              <button
                className="home__send-button"
                onClick={handleSend}
                disabled={!message.trim() || isLoading}
              >
                <Send />
              </button>
            </div>

            {chatHistory.length === 0 && !isLoading && (
              <div className="home__suggestions">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    className="home__suggestion"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>


      <div className="home__star">
        <Sparkles />
      </div>
    </div>
  );
};

export default Home;