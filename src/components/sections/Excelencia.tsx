import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Handshake, Shield } from 'lucide-react';

export const Excelencia = () => {
  const excellenceCards = [
    {
      title: 'Equipe Especializada',
      description: 'Profissionais em constante aperfeiçoamento e capacitação',
      details: 'Nossa equipe técnica passa por treinamentos regulares, certificações internacionais e atualizações tecnológicas para garantir a melhor qualidade em cada projeto.',
      icon: Users,
      features: [
        'Certificações técnicas atualizadas',
        'Treinamentos especializados regulares',
        'Experiência comprovada no mercado',
        'Equipe multidisciplinar qualificada'
      ]
    },
    {
      title: 'Fornecedores Confiáveis',
      description: 'Parceiros estratégicos e fornecedores de excelência',
      details: 'Trabalhamos exclusivamente com fornecedores homologados e certificados, garantindo materiais e equipamentos de primeira linha para todos os nossos projetos.',
      icon: Handshake,
      features: [
        'Fornecedores homologados',
        'Materiais certificados e originais',
        'Garantia estendida dos produtos',
        'Suporte técnico especializado'
      ]
    },
    {
      title: 'Segurança do Trabalho',
      description: 'Compromisso máximo com EPIs, normas e exames médicos',
      details: 'Seguimos rigorosamente todas as normas de segurança, fornecendo EPIs de qualidade, realizando exames médicos periódicos e mantendo treinamentos de segurança atualizados.',
      icon: Shield,
      features: [
        'EPIs de alta qualidade certificados',
        'Conformidade com NRs e normas técnicas',
        'Exames médicos ocupacionais regulares',
        'Treinamentos de segurança periódicos'
      ]
    }
  ];

  return (
    <section id="excelencia" className="py-20 bg-gradient-to-br from-background via-secondary/30 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gradient mb-6">
            Trabalhamos com Excelência
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Nosso compromisso com a qualidade se reflete em cada aspecto do nosso trabalho, 
            desde nossa equipe até nossos parceiros e procedimentos de segurança.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {excellenceCards.map((card, index) => (
            <Card key={index} className="card-tech h-full group">
              <CardHeader className="text-center pb-6">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary to-primary-hover rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <card.icon className="w-10 h-10 text-primary-foreground" />
                </div>
                <CardTitle className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                  {card.title}
                </CardTitle>
                <CardDescription className="text-lg text-muted-foreground">
                  {card.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <p className="text-foreground leading-relaxed">
                  {card.details}
                </p>
                
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground text-lg">Diferenciais:</h4>
                  <ul className="space-y-2">
                    {card.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-20 bg-gradient-to-r from-primary to-primary-hover rounded-2xl p-8 md:p-12 text-center">
          <h3 className="text-3xl font-bold text-primary-foreground mb-8">
            Números que Comprovam Nossa Excelência
          </h3>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary-foreground mb-2">
                100%
              </div>
              <p className="text-primary-foreground/90">
                Conformidade com Normas de Segurança
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary-foreground mb-2">
                Zero
              </div>
              <p className="text-primary-foreground/90">
                Acidentes de Trabalho
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary-foreground mb-2">
                50+
              </div>
              <p className="text-primary-foreground/90">
                Certificações Técnicas
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary-foreground mb-2">
                98%
              </div>
              <p className="text-primary-foreground/90">
                Satisfação dos Clientes
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};