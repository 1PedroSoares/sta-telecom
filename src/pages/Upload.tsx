import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Upload as UploadIcon, X, Camera, FileText, ImagePlus } from 'lucide-react';

interface ImageWithDescription {
  file: File;
  description: string;
  preview: string;
}

interface Client {
  id: string;
  full_name: string;
}

// Mock clients data
const mockClients: Client[] = [
  { id: '1', full_name: 'João Silva' },
  { id: '2', full_name: 'Maria Santos' },
  { id: '3', full_name: 'Pedro Costa' },
  { id: '4', full_name: 'Ana Oliveira' },
];

export default function Upload() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [progressImages, setProgressImages] = useState<ImageWithDescription[]>([]);
  const [reportImages, setReportImages] = useState<ImageWithDescription[]>([]);
  
  const [formData, setFormData] = useState({
    osNumber: '',
    title: '',
    description: '',
    startDate: '',
    clientId: '',
  });

  useEffect(() => {
    if (!user || user.role !== 'employee') {
      navigate('/dashboard');
      return;
    }
    
    // Simulate loading clients
    setTimeout(() => {
      setClients(mockClients);
    }, 500);
  }, [user, navigate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'progress' | 'report') => {
    const files = Array.from(e.target.files || []);
    const newImages = files.map(file => ({
      file,
      description: '',
      preview: URL.createObjectURL(file)
    }));
    
    if (type === 'progress') {
      setProgressImages(prev => [...prev, ...newImages]);
    } else {
      setReportImages(prev => [...prev, ...newImages]);
    }
  };

  const removeImage = (index: number, type: 'progress' | 'report') => {
    if (type === 'progress') {
      setProgressImages(prev => {
        URL.revokeObjectURL(prev[index].preview);
        return prev.filter((_, i) => i !== index);
      });
    } else {
      setReportImages(prev => {
        URL.revokeObjectURL(prev[index].preview);
        return prev.filter((_, i) => i !== index);
      });
    }
  };

  const updateImageDescription = (index: number, description: string, type: 'progress' | 'report') => {
    if (type === 'progress') {
      setProgressImages(prev => prev.map((img, i) => i === index ? { ...img, description } : img));
    } else {
      setReportImages(prev => prev.map((img, i) => i === index ? { ...img, description } : img));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.osNumber || !formData.title || !formData.startDate) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha todos os campos obrigatórios',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      toast({
        title: 'Ordem de Serviço criada com sucesso!',
        description: `OS ${formData.osNumber} foi registrada no sistema.`,
      });
      
      setLoading(false);
      navigate('/dashboard');
    }, 2000);
  };


  if (!user) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <header className="bg-card/80 backdrop-blur-md border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Dashboard
          </Button>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Nova Ordem de Serviço
          </h1>
          <p className="text-muted-foreground mt-1">Registre uma nova OS e faça upload das imagens com descrições</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <Card className="shadow-xl border-primary/10 animate-fade-in">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
            <CardTitle className="text-2xl flex items-center gap-2">
              <UploadIcon className="w-6 h-6 text-primary" />
              Informações da Ordem de Serviço
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="osNumber">Número da OS *</Label>
                  <Input
                    id="osNumber"
                    placeholder="Ex: OS-2024-001"
                    value={formData.osNumber}
                    onChange={(e) => setFormData({ ...formData, osNumber: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="startDate">Data de Início *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Título do Serviço *</Label>
                <Input
                  id="title"
                  placeholder="Ex: Instalação de Torre de Telecomunicações"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva os detalhes do serviço..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="client">Cliente</Label>
                <Select value={formData.clientId} onValueChange={(value) => setFormData({ ...formData, clientId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Progress Images Section */}
              <div className="space-y-4 p-6 bg-gradient-to-br from-primary/5 to-transparent rounded-lg border border-primary/10">
                <div className="flex items-center gap-2">
                  <Camera className="w-6 h-6 text-primary" />
                  <Label className="text-xl font-semibold">Imagens do Progresso</Label>
                </div>
                
                <div className="border-2 border-dashed border-primary/30 rounded-lg p-8 text-center hover:border-primary/50 transition-colors bg-card/50">
                  <Input
                    type="file"
                    multiple
                    accept="image/*,.jpg,.jpeg,.png,.gif,.webp,.bmp,.svg"
                    onChange={(e) => handleFileChange(e, 'progress')}
                    className="hidden"
                    id="progress-upload"
                  />
                  <Label htmlFor="progress-upload" className="cursor-pointer">
                    <div className="space-y-3">
                      <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <ImagePlus className="w-8 h-8 text-primary" />
                      </div>
                      <p className="text-lg font-medium text-foreground">
                        Clique para adicionar imagens do progresso
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Suporta JPG, PNG, GIF, WEBP, BMP, SVG e outros formatos
                      </p>
                    </div>
                  </Label>
                </div>

                {progressImages.length > 0 && (
                  <div className="space-y-4 mt-6">
                    {progressImages.map((image, index) => (
                      <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow animate-fade-in">
                        <div className="grid md:grid-cols-[300px_1fr] gap-4 p-4">
                          <div className="relative group">
                            <img
                              src={image.preview}
                              alt={`Progresso ${index + 1}`}
                              className="w-full h-48 object-cover rounded-lg"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                              onClick={() => removeImage(index, 'progress')}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                            <div className="absolute bottom-2 left-2 right-2 bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded truncate">
                              {image.file.name}
                            </div>
                          </div>
                          <div className="space-y-2 flex flex-col">
                            <Label htmlFor={`progress-desc-${index}`} className="text-sm font-medium">
                              Descrição da Imagem {index + 1}
                            </Label>
                            <Textarea
                              id={`progress-desc-${index}`}
                              placeholder="Descreva o que está acontecendo nesta imagem..."
                              value={image.description}
                              onChange={(e) => updateImageDescription(index, e.target.value, 'progress')}
                              className="flex-1 min-h-[120px] resize-none"
                            />
                            <p className="text-xs text-muted-foreground">
                              Adicione uma descrição detalhada para facilitar a identificação
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Report Images Section */}
              <div className="space-y-4 p-6 bg-gradient-to-br from-primary/5 to-transparent rounded-lg border border-primary/10">
                <div className="flex items-center gap-2">
                  <FileText className="w-6 h-6 text-primary" />
                  <Label className="text-xl font-semibold">Imagens dos Relatórios</Label>
                </div>
                
                <div className="border-2 border-dashed border-primary/30 rounded-lg p-8 text-center hover:border-primary/50 transition-colors bg-card/50">
                  <Input
                    type="file"
                    multiple
                    accept="image/*,.jpg,.jpeg,.png,.gif,.webp,.bmp,.svg"
                    onChange={(e) => handleFileChange(e, 'report')}
                    className="hidden"
                    id="report-upload"
                  />
                  <Label htmlFor="report-upload" className="cursor-pointer">
                    <div className="space-y-3">
                      <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <FileText className="w-8 h-8 text-primary" />
                      </div>
                      <p className="text-lg font-medium text-foreground">
                        Clique para adicionar imagens dos relatórios
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Suporta JPG, PNG, GIF, WEBP, BMP, SVG e outros formatos
                      </p>
                    </div>
                  </Label>
                </div>

                {reportImages.length > 0 && (
                  <div className="space-y-4 mt-6">
                    {reportImages.map((image, index) => (
                      <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow animate-fade-in">
                        <div className="grid md:grid-cols-[300px_1fr] gap-4 p-4">
                          <div className="relative group">
                            <img
                              src={image.preview}
                              alt={`Relatório ${index + 1}`}
                              className="w-full h-48 object-cover rounded-lg"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                              onClick={() => removeImage(index, 'report')}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                            <div className="absolute bottom-2 left-2 right-2 bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded truncate">
                              {image.file.name}
                            </div>
                          </div>
                          <div className="space-y-2 flex flex-col">
                            <Label htmlFor={`report-desc-${index}`} className="text-sm font-medium">
                              Descrição da Imagem {index + 1}
                            </Label>
                            <Textarea
                              id={`report-desc-${index}`}
                              placeholder="Descreva o conteúdo desta imagem do relatório..."
                              value={image.description}
                              onChange={(e) => updateImageDescription(index, e.target.value, 'report')}
                              className="flex-1 min-h-[120px] resize-none"
                            />
                            <p className="text-xs text-muted-foreground">
                              Adicione uma descrição detalhada para facilitar a identificação
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-8 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                  className="flex-1"
                  size="lg"
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading} className="flex-1" size="lg">
                  {loading ? 'Criando OS...' : 'Criar Ordem de Serviço'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}