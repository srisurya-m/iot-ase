import React from 'react';
import { ChevronUp, Menu } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="header__logo">
        <div className="header__logo-icon">
          I
        </div>
        <span className="header__logo-text">IOT-ASE</span>
      </div>
      
      <nav className="header__nav">
        <button className="header__nav-button">
          <Menu />
        </button>
        <button className="header__nav-button">
          <ChevronUp />
        </button>
      </nav>
    </header>
  );
};

export default Header;