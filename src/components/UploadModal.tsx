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
import { Terminal } from 'lucide-react'

// 1. Defina as props que o modal irá receber
interface UploadModalProps {
    isOpen: boolean
    onClose: () => void
   projetoId: string | null // O ID do projeto para o qual estamos enviando o arquivo
}

export default function UploadModal({
    isOpen,
    onClose,
    projetoId,
}: UploadModalProps) {
    // 2. Estados para controlar o ficheiro, carregamento e erros
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // 3. Função para atualizar o ficheiro selecionado
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setSelectedFile(event.target.files[0])
            setError(null) // Limpa erros anteriores
        }
    }

    // 4. Função principal de upload
    const handleUpload = async () => {
        // Validação
        if (!selectedFile) {
            setError('Por favor, selecione um ficheiro primeiro.')
            return
        }
        if (!projetoId) { // Verifica se projetoId foi recebido
            setError('Erro: ID do projeto não encontrado.'); // Gera o erro se for null ou undefined
            return;
        }

        setIsLoading(true)
        setError(null)

        // 5. Crie o FormData
        // O backend espera 'multipart/form-data' para uploads
        const formData = new FormData()

        // Os nomes 'arquivo' e 'projeto_id' devem corresponder
        // aos nomes definidos no StoreArquivoRequest do Laravel
        formData.append('arquivo', selectedFile)
        formData.append('projeto_id', projetoId)

        try {
            // 6. Envie para a API do Laravel
            // A rota '/api/arquivos' é definida em api.php
            // A lógica está em ArquivoController.php
          await api.post('/arquivos', formData);
    // Success logic...
    alert('Arquivo enviado com sucesso!'); // (Idealmente, use um Toast/Sonner)
    handleClose(); // Fecha o modal
} catch (err: any) {
    console.error('Erro no upload:', err);
            if (err.response && err.response.status === 422) {
                // Erro de validação do Laravel
                setError(
                    'Erro de validação: ' +
                    Object.values(err.response.data.errors).join(', '),
                )
            } else {
                setError('Ocorreu um erro ao enviar o ficheiro. Tente novamente.')
            }
        } finally {
            setIsLoading(false)
        }
    }

    // 7. Função para limpar o estado ao fechar
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
                        {isLoading ? 'Enviando...' : 'Enviar'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}