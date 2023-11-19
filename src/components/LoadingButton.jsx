import Loader from "../assets/loader.svg?react";

const LoadingButton = ({ onSubmit, text, loading = false, disabled }) => {
  return (
    <button className="submit-btn" onClick={onSubmit} disabled={disabled}>
      {!loading ? text : <Loader className="spinner" />}
    </button>
  );
};

export default LoadingButton;
