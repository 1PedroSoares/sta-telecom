import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, Building2 } from 'lucide-react';

export const Clientes = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showAllClients, setShowAllClients] = useState(false);

  const featuredClients = [
    { name: 'Petrobras', sector: 'Energia', logo: '🛢️' },
    { name: 'Vale', sector: 'Mineração', logo: '⛏️' },
    { name: 'Embraer', sector: 'Aeroespacial', logo: '✈️' },
    { name: 'CSN', sector: 'Siderurgia', logo: '🏭' },
    { name: 'Eletrobras', sector: 'Energia Elétrica', logo: '⚡' },
    { name: 'Telefônica', sector: 'Telecomunicações', logo: '📡' }
  ];

  const allClients = [
    ...featuredClients,
    { name: 'Banco do Brasil', sector: 'Financeiro', logo: '🏦' },
    { name: 'Caixa Econômica', sector: 'Financeiro', logo: '🏦' },
    { name: 'Correios', sector: 'Logística', logo: '📮' },
    { name: 'ANEEL', sector: 'Regulação', logo: '🏛️' },
    { name: 'ANATEL', sector: 'Telecomunicações', logo: '📊' },
    { name: 'Furnas', sector: 'Energia', logo: '⚡' },
    { name: 'CEMIG', sector: 'Energia', logo: '💡' },
    { name: 'COPEL', sector: 'Energia', logo: '🔌' },
    { name: 'Light', sector: 'Energia', logo: '💡' },
    { name: 'Vivo', sector: 'Telecomunicações', logo: '📱' },
    { name: 'TIM', sector: 'Telecomunicações', logo: '📞' },
    { name: 'Claro', sector: 'Telecomunicações', logo: '📶' },
    { name: 'Sabesp', sector: 'Saneamento', logo: '💧' },
    { name: 'Gerdau', sector: 'Siderurgia', logo: '🏗️' },
    { name: 'JBS', sector: 'Alimentício', logo: '🥩' },
    { name: 'Ambev', sector: 'Bebidas', logo: '🍺' },
    { name: 'Suzano', sector: 'Papel e Celulose', logo: '🌲' },
    { name: 'Klabin', sector: 'Papel e Celulose', logo: '📄' }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.ceil(featuredClients.length / 3));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + Math.ceil(featuredClients.length / 3)) % Math.ceil(featuredClients.length / 3));
  };

  const getSlidesForCurrentIndex = () => {
    const startIndex = currentSlide * 3;
    return featuredClients.slice(startIndex, startIndex + 3);
  };

  return (
    <section id="clientes" className="py-20 bg-gradient-to-r from-background to-secondary">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gradient mb-6">
            Principais Clientes
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Temos o privilégio de atender grandes empresas e instituições,
            entregando soluções de excelência em cada projeto.
          </p>
        </div>

        {/* Carousel */}
        <div className="relative max-w-4xl mx-auto mb-12">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-border/50 shadow-lg">
            <div className="grid md:grid-cols-3 gap-8">
              {getSlidesForCurrentIndex().map((client, index) => (
                <div key={index} className="text-center group">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-primary/10 to-primary/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-primary/20">
                    <span className="text-3xl">{client.logo}</span>
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {client.name}
                  </h3>
                  <p className="text-muted-foreground">{client.sector}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Carousel Controls */}
          <Button
            variant="outline"
            size="icon"
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm hover:bg-white"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm hover:bg-white"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>

          {/* Dots Indicator */}
          <div className="flex justify-center mt-6 gap-2">
            {Array.from({ length: Math.ceil(featuredClients.length / 3) }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors ${index === currentSlide ? 'bg-primary' : 'bg-primary/30'
                  }`}
              />
            ))}
          </div>
        </div>

        {/* Ver Todos os Clientes */}
        <div className="text-center">
          <Dialog open={showAllClients} onOpenChange={setShowAllClients}>
            <DialogTrigger asChild>
              <Button className="btn-outline-tech">
                <Building2 className="w-4 h-4 mr-2" />
                Ver Todos os Clientes
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-center mb-4">
                  Todos os Nossos Clientes
                </DialogTitle>
                <DialogDescription className="text-center mb-6">
                  Orgulhamo-nos de nossa parceria com estas renomadas empresas e instituições.
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {allClients.map((client, index) => (
                  <div key={index} className="bg-secondary/50 rounded-lg p-4 text-center hover:bg-secondary transition-colors">
                    <div className="text-2xl mb-2">{client.logo}</div>
                    <h4 className="font-semibold text-foreground">{client.name}</h4>
                    <p className="text-sm text-muted-foreground">{client.sector}</p>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </section>
  );
};