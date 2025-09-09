import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoginModal } from '@/components/LoginModal';

interface HeaderProps {
  onSectionClick: (sectionId: string) => void;
}

export const Header = ({ onSectionClick }: HeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { id: 'quem-somos', label: 'Quem Somos' },
    { id: 'servicos', label: 'Serviços' },
    { id: 'clientes', label: 'Clientes' },
    { id: 'contato', label: 'Contato' },
    { id: 'orcamento', label: 'Orçamento' },
  ];

  const handleNavClick = (sectionId: string) => {
    onSectionClick(sectionId);
    setIsMobileMenuOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'header-compact' : 'header-normal'
        }`}
    >
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        <div className="flex items-center">
          <img
            src="/logos/sta-telecom.jpg"
            alt="Logo STA Telecomunicações e Eletricidade LTDA"
            className={`transition-all duration-300 h-10 ${isScrolled ? 'h-8' : 'h-10'}`}
          />
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-1">
          {menuItems.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              onClick={() => handleNavClick(item.id)}
              className="text-foreground hover:text-primary hover:bg-accent/50 transition-colors"
            >
              {item.label}
            </Button>
          ))}
          <Button
            onClick={() => setIsLoginModalOpen(true)}
            className="btn-tech ml-4"
          >
            Login
          </Button>
        </nav>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-background/95 backdrop-blur-xl border-b border-border shadow-lg">
          <nav className="container mx-auto px-4 py-4 flex flex-col space-y-2">
            {menuItems.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                onClick={() => handleNavClick(item.id)}
                className="justify-start text-foreground hover:text-primary hover:bg-accent/50"
              >
                {item.label}
              </Button>
            ))}
            <Button
              onClick={() => setIsLoginModalOpen(true)}
              className="btn-tech justify-start mt-4"
            >
              Login
            </Button>
          </nav>
        </div>
      )}

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </header>
  );
};