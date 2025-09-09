import React, { useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { QuemSomos } from '@/components/sections/QuemSomos';
import { Servicos } from '@/components/sections/Servicos';
import { Clientes } from '@/components/sections/Clientes';
import { Excelencia } from '@/components/sections/Excelencia';
import { Contato } from '@/components/sections/Contato';
import { Orcamento } from '@/components/sections/Orcamento';

const Index = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerHeight = 80; // Account for fixed header
      const elementPosition = element.offsetTop - headerHeight;
      
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    // Add smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';
    
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header onSectionClick={scrollToSection} />
      
      <main>
        <QuemSomos />
        <Servicos />
        <Clientes />
        <Excelencia />
        <Contato />
        <Orcamento />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
