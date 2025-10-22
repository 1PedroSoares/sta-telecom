import React, { useCallback, useState } from 'react';
import { useDropzone, FileWithPath } from 'react-dropzone';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { UploadCloud, File, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentPath: string;
    onUploadComplete: (newFiles: any[]) => void; // Tipo 'any' para mock
}

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, currentPath, onUploadComplete }) => {
    const [files, setFiles] = useState<FileWithPath[]>([]);
    const [uploading, setUploading] = useState(false);
    const { toast } = useToast();

    const onDrop = useCallback((acceptedFiles: FileWithPath[]) => {
        setFiles(prev => [...prev, ...acceptedFiles]);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'application/msword': ['.doc'],
            'application/vnd.ms-excel': ['.xls'],
            'image/jpeg': ['.jpg', '.jpeg'],
            'image/png': ['.png'],
            'application/zip': ['.zip'],
            'text/plain': ['.txt']
        }
    });

    const removeFile = (file: FileWithPath) => {
        setFiles(prev => prev.filter(f => f.path !== file.path));
    };

    const handleUpload = async () => {
        setUploading(true);
        toast({ title: "Enviando arquivos..." });

        // --- LÓGICA DE UPLOAD REAL (usando fetch para seu PHP) ---
        const formData = new FormData();
        files.forEach(file => formData.append('files[]', file));
        formData.append('destinationPath', currentPath);

        try {
            // const response = await fetch('https://seu-dominio.com.br/upload.php', {
            //   method: 'POST',
            //   body: formData,
            // });
            // if (!response.ok) throw new Error('Falha no upload');
            // const newFilesData = await response.json();

            // Simulação de upload
            await new Promise(resolve => setTimeout(resolve, 2000));
            const newFilesData = files.map((file, i) => ({
                id: `new-file-${Date.now()}-${i}`,
                name: file.name,
                type: 'file', // Tipo base
                fileType: file.name.split('.').pop() || 'other', // Detecção simples de fileType
                author: 'Usuário Logado', // Você pode pegar do context
                modifiedAt: new Date().toISOString(),
                size: file.size,
                path: `${currentPath === '/' ? '' : currentPath}/${file.name}`
            }));
            // Fim da simulação

            toast({ title: "Upload concluído!", description: `${files.length} arquivos enviados.` });
            onUploadComplete(newFilesData); // Atualiza a tabela
            handleClose();

        } catch (error) {
            toast({ title: "Erro no upload", description: (error as Error).message, variant: "destructive" });
        } finally {
            setUploading(false);
        }
    };

    const handleClose = () => {
        setFiles([]);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Enviar Arquivos</DialogTitle>
                    <DialogDescription>
                        Arraste e solte arquivos ou clique na área abaixo.
                        Enviando para: <span className="font-medium text-primary">{currentPath === '/' ? 'Início' : currentPath}</span>
                    </DialogDescription>
                </DialogHeader>

                <div
                    {...getRootProps()}
                    className={cn(
                        "border-2 border-dashed border-primary/30 rounded-lg p-12 text-center cursor-pointer transition-colors",
                        isDragActive ? "bg-primary/10 border-primary" : "hover:border-primary/50"
                    )}
                >
                    <input {...getInputProps()} />
                    <UploadCloud className="w-16 h-16 mx-auto text-muted-foreground" />
                    <p className="mt-4 font-medium">Arraste arquivos aqui ou clique para selecionar</p>
                    <p className="text-sm text-muted-foreground">PDF, DOCX, XLSX, Imagens, etc.</p>
                </div>

                {files.length > 0 && (
                    <div className="mt-4 max-h-48 overflow-y-auto space-y-2 pr-2">
                        <h4 className="font-medium">Arquivos Prontos para Envio:</h4>
                        {files.map((file, i) => (
                            <div key={i} className="flex items-center justify-between bg-muted p-2 rounded-md">
                                <div className="flex items-center gap-2 truncate">
                                    <File className="w-4 h-4 flex-shrink-0" />
                                    <span className="text-sm truncate" title={file.name}>{file.name}</span>
                                </div>
                                <Button variant="ghost" size="icon" className="w-6 h-6" onClick={() => removeFile(file)}>
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}

                <DialogFooter className="mt-6">
                    <DialogClose asChild>
                        <Button variant="outline" onClick={handleClose} disabled={uploading}>Cancelar</Button>
                    </DialogClose>
                    <Button onClick={handleUpload} disabled={files.length === 0 || uploading}>
                        {uploading ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <UploadCloud className="w-4 h-4 mr-2" />
                        )}
                        Enviar {files.length > 0 ? `(${files.length})` : ''}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};