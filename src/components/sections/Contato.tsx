import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Phone, Mail, Clock, Building } from 'lucide-react';

export const Contato = () => {
  const contactInfo = [
    {
      icon: Building,
      title: 'CNPJ',
      value: '97.424.253/0001-24',
      description: 'STA Telecomunicações e Eletricidade LTDA'
    },
    {
      icon: Phone,
      title: 'Telefone',
      value: '(31) 3418-2194',
      description: 'Atendimento comercial e técnico'
    },
    {
      icon: Mail,
      title: 'E-mail',
      value: 'sta.telecom@statel.com.br',
      description: 'Envie sua mensagem ou dúvida'
    },
    {
      icon: Clock,
      title: 'Horário',
      value: 'Segunda à Sexta: 8h às 18h',
      description: 'Atendimento comercial'
    }
  ];

  return (
    <section id="contato" className="py-20 bg-gradient-to-br from-secondary to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gradient mb-6">
            Entre em Contato
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Estamos prontos para atender suas necessidades em telecomunicações e eletricidade.
            Fale conosco e descubra como podemos ajudar seu projeto.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Contact Information */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-foreground mb-8">Informações de Contato</h3>

            <div className="grid gap-6">
              {contactInfo.map((info, index) => (
                <Card key={index} className="card-tech group">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-hover rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <info.icon className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                          {info.title}
                        </CardTitle>
                        <CardDescription className="text-muted-foreground">
                          {info.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-lg font-semibold text-foreground">
                      {info.value}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Address Card */}
            <Card className="card-tech">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-hover rounded-lg flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-foreground">
                      Endereço
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Nossa sede principal
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <address className="text-foreground not-italic leading-relaxed">
                  Rua da Barão de Sabará, 231<br />
                  Madre Gertrudes<br />
                  Belo Horizonte - MG<br />
                  CEP: 30512-750
                </address>
              </CardContent>
            </Card>
          </div>

          {/* Interactive Map */}
          <div className="lg:sticky lg:top-8">
            <Card className="card-tech overflow-hidden">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-foreground flex items-center gap-3">
                  <MapPin className="w-6 h-6 text-primary" />
                  Nossa Localização
                </CardTitle>
                <CardDescription>
                  Visite nossa sede ou utilize as referências para facilitar sua chegada
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {/* Google Maps Embed */}
                <div className="aspect-video w-full">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3749.876!2d-43.9448!3d-19.9167!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTnCsDU1JzAwLjEiUyA0M8KwNTYnNDEuMyJX!5e0!3m2!1spt!2sbr!4v1635789123456!5m2!1spt!2sbr&q=Rua+Bar%C3%A3o+de+Sabar%C3%A1,+231,+Madre+Gertrudes,+Belo+Horizonte,+MG+30512-750"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="rounded-b-xl"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Quick Contact Options */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <a
                href="tel:+553134182194"
                className="bg-gradient-to-r from-primary to-primary-hover text-primary-foreground p-4 rounded-xl text-center font-medium hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                <Phone className="w-6 h-6 mx-auto mb-2" />
                Ligar Agora
              </a>
              <a
                href="mailto:sta.telecom@statel.com.br"
                className="bg-white border-2 border-primary text-primary p-4 rounded-xl text-center font-medium hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-105"
              >
                <Mail className="w-6 h-6 mx-auto mb-2" />
                Enviar E-mail
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};