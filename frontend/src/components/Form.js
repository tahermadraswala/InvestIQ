import React from 'react';

const Form = ({ title, onSubmit, children, buttonText, error, loading }) => {
  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">{title}</h2>
      <form onSubmit={onSubmit}>
        {children}
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-blue-400"
          disabled={loading}
        >
          {loading ? 'Loading...' : buttonText}
        </button>
      </form>
    </div>
  );
};

export default Form;