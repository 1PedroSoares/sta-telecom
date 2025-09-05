import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Send, CheckCircle } from 'lucide-react';

export const Orcamento = () => {
  const [formData, setFormData] = useState({
    nome: '',
    empresa: '',
    email: '',
    telefone: '',
    servico: '',
    mensagem: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const services = [
    'Sistemas de Energia',
    'Transmissão de Dados',
    'Ambiente Automatizado',
    'Sites e Centrais de Telefonia',
    'Soluções Personalizadas',
    'Cabeamento Estruturado',
    'Sistemas de CFTV',
    'Controle de Acesso',
    'Infraestrutura para Data Center',
    'Consultoria Técnica',
    'Outro (especificar na mensagem)'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validação básica
    if (!formData.nome || !formData.email || !formData.telefone || !formData.servico) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      setIsSubmitting(false);
      return;
    }

    // Simular envio do formulário
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Orçamento enviado com sucesso!",
        description: "Entraremos em contato em até 24 horas úteis.",
      });

      // Limpar formulário
      setFormData({
        nome: '',
        empresa: '',
        email: '',
        telefone: '',
        servico: '',
        mensagem: ''
      });
    } catch (error) {
      toast({
        title: "Erro ao enviar",
        description: "Tente novamente ou entre em contato por telefone.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="orcamento" className="py-20 bg-gradient-to-br from-background via-primary/5 to-secondary">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gradient mb-6">
            Solicite um Orçamento
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Conte-nos sobre seu projeto e receba uma proposta personalizada. 
            Nossa equipe técnica está pronta para desenvolver a solução ideal para suas necessidades.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="card-tech">
            <CardHeader className="text-center pb-8">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary to-primary-hover rounded-full flex items-center justify-center shadow-lg">
                <Send className="w-10 h-10 text-primary-foreground" />
              </div>
              <CardTitle className="text-3xl font-bold text-foreground">
                Formulário de Orçamento
              </CardTitle>
              <CardDescription className="text-lg text-muted-foreground">
                Preencha os dados abaixo e nossa equipe entrará em contato
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Nome */}
                  <div className="space-y-2">
                    <Label htmlFor="nome" className="text-foreground font-semibold">
                      Nome Completo *
                    </Label>
                    <Input
                      id="nome"
                      type="text"
                      value={formData.nome}
                      onChange={(e) => handleInputChange('nome', e.target.value)}
                      placeholder="Seu nome completo"
                      required
                      className="bg-background border-border"
                    />
                  </div>

                  {/* Empresa */}
                  <div className="space-y-2">
                    <Label htmlFor="empresa" className="text-foreground font-semibold">
                      Empresa
                    </Label>
                    <Input
                      id="empresa"
                      type="text"
                      value={formData.empresa}
                      onChange={(e) => handleInputChange('empresa', e.target.value)}
                      placeholder="Nome da empresa"
                      className="bg-background border-border"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* E-mail */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground font-semibold">
                      E-mail *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="seu@email.com"
                      required
                      className="bg-background border-border"
                    />
                  </div>

                  {/* Telefone */}
                  <div className="space-y-2">
                    <Label htmlFor="telefone" className="text-foreground font-semibold">
                      Telefone *
                    </Label>
                    <Input
                      id="telefone"
                      type="tel"
                      value={formData.telefone}
                      onChange={(e) => handleInputChange('telefone', e.target.value)}
                      placeholder="(11) 99999-9999"
                      required
                      className="bg-background border-border"
                    />
                  </div>
                </div>

                {/* Serviço de Interesse */}
                <div className="space-y-2">
                  <Label htmlFor="servico" className="text-foreground font-semibold">
                    Serviço de Interesse *
                  </Label>
                  <Select value={formData.servico} onValueChange={(value) => handleInputChange('servico', value)}>
                    <SelectTrigger className="bg-background border-border">
                      <SelectValue placeholder="Selecione o serviço de interesse" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service} value={service}>
                          {service}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Mensagem */}
                <div className="space-y-2">
                  <Label htmlFor="mensagem" className="text-foreground font-semibold">
                    Detalhes do Projeto
                  </Label>
                  <Textarea
                    id="mensagem"
                    value={formData.mensagem}
                    onChange={(e) => handleInputChange('mensagem', e.target.value)}
                    placeholder="Descreva seu projeto, necessidades específicas, prazo desejado, localização, etc."
                    rows={5}
                    className="bg-background border-border"
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-6">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-tech w-full text-lg py-6 group"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
                        Enviar Solicitação de Orçamento
                      </>
                    )}
                  </Button>
                </div>

                {/* Info Footer */}
                <div className="bg-secondary/50 rounded-lg p-4 mt-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-muted-foreground">
                      <p className="font-medium text-foreground mb-1">Compromisso de Resposta</p>
                      <p>Respondemos todas as solicitações em até 24 horas úteis. Para urgências, entre em contato diretamente pelo telefone (11) 3456-7890.</p>
                    </div>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};