import React from 'react';

export const Footer = () => {
  return (
    <footer className="bg-foreground text-primary-foreground py-8">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <p className="text-sm">
            © {new Date().getFullYear()} - Todos os direitos reservados a STA Telecom
          </p>
        </div>
      </div>
    </footer>
  );
};