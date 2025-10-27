import React, { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { api } from '@/lib/api' // Importe o nosso cliente Axios
import { Alert, AlertDescription } from './ui/alert'
import { Loader2, Terminal } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext' // Importar useAuth
import { useToast } from '@/hooks/use-toast' // Importar useToast

// --- Tipos de Dados ---
// (Copiados de Dashboard.tsx/FileManager.tsx para consistência)
type FileType = 'pdf' | 'doc' | 'xls' | 'img' | 'zip' | 'other';

type FileNode = {
    id: string;
    name: string; // O frontend espera 'name'
    path: string;
    author: string;
    modifiedAt: string; // ISO String
    size: number; // bytes
    type: 'file';
    fileType: FileType;
};

// Tipo da resposta da API (baseado no ArquivoResource.php)
// ATENÇÃO: A API retorna 'nome', 'tamanho_bytes', etc.
type ApiArquivoResponse = {
    id: string;
    nome: string; // A API envia 'nome'
    mime_type: string | null | undefined;
    tamanho_bytes: number;
    data_upload_iso: string;
    enviado_por?: {
        id: number;
        nome: string;
        email: string;
        perfil: string;
    };
};

// 1. Defina as NOVAS props que o modal irá receber
interface UploadModalProps {
    isOpen: boolean
    onClose: () => void
    projetoId: string | null // ID da pasta/projeto
    currentPath: string // Caminho da pasta atual (ex: '/' ou '/f1')
    onUploadComplete: (newFiles: FileNode[]) => void // Função para notificar o pai
}

// Mapeia mime types para os FileType (com correção para nulos)
const getFileTypeFromMime = (mimeType: string | null | undefined): FileType => {
    if (!mimeType) { // <-- Correção para mimeType indefinido
        return 'other';
    }
    if (mimeType.includes('pdf')) return 'pdf';
    if (mimeType.includes('word')) return 'doc';
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'xls';
    if (mimeType.startsWith('image/')) return 'img';
    if (mimeType.includes('zip')) return 'zip';
    return 'other';
};

export default function UploadModal({
    isOpen,
    onClose,
    projetoId,
    currentPath,
    onUploadComplete,
}: UploadModalProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const { user } = useAuth(); // Pegar o usuário logado
    const { toast } = useToast(); // Usar o sistema de toast

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setSelectedFile(event.target.files[0])
            setError(null)
        }
    }

    const handleUpload = async () => {
        if (!selectedFile) {
            setError('Por favor, selecione um ficheiro primeiro.');
            return;
        }
        if (!projetoId) {
            setError('Erro: ID do projeto (pasta) não encontrado.');
            return;
        }

        setIsLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('arquivo', selectedFile);
        formData.append('projeto_id', projetoId); // Usa a prop correta

        try {
            console.log("Tentando fazer upload para projeto ID:", projetoId); // Log 1
            // A resposta (response.data) será do tipo { data: ApiArquivoResponse }
            const response = await api.post<{ data: ApiArquivoResponse }>('/arquivos', formData);

            // --- DEBUGGING CRÍTICO ---
            console.log('Resposta COMPLETA da API recebida:', response); // Log 2
            console.log('Dados da resposta (response.data):', response.data); // Log 3
             // --- FIM DEBUGGING ---

             // *** CORREÇÃO AQUI: Acessar a propriedade 'data' interna ***
            const newArquivo = response.data.data;
            // *** FIM DA CORREÇÃO ***


            // --- VERIFICAÇÃO MAIS ROBUSTA ---
            // Agora a verificação funciona, pois newArquivo aponta para o objeto correto
            if (!newArquivo || typeof newArquivo.nome !== 'string' || newArquivo.nome.trim() === '') {
                console.error("Resposta inválida ou nome do arquivo em falta/vazio:", newArquivo);
                setError("Erro ao processar a resposta do servidor. O nome do ficheiro parece estar em falta ou inválido.");
                setIsLoading(false);
                return; // Para a execução se a resposta for inválida
            }
             console.log("Nome do arquivo recebido da API:", newArquivo.nome); // Log 4
            // --- FIM DA VERIFICAÇÃO ---


            // Cria o FileNode usando os dados corretos de newArquivo
            const newFileNode: FileNode = {
                id: String(newArquivo.id),
                name: newArquivo.nome, // Mapeamento correto
                type: 'file',
                fileType: getFileTypeFromMime(newArquivo.mime_type),
                path: `${currentPath === '/' ? '' : currentPath}/${newArquivo.nome}`,
                author: newArquivo.enviado_por?.nome || user?.fullName || 'Usuário',
                modifiedAt: newArquivo.data_upload_iso,
                size: newArquivo.tamanho_bytes,
            };

            // --- DEBUGGING ---
            console.log('FileNode formatado para enviar ao componente pai:', newFileNode); // Log 5
            console.log("Valor de newFileNode.name antes do toast:", newFileNode.name); // Log 6
             // --- FIM DEBUGGING ---


            // --- Notificação ---
             // Verificação ANTES do toast para garantir
             const fileNameForToast = newFileNode.name || "desconhecido";
            toast({
                title: "Upload concluído!",
                 description: `O ficheiro "${fileNameForToast}" foi enviado.`, // Agora deve ter o nome correto
            });
            // --- Fim Notificação ---

            // Chama a função para atualizar a lista no componente pai
            onUploadComplete([newFileNode]);
            console.log("onUploadComplete chamado com:", [newFileNode]); // Log 7


            handleClose(); // Fecha o modal

        } catch (err: any) {
            console.error('Erro detalhado no upload:', err.response?.data || err.message || err); // Log de erro mais detalhado
            if (err.response && err.response.status === 422) {
                setError(
                    'Erro de validação: ' +
                    Object.values(err.response.data.errors).flat().join(' '), // Achatando arrays de erro
                );
            } else {
                 setError(`Ocorreu um erro ao enviar o ficheiro: ${err.message || 'Erro desconhecido'}. Verifique a consola.`);
            }
        } finally {
            setIsLoading(false);
        }
    };
    // Função para limpar o estado ao fechar
    const handleClose = () => {
        setSelectedFile(null)
        setIsLoading(false)
        setError(null)
        onClose()
    }

    return (
        // 'open' e 'onOpenChange' controlam se o modal está visível
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Enviar Novo Arquivo</DialogTitle>
                    <DialogDescription>
                        Selecione um ficheiro do seu computador para adicionar ao projeto.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="file-upload">Selecionar Ficheiro</Label>
                        <Input
                            id="file-upload"
                            type="file"
                            onChange={handleFileChange}
                            disabled={isLoading}
                        />
                    </div>
                    {selectedFile && !isLoading && (
                        <p className="text-sm text-muted-foreground">
                            Ficheiro selecionado: {selectedFile.name}
                        </p>
                    )}

                    {/* Exibe mensagens de erro */}
                    {error && (
                        <Alert variant="destructive">
                            <Terminal className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        disabled={isLoading}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleUpload}
                        disabled={isLoading || !selectedFile}
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        {isLoading ? 'Enviando...' : 'Enviar'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}