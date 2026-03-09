import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Stylized Chat Bubble with a premium feel */}
    <path
      d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 13.4876 3.36093 14.891 4 16.1247L3 21L7.87527 20C9.10897 20.6391 10.5124 21 12 21Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Elegant Heart integrated into the bubble */}
    <path
      d="M12 15.5C12 15.5 16 13 16 10.5C16 9.11929 14.8807 8 13.5 8C12.8369 8 12.2356 8.25883 11.7891 8.68281L12 8.89362L12.2109 8.68281C11.7644 8.25883 11.1631 8 10.5 8C9.11929 8 8 9.11929 8 10.5C8 13 12 15.5 12 15.5Z"
      fill="currentColor"
    />
  </svg>
);
