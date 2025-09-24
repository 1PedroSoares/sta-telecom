import React from 'react';
import { Button } from '@/components/ui/button';
import heroImage from '@/assets/hero-telecom.jpg';

const Hero = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerHeight = 80;
      const elementPosition = element.offsetTop - headerHeight;
      
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${heroImage})`,
        }}
      >
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center text-white">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
          SOLUÇÕES EM TELECOM & ELETRICIDADE
        </h1>
        
        <p className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto leading-relaxed text-white/90">
          A STA Telecom atua com excelência e qualidade para oferecer as melhores soluções sob medida para sua empresa.
        </p>
        
        <Button 
          onClick={() => scrollToSection('servicos')}
          size="lg"
          className="bg-white/10 text-white border border-white/20 hover:bg-white/20 text-lg px-8 py-6 h-auto font-semibold"
        >
          CONHEÇA NOSSOS SERVIÇOS
        </Button>
      </div>
    </section>
  );
};

export { Hero };