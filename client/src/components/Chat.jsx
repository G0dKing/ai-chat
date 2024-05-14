// Chat.jsx //
import { useState, useReducer, useEffect, useRef } from "react";
import axios from "axios";
import Loading from "./Loading";
import "./Chat.css";

// Initialize state variables
const initialState = {
  conversation: [],
  loading: false,
  typing: "",
};

// State management logic
function reducer(state, action) {
  switch (action.type) {
    case "USER_INPUT":
      return {
        ...state,
        conversation: [
          ...state.conversation,
          { type: "user", text: action.payload },
        ],
      };
    case "AI_OUTPUT":
      return {
        ...state,
        conversation: [
          ...state.conversation,
          { type: "bot", text: action.payload },
        ],
      };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_TYPING":
      return { ...state, typing: action.payload };
    default:
      return state;
  }
}

// Component Logic
const Chat = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [prompt, setPrompt] = useState("");

  // Function to send user-input to Ollama instance via proxy server
  const sendPrompt = async () => {
    dispatch({ type: "SET_TYPING", payload: "" }); // Reset typing animation
    try {
      // Start loading animation
      dispatch({ type: "SET_LOADING", payload: true });
      // Send prompt to proxy server using Axios and wait for a response
      const request = await axios.post("http://localhost:3001/ai-chat", {
        message: prompt,
      });
      // Stop loading animation on success
      dispatch({ type: "SET_LOADING", payload: false });

      // Parse AI response and begin typing animation
      const response = request.data.message;
      await typingAnimation(response);

      // Save response to chat history
      dispatch({ type: "AI_OUTPUT", payload: response });
      dispatch({ type: "SET_TYPING", payload: "" }); // Reset typing animation
    } catch (error) {
      console.error("Server Error:", error);
      dispatch({ type: "SET_LOADING", payload: false }); // Stop loading animation on error
    }
  };

  // Function to simulate the AI typing its responses in realtime
  const typingAnimation = async (message) => {
    let accumulatedTyping = "";
    for (let char of message) {
      accumulatedTyping += char;
      dispatch({ type: "SET_TYPING", payload: accumulatedTyping });
      await new Promise((resolve) => setTimeout(resolve, 20));
    }
  };

  // Function to match prompt to user-input in realtime
  const updatePrompt = (event) => {
    setPrompt(event.target.value);
  };

  // Function to submit prompt to API unless loading, typing, or blank
  const submitPrompt = (event) => {
    event.preventDefault();
    if (state.loading || state.typing) {
      return;
    }
    if (prompt.trim() !== "") {
      dispatch({ type: "USER_INPUT", payload: prompt });
      sendPrompt();
      setPrompt("");
    }
  };

  // Function to submit prompt when Enter is pressed (unless holding Shift)
  const submitOnEnter = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submitPrompt(event);
    }
  };

  // Limit conversation to scrollable chat window
  const chatWindowRef = useRef(null);
  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [state.conversation, state.typing, state.loading]);

  // Render for display in browser
  return (
    <div className="chatContainer">
      {/* Header Area */}
      <div className="headerContainer">
        <h1>Model: LLAMA-3</h1>
      </div>
      {/* Message Display Window */}
      <div className="chatWindow" ref={chatWindowRef}>
        {state.conversation.map((entry, index) => (
          <div
            key={index}
            className={`chatMessage ${
              entry.type === "user" ? "userChat" : "botChat" // Adapt messages based on sender
            }`}
          >
            {entry.text}
          </div>
        ))}
        {/* Conditional Loading State */}
        {state.loading && (
          <div className="chatMessage botChat">
            <div className="loadingWrapper">
              <Loading />
            </div>
          </div>
        )}
        {/* Conditional Simulated-Typing State*/}
        {state.typing && (
          <div className="chatMessage botChat">{state.typing}</div>
        )}
      </div>

      {/* User Input Area */}
      <div className="inputContainer">
        <form onSubmit={submitPrompt}>
          <textarea
            rows={3}
            value={prompt}
            onChange={updatePrompt}
            onKeyDown={submitOnEnter}
            placeholder="Say something..."
          />
          <button className="submitButton" type="submit">
            SUBMIT
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
