import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-800 py-6 mt-8 bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
        <p>© {new Date().getFullYear()} AI Generated Application. Built with React, Tailwind & TypeScript.</p>
      </div>
    </footer>
  );
};