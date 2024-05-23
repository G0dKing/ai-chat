import { useReducer, useState, useCallback, useEffect, useRef } from "react";
import axios from "axios";

const initialState = {
  conversation: [],
  loading: false,
  typing: "",
  model: import.meta.env.VITE_AI_MODEL || "meta-llama/Llama-2-7b-chat-hf",
  role: import.meta.env.VITE_ROLE || "system",
  instruction: "Please respond to the following using Markdown syntax.",
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
          { type: "assistant", text: action.payload },
        ],
      };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_TYPING":
      return { ...state, typing: action.payload };
    case "SET_MODEL":
      return { ...state, model: action.payload };
    case "SET_ROLE":
      return { ...state, role: action.payload };
    case "SET_INSTRUCTION":
      return { ...state, instruction: action.payload };
    case "CLEAR_CONVERSATION":
      return { ...state, conversation: [] };
    default:
      return state;
  }}

const useAPI = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [prompt, setPrompt] = useState("");

  const getInstruction = useCallback((model) => {
    let instruction = "Please format your response using Markdown syntax.";
    switch (model) {
      case "meta-llama/Llama-2-7b-chat-hf":
        return (import.meta.env.VITE_INSTRUCTION_LLAMA2) + instruction;
      case "facebook/incoder-6B":
        return (import.meta.env.VITE_INSTRUCTION_CODELLAMA) + instruction;
      case "mistralai/Mistral-7B":
        return (import.meta.env.VITE_INSTRUCTION_MISTRAL) + instruction;
      case "openai-gpt-3":
        return (import.meta.env.VITE_INSTRUCTION_PHI) + instruction;
      case "gemma-llm-6b":
        return (import.meta.env.VITE_INSTRUCTION_GEMMA) + instruction;
      case "EleutherAI/gpt-neo-2.7B":
        return (import.meta.env.VITE_INSTRUCTION_GPT_NEO) + instruction;
      default:
        return "You are a helpful AI assistant." + instruction;
    }
  }, []);

  const typingAnimation = useCallback(async (message) => {
    let accumulatedTyping = "";
    for (let char of message) {
      accumulatedTyping += char;
      dispatch({ type: "SET_TYPING", payload: accumulatedTyping });
      await new Promise((resolve) => setTimeout(resolve, 15));
    }
  }, []);

  const promptRef = useRef(prompt);

  useEffect(() => {
    promptRef.current = prompt;
  }, [prompt]);

  const sendPrompt = useCallback(async () => {
    try {
      dispatch({ type: "SET_TYPING", payload: "" });
      dispatch({ type: "SET_LOADING", payload: true });

      const instruction = getInstruction(state.model);
      const history = [
        { role: "system", content: instruction },
        ...state.conversation.map((entry) => ({
          role: entry.type === "user" ? "user" : "assistant",
          content: entry.text,
        })),
      ];

      console.log("Sending request with history:", history);

      const request = await axios.post("http://localhost:3030/ai-chat", {
        prompt: promptRef.current,
        model: state.model,
      });

      dispatch({ type: "SET_LOADING", payload: false });

      const response = request.data.message;
      console.log("Received response:", response);
      await typingAnimation(response);

      dispatch({ type: "AI_OUTPUT", payload: response });
      dispatch({ type: "SET_TYPING", payload: "" });
    } catch (error) {
      console.error("Server Error:", error);
      dispatch({ type: "SET_LOADING", payload: false });
      dispatch({
        type: "AI_OUTPUT",
        payload: "Error: Server Error. Please try again later.",
      });
    }
  }, [
    state.model,
    state.conversation,
    getInstruction,
    typingAnimation,
    dispatch,
  ]);

  const updatePrompt = useCallback((event) => {
    setPrompt(event.target.value);
  }, []);

  const submitPrompt = useCallback(
    (event) => {
      event.preventDefault();
      if (state.loading || state.typing || !promptRef.current.trim()) return;

      dispatch({ type: "USER_INPUT", payload: promptRef.current });
      sendPrompt();
      setPrompt("");
    },
    [state.loading, state.typing, sendPrompt]
  );

  const submitOnEnter = useCallback(
    (event) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        submitPrompt(event);
      }
    },
    [submitPrompt]
  );

  const clearConversation = useCallback(() => {
    dispatch({ type: "CLEAR_CONVERSATION" });
    setPrompt("");
  }, []);

  return {
    state,
    prompt,
    updatePrompt,
    submitPrompt,
    submitOnEnter,
    clearConversation,
    dispatch,
  };
};

export default useAPI;
