import { } from "react";
import PropTypes from "prop-types";
import compose from "../assets/compose.png";
import "./NewChatButton.css";

const NewChatButton = ({ clearConversation }) => {
  return (
    <button className="newChat" onClick={clearConversation}>
      <img src={compose} alt="New Chat" />
    </button>
  );
};

// Validate prop types
NewChatButton.propTypes = {
  clearConversation: PropTypes.func.isRequired,
};

export default NewChatButton;
