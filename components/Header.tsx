
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="p-4 md:p-6 border-b border-gray-700/50 flex items-center justify-center">
      <div className="text-2xl font-bold tracking-wider">
        <span className="text-gray-200">ZAMA</span>
        <span className="text-accent">.AI</span>
        <span className="text-gray-500 font-mono text-sm ml-2">CHAT</span>
      </div>
    </header>
  );
};

export default Header;
