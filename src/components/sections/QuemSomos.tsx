import React, { useEffect, useRef, useState } from 'react';

export const QuemSomos = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setMousePosition({ x, y });
      }
    };

    const section = sectionRef.current;
    if (section) {
      section.addEventListener('mousemove', handleMouseMove);
      return () => section.removeEventListener('mousemove', handleMouseMove);
    }
  }, []);

  return (
    <section 
      id="quem-somos" 
      ref={sectionRef}
      className="relative min-h-screen flex items-center py-20 overflow-hidden bg-white"
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div 
          className="absolute w-96 h-96 rounded-full bg-white/20 blur-3xl transition-transform duration-1000"
          style={{
            transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)`
          }}
        />
        <div 
          className="absolute top-1/2 right-0 w-64 h-64 rounded-full bg-primary/20 blur-2xl transition-transform duration-700"
          style={{
            transform: `translate(${-mousePosition.x * 0.3}px, ${mousePosition.y * 0.3}px)`
          }}
        />
        <div 
          className="absolute bottom-0 left-1/4 w-80 h-80 rounded-full bg-white/15 blur-3xl transition-transform duration-900"
          style={{
            transform: `translate(${mousePosition.x * 0.2}px, ${-mousePosition.y * 0.4}px)`
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-8 leading-tight bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
            Quem Somos
          </h2>
          
          <div className="bg-gray-50/80 backdrop-blur-lg rounded-2xl p-8 md:p-12 border border-gray-200 shadow-2xl">
            <p className="text-xl md:text-2xl leading-relaxed mb-8 text-gray-700">
              Atuando desde <span className="font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">1994</span> no mercado de telecomunicações em todo o território nacional, 
              a STA Telecomunicações e Eletricidade, tem como objetivo ser uma integradora de tecnologias 
              em implantação de sistemas de telecomunicações, atendendo às necessidades das empresas parceiras, 
              em um mercado emergente e com amplas perspectivas de desenvolvimento.
            </p>
            
            <p className="text-lg md:text-xl leading-relaxed mb-8 text-gray-600">
              Nossa empresa se destaca pela excelência técnica e pelo compromisso com a inovação, 
              oferecendo soluções completas que atendem às necessidades mais complexas do mercado 
              corporativo e industrial.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2 bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">29+</div>
                <p className="text-gray-600">Anos de Experiência</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2 bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">500+</div>
                <p className="text-gray-600">Projetos Realizados</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2 bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">100%</div>
                <p className="text-gray-600">Compromisso</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};