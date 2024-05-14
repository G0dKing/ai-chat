// Chat.jsx //

import { useState, useReducer } from "react";
import axios from "axios";
import Loading from "./Loading";
import "./Chat.css";

const initialState = {
  conversation: [],
  loading: false,
  typing: "",
};

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

const Chat = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [prompt, setPrompt] = useState("");

    const sendPrompt = async () => {
      dispatch({ type: "SET_TYPING", payload: "" });
    try {
      console.log(`Requesting Data...`);
      dispatch({ type: "SET_LOADING", payload: true });
      const request = await axios.post("http://localhost:3001/ai-chat", {
        message: prompt,
      });
        dispatch({ type: "SET_LOADING", payload: false });
        dispatch({ type: "SET_LOADING", payload: "" });

      const response = request.data.message;
      console.log(`GET(200): OK`);

      await typingAnimation(response);
      dispatch({ type: "AI_OUTPUT", payload: response });
      dispatch({ type: "SET_TYPING", payload: "" });
    } catch (error) {
      console.error("Error communicating with server:", error);
    }
  };

  const typingAnimation = async (message) => {
    let accumulatedTyping = "";
    for (let char of message) {
      accumulatedTyping += char;
      dispatch({ type: "SET_TYPING", payload: accumulatedTyping });
      await new Promise((resolve) => setTimeout(resolve, 20));
    }
  };

  const updatePrompt = (event) => {
    setPrompt(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (prompt.trim() !== "") {
      dispatch({ type: "USER_INPUT", payload: prompt });
      sendPrompt();
      setPrompt("");
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(event);
    }
  };

  return (
    <div className="chatContainer">
      <div className="headerContainer">
        <h1>Model: LLAMA-3</h1>
      </div>
      <div className="chatWindow">
        {state.conversation.map((entry, index) => (
          <div
            key={index}
            className={`chatMessage ${
              entry.type === "user" ? "userChat" : "botChat"
            }`}
          >
            {entry.text}
          </div>
        ))}
        <div className='chatMessage botChat'>
          {state.loading && (
            <div className="loadingWrapper">
              <Loading />
            </div>
          )}
          <div>{state.typing}</div>
        </div>
      </div>
      <div className="inputContainer">
        <form onSubmit={handleSubmit}>
          <textarea
            rows={3}
            value={prompt}
            onChange={updatePrompt}
            onKeyDown={handleKeyPress}
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
