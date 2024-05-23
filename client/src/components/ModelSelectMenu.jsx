import { } from "react";
import { PropTypes } from 'prop-types';
import "./styles/ModelSelectMenu.css";

const ModelSelectMenu = ({ models, selectedModel, onSelectModel }) => {
  return (
    <div className='modelSelectContainer'>
    <div className="modelSelectMenu">
      <label htmlFor="model-select">Select Model:</label>
      <select
        id="model-select"
        value={selectedModel}
        onChange={onSelectModel}
      >
        {models.map((model) => (
          <option key={model} value={model}>
            {model}
          </option>
        ))}
      </select>
      </div>
      </div>
  );
};


ModelSelectMenu.propTypes = {
  models: PropTypes.arrayOf(PropTypes.string).isRequired,
  selectedModel: PropTypes.string.isRequired,
  onSelectModel: PropTypes.func.isRequired,
};

export default ModelSelectMenu;
