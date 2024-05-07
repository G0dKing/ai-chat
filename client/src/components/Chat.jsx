import { useState, useEffect } from "react";
import axios from "axios";
import Loader from "./Loader";
import "./Chat.css";

const Chat = () => {
  const [prompt, setPrompt] = useState("");
  const [conversation, setConversation] = useState([]);
  const [typing, setTyping] = useState("");
  const [loading, setLoading] = useState(false);

  const sendPrompt = async () => {
    try {
      setLoading(true);

      const request = await axios.post("http://localhost:3001/ai-chat", {
        message: prompt,
      });

      const answer = request.data.message;

      setConversation([...conversation, answer]);
      setTyping("");
      setLoading(false);

    } catch (error) {
      console.error("Error communicating with server:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    const typing = async (request) => {
      for (let i = 0; i < request.length; i++) {
        setTyping((prev) => prev + request[i]);
        await new Promise((resolve) => setTimeout(resolve, 20));
      }
    };

    if (conversation.length > 0) {
      typing(conversation[conversation.length - 1]);
    }
  }, [conversation]);

  const handlePrompt = (event) => {
    setPrompt(event.target.value);
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    if (prompt.trim() !== "") {
      sendPrompt();
      setPrompt("");
    }
  };

  return (
    <div className="container">
      <div className="chatContainer">
        <div className="conversation">
          {conversation.map((message, index) => (
            <div key={index}>
              {index < conversation.length - 1 ? message : typing}
            </div>
          ))}
          {loading && (
            <div className="loading">
              <Loader />
            </div>
          )}
        </div>
        <div className="inputArea">
          <form onSubmit={handleFormSubmit}>
            <textarea
              rows={3}
              value={prompt}
              onChange={handlePrompt}
              placeholder="Say something..."
            />
            <button className="submitButton" type="submit">
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;
