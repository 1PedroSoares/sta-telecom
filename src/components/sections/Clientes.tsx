import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, Building2 } from 'lucide-react';

export const Clientes = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showAllClients, setShowAllClients] = useState(false);

  const featuredClients = [
    { name: 'Cemig', sector: 'Energia', logo: '/logos/cemig.png' },
    { name: 'Ericsson', sector: 'Telecomunicações', logo: '/logos/ericsson.png' },
    { name: 'Zopone', sector: 'Engenharia', logo: '/logos/zopone.png' },
    { name: 'Nextel', sector: 'Telecomunicações', logo: '/logos/nextel.png' },
    { name: 'Ageplan', sector: 'Engenharia e Construções', logo: '/logos/ageplan.png' },
    { name: 'Tim', sector: 'Telecomunicações', logo: '/logos/tim.png' },
    { name: 'Huawei', sector: 'Telecomunicações', logo: '/logos/huawei.png' },
    { name: 'Enecol', sector: 'Engenharia', logo: '/logos/enecol.png' },
  ];

  const allClients = [
    ...featuredClients,
    { name: 'Promon Eletrônica Ltda', sector: 'Telecomunicações', logo: '' },
    { name: 'CEMIG Distribuidora S/A', sector: 'Energia', logo: '' },
    { name: 'Nextel Telecomunicações Ltda', sector: 'Telecomunicações', logo: '' },
    { name: 'Ferk Telecom Serviços e Construções Ltda', sector: 'Engenharia e Construções', logo: '' },
    { name: 'Enecol Engenharia e Eletricidade Ltda', sector: 'Engenharia e Eletricidade', logo: '' },
    { name: 'Emerson Sistemas e Energia Ltda', sector: 'Sistemas e Energia', logo: '' },
    { name: 'American Tower do Brasil', sector: 'Telecomunicações', logo: '' },
    { name: 'Semco Manutenção Volante Ltda', sector: 'Manutenção', logo: '' },
    { name: 'Radio Inconfidência Ltda', sector: 'Comunicação', logo: '' },
    { name: 'CAW Projetos e Consultoria Industrial Ltda', sector: 'Projetos e Consultoria', logo: '' },
    { name: 'Zener Telecomunicações e Sistemas Ltda', sector: 'Telecomunicações e Sistemas', logo: '' },
    { name: 'Northern Telecom do Brasil Comercio e Serviços Ltda', sector: 'Telecomunicações', logo: '' },
    { name: 'Oi (Telemar Telecomunicações de Minas Gerais S/A)', sector: 'Telecomunicações', logo: '' },
    { name: 'Ageplan Engenharia e Construções', sector: 'Engenharia e Construções', logo: '' },
    { name: 'Claro', sector: 'Telecomunicações', logo: '' },
    { name: 'Americel S/A', sector: 'Telecomunicações', logo: '' },
    { name: 'Promon Tecnologia Ltda', sector: 'Tecnologia', logo: '' },
    { name: 'Zopone Engenharia e Comercio Ltda', sector: 'Engenharia e Comércio', logo: '' },
    { name: 'Nokia Siemens Networks do Brasil', sector: 'Telecomunicações', logo: '' },
    { name: 'Hexagon Comercial e Telecomunicações Ltda', sector: 'Comercial e Telecomunicações', logo: '' },
    { name: 'COMESA – Construtora Melo Sant’Anna Ltda', sector: 'Construção', logo: '' },
    { name: 'Harris do Brasil Ltda', sector: 'Tecnologia', logo: '' },
    { name: 'Siemens Ltda', sector: 'Tecnologia', logo: '' },
    { name: 'Flextronics Network Services Ltda', sector: 'Serviços de Rede', logo: '' },
    { name: 'Belmusic Serviços Musicais Ltda – Grupo Bel Ltda', sector: 'Música', logo: '' },
    { name: 'Relacom Serviços de Engenharia e Telecomunicações Ltda', sector: 'Engenharia e Telecomunicações', logo: '' },
    { name: 'Saturnia Sistemas de Energia Ltda', sector: 'Sistemas de Energia', logo: '' },
    { name: 'Networker Telecom Industria e Comercio de Representação Ltda', sector: 'Telecomunicações', logo: '' },
    { name: 'Vivo (Telemig Celular S/A)', sector: 'Telecomunicações', logo: '' },
    { name: 'GVT – Global Village Telecom Ltda', sector: 'Telecomunicações', logo: '' },
    { name: 'VESPER S/A', sector: 'Telecomunicações', logo: '' },
    { name: 'NEC do Brasil S/A', sector: 'Telecomunicações', logo: '' },
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
                  <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    <img src={client.logo} alt={`Logo da ${client.name}`} className="h-full w-full object-contain p-2" />
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
                    <div className="text-2xl mb-2">
                      {/* Remove o emoji e exibe a logo se houver */}
                      {client.logo && <img src={client.logo} alt={`Logo da ${client.name}`} className="h-6 mx-auto object-contain" />}
                      {!client.logo && <Building2 className="mx-auto" />}
                    </div>
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