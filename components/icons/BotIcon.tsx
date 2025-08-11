
import React from 'react';

const BotIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h4zm0 18a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-4zm-6-8a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-4zM9 4.5a.5.5 0 0 0-1 0V6a.5.5 0 0 0 1 0V4.5zm4 11a.5.5 0 0 0-1 0v1.5a.5.5 0 0 0 1 0V15.5z" />
    <path d="M12 2a9 9 0 0 1 9 9v2a9 9 0 0 1-9 9H8a9 9 0 0 1-9-9v-2a9 9 0 0 1 9-9h4zm0-2a11 11 0 0 0-11 11v2a11 11 0 0 0 11 11h4a11 11 0 0 0 11-11v-2a11 11 0 0 0-11-11H8z" />
  </svg>
);

export default BotIcon;
