import React from "react";
import { FaGlobeAsia } from "react-icons/fa";

const Header = () => {
  return (
    <header className="header">
      <div className="logo-container">
        <FaGlobeAsia className="logo-icon" />
        <h1>
          GlobalRate <span className="highlight">Live</span>
        </h1>
      </div>
      <p className="subtitle">Real-time JPY Exchange Tracker</p>
    </header>
  );
};

export default Header;
