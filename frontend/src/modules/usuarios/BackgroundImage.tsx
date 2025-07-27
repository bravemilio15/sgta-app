import React from 'react';
import './BackgroundImage.css';

const BackgroundImage: React.FC = () => {
  return (
    <div className="background-image-container">
      <div className="background-image"></div>
      <div className="background-overlay"></div>
    </div>
  );
};

export default BackgroundImage; 