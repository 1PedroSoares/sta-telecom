import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Zap, Wifi, Home, Phone, Settings, ChevronRight } from 'lucide-react';

export const Servicos = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const mainServices = [
    {
      title: 'Sistemas de Energia',
      description: 'Instalações elétricas completas, painéis de controle e sistemas de energia renovável.',
      icon: Zap,
      details: 'Projetos elétricos industriais e residenciais, automação de sistemas energéticos, manutenção preventiva e corretiva.'
    },
    {
      title: 'Transmissão de Dados',
      description: 'Redes estruturadas, fibra óptica e soluções de conectividade de alta performance.',
      icon: Wifi,
      details: 'Cabeamento estruturado, redes wireless, instalação de fibra óptica, testes de performance e certificação.'
    },
    {
      title: 'Ambiente Automatizado',
      description: 'Automação predial, sistemas inteligentes e controle de ambientes.',
      icon: Home,
      details: 'Sistemas de automação residencial e comercial, controle de climatização, iluminação inteligente e segurança.'
    },
    {
      title: 'Sites e Centrais de Telefonia',
      description: 'Infraestrutura completa para telecomunicações e centrais telefônicas.',
      icon: Phone,
      details: 'Instalação de sites de telecomunicações, centrais PABX, sistemas VoIP e manutenção de equipamentos.'
    },
    {
      title: 'Soluções Personalizadas',
      description: 'Projetos únicos desenvolvidos especificamente para suas necessidades.',
      icon: Settings,
      details: 'Consultoria técnica, desenvolvimento de projetos customizados, integração de sistemas e suporte especializado.'
    }
  ];

  const additionalServices = [
    'Cabeamento Estruturado Categoria 6 e 6A',
    'Instalação de Racks e Patch Panels',
    'Sistemas de CFTV e Monitoramento',
    'Controle de Acesso Biométrico',
    'Sistemas de Alarme e Segurança',
    'Infraestrutura para Data Centers',
    'Manutenção Preventiva e Corretiva',
    'Certificação de Redes',
    'Consultoria em Telecomunicações',
    'Projetos de Eficiência Energética',
    'Sistemas de Energia Solar',
    'Automação Industrial',
    'Integração de Sistemas',
    'Suporte Técnico 24/7'
  ];

  return (
    <section id="servicos" className="py-20 bg-gradient-to-br from-secondary to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gradient mb-6">
            Nossos Serviços
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Oferecemos soluções completas em telecomunicações e eletricidade,
            com tecnologia de ponta e excelência em cada projeto.
          </p>
        </div>

        {/* Main Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {mainServices.map((service, index) => (
            <Card key={index} className="card-tech group cursor-pointer">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary to-primary-hover rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <service.icon className="w-8 h-8 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                  {service.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground text-center mb-4 leading-relaxed">
                  {service.description}
                </CardDescription>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      Ver Detalhes
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-3">
                        <service.icon className="w-6 h-6 text-primary" />
                        {service.title}
                      </DialogTitle>
                      <DialogDescription className="text-left leading-relaxed pt-4">
                        {service.details}
                      </DialogDescription>
                    </DialogHeader>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Expandable Services Section */}
        <div className="text-center">
          <Button
            onClick={() => setIsExpanded(!isExpanded)}
            className="btn-outline-tech mb-8"
          >
            {isExpanded ? 'Ocultar Serviços' : 'Ver Mais Serviços'}
            <ChevronRight className={`w-4 h-4 ml-2 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} />
          </Button>

          {isExpanded && (
            <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-8 border border-border/50 animate-fade-in">
              <h3 className="text-2xl font-bold text-foreground mb-6">Serviços Complementares</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {additionalServices.map((service, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg p-4 border border-border/30 hover:border-primary/50 transition-colors hover:shadow-md"
                  >
                    <p className="text-foreground font-medium">{service}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};