import { } from "react";
import PropTypes from "prop-types";
import pencil from "../assets/pencil.png";
import "./NewChatButton.css";

const NewChatButton = ({ clearConversation }) => {
  return (
    <button className="newChat" onClick={clearConversation}>
      <img src={pencil} alt="New Chat" />
    </button>
  );
};

// Validate prop types
NewChatButton.propTypes = {
  clearConversation: PropTypes.func.isRequired,
};

export default NewChatButton;
