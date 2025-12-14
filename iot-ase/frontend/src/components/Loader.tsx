import React from 'react';

interface LoaderProps {
  isVisible: boolean;
}

const Loader: React.FC<LoaderProps> = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="loader">
      <div className="loader__logo">
        <div className="loader__logo-icon">
          C
        </div>
        <span className="loader__logo-text">IOT-ASE</span>
      </div>
      <div className="loader__spinner"></div>
      <p className="loader__text">Initializing advanced IoT systems...</p>
    </div>
  );
};

export default Loader;