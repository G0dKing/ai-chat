import { useState, useEffect } from "react";
import axios from "axios";
import "../App.css";
import Loader from './Loader'

const Ollama = () => {
  const [userInput, setUserInput] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [typingResponse, setTypingResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [userMessage, setUserMessage] = useState("");

  const sendMessageToServer = async () => {
    try {
      setLoading(true);
      const response = await axios.post("http://localhost:3001/ai/chat", {
        message: userInput,
      });

      setUserMessage(userInput);

      const receivedMessage = response.data.message;

      setChatHistory([...chatHistory, userMessage, receivedMessage]);
      setTypingResponse("");
      setLoading(false);
    } catch (error) {
      console.error("Error communicating with server:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    const typeResponse = async (response) => {
      for (let i = 0; i < response.length; i++) {
        setTypingResponse((prev) => prev + response[i]);
        await new Promise((resolve) => setTimeout(resolve, 20));
      }
    };

    if (chatHistory.length > 0) {
      typeResponse(chatHistory[chatHistory.length - 1]);
    }
  }, [chatHistory]);

  const handleInputChange = (event) => {
    setUserInput(event.target.value);
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    if (userInput.trim() !== "") {
      sendMessageToServer();
      setUserInput("");
      setUserMessage("");
    }
  };

  return (
    <div className='chatContainer'>
      <div className="chatHistory">
        {chatHistory.map((message, index) => (
          <div key={index}>
            {index < chatHistory.length - 1 ? message : typingResponse}
          </div>
        ))}
        {loading && <div className="loading"><Loader /></div>}
      </div>
      <div className="inputArea">
        <form onSubmit={handleFormSubmit}>
          <textarea
            rows={3}
            value={userInput}
            onChange={handleInputChange}
            placeholder="Say something..."
          />
          <button  className="submitButton" type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
};

export default Ollama;
