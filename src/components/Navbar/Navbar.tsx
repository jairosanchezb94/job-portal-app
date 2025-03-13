import React, { useState } from 'react';
import './Navbar.scss';

interface NavbarProps {
  activeTab: 'jobs' | 'analytics';
  onTabChange: (tab: 'jobs' | 'analytics') => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };
  
  const handleTabClick = (tab: 'jobs' | 'analytics') => {
    onTabChange(tab);
    setMenuOpen(false);
  };
  
  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <div className="navbar-brand">
            <h1>Job Portal</h1>
          </div>
          
          <div className="navbar-menu-toggle" onClick={toggleMenu}>
            <span></span>
            <span></span>
            <span></span>
          </div>
          
          <div className={`navbar-menu ${menuOpen ? 'open' : ''}`}>
            <ul className="navbar-links">
              <li 
                className={`navbar-link ${activeTab === 'jobs' ? 'active' : ''}`}
                onClick={() => handleTabClick('jobs')}
              >
                Ofertas de Empleo
              </li>
              <li 
                className={`navbar-link ${activeTab === 'analytics' ? 'active' : ''}`}
                onClick={() => handleTabClick('analytics')}
              >
                Análisis de Mercado
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;