import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Folder, FileText, File, ChevronRight, UploadCloud, FolderPlus, ArrowLeft,
    FileSpreadsheet, FileImage, FileArchive, Edit, Trash2, Search,
    ArrowUp, ArrowDown, Loader2 // Adicionado Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
    Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList,
    BreadcrumbPage, BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Footer } from '@/components/Footer'; // Importar o novo rodapé
import UploadModal from '@/components/UploadModal'; // Importar o novo modal
import { api } from '@/lib/api';

// --- Tipos de Dados ---
type FileType = 'pdf' | 'doc' | 'xls' | 'img' | 'zip' | 'other';

type ApiArquivo = {
  id: string;
  nome: string;
  mime_type: string | null;
  tamanho_bytes: number;
  data_upload_iso: string;
  enviado_por?: { nome: string; }; // Simplificado
};

type NodeBase = {
    id: string;
    name: string;
    path: string;
    author: string;
    modifiedAt: string; // ISO String
    size: number; // bytes
};

type FileNode = NodeBase & {
    type: 'file';
    fileType: FileType;
};

type FolderNode = NodeBase & {
    type: 'folder';
    children: FileSystemNode[];
};

type FileSystemNode = FileNode | FolderNode;

type SortKey = 'name' | 'type' | 'author' | 'modifiedAt' | 'size';
type SortDirection = 'asc' | 'desc';

const getFileTypeFromMime = (mimeType: string | null | undefined): FileType => {
    if (!mimeType) return 'other';
    if (mimeType.includes('pdf')) return 'pdf';
    if (mimeType.includes('word')) return 'doc';
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'xls';
    if (mimeType.startsWith('image/')) return 'img';
    if (mimeType.includes('zip')) return 'zip';
    return 'other';
};

// --- Dados Mockados Iniciais ---
// const mockData: FolderNode = {
//     id: 'root', name: 'Projetos STA', type: 'folder', path: '/', author: 'Admin', modifiedAt: '2023-01-10T10:00:00Z', size: 0,
//     children: [
//         {
//             id: 'f1', name: 'Cliente A (OS-2024-001)', type: 'folder', path: '/f1', author: 'Gestor 1', modifiedAt: '2024-02-15T09:30:00Z', size: 0, children: [
//                 { id: 'f1-1', name: 'Relatórios Técnicos', type: 'folder', path: '/f1/f1-1', author: 'Gestor 1', modifiedAt: '2024-03-20T14:00:00Z', size: 0, children: [] },
//                 { id: 'file-1a', name: 'Contrato.pdf', type: 'file', fileType: 'pdf', path: '/f1/file-1a', author: 'Admin', modifiedAt: '2024-02-15T09:35:00Z', size: 1200000 },
//                 { id: 'file-1b', name: 'Planilha_Custos.xlsx', type: 'file', fileType: 'xls', path: '/f1/file-1b', author: 'Gestor 1', modifiedAt: '2024-03-01T11:20:00Z', size: 55000 },
//             ]
//         },
//         {
//             id: 'f2', name: 'Cliente B (OS-2024-002)', type: 'folder', path: '/f2', author: 'Admin', modifiedAt: '2024-03-10T08:00:00Z', size: 0, children: [
//                 { id: 'file-2a', name: 'Apresentacao.doc', type: 'file', fileType: 'doc', path: '/f2/file-2a', author: 'Gestor 2', modifiedAt: '2024-03-11T16:05:00Z', size: 2300000 },
//                 { id: 'file-2b', 'name': 'Logo_Cliente.png', type: 'file', fileType: 'img', path: '/f2/file-2b', author: 'Gestor 2', modifiedAt: '2024-03-11T10:15:00Z', size: 89000 },
//             ]
//         },
//         { id: 'file-root', name: 'Padroes_STA.pdf', type: 'file', fileType: 'pdf', path: '/file-root', author: 'Admin', modifiedAt: '2023-01-20T17:00:00Z', size: 750000 },
//     ],
// };

// --- Funções Auxiliares ---

// Obter ícone
const getNodeIcon = (node: FileSystemNode) => {
    if (node.type === 'folder') {
        return <Folder className="w-5 h-5 text-yellow-500" />;
    }
    switch (node.fileType) {
        case 'pdf': return <FileText className="w-5 h-5 text-red-500" />;
        case 'doc': return <FileText className="w-5 h-5 text-blue-500" />;
        case 'xls': return <FileSpreadsheet className="w-5 h-5 text-green-500" />;
        case 'img': return <FileImage className="w-5 h-5 text-purple-500" />;
        case 'zip': return <FileArchive className="w-5 h-5 text-yellow-600" />;
        default: return <File className="w-5 h-5 text-gray-500" />;
    }
};

// Formatar tipo
const getNodeType = (node: FileSystemNode) => {
    if (node.type === 'folder') return 'Pasta';
    switch (node.fileType) {
        case 'pdf': return 'PDF';
        case 'doc': return 'Documento Word';
        case 'xls': return 'Planilha Excel';
        case 'img': return 'Imagem';
        case 'zip': return 'Arquivo ZIP';
        default: return 'Arquivo';
    }
};

// Formatar tamanho
const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// Formatar data
const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
};

// --- Componente Principal ---
export default function FileManager() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { toast } = useToast();
    const [isLoadingData, setIsLoadingData] = useState(true);

    // (Em um app real, fileSystem seria buscado do backend)
    const [fileSystem, setFileSystem] = useState<FolderNode>(mockData);
    const [currentFolder, setCurrentFolder] = useState<FolderNode>(mockData);
    const [breadcrumbPath, setBreadcrumbPath] = useState<FolderNode[]>([mockData]);

    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({ key: 'name', direction: 'asc' });
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    // --- NOVOS ESTADOS PARA DRAG & DROP ---
    const [uploading, setUploading] = useState(false);
    const [draggedOverFolder, setDraggedOverFolder] = useState<string | null>(null);

    // Redireciona se não for 'employee'
  useEffect(() => {
        if (user?.role !== 'gestor') { // Verificação se é gestor
            navigate('/dashboard');
            return;
        }

        const fetchProjects = async () => {
            setIsLoadingData(true);
            try {
                // 1. Busca os projetos da API
                // A API retorna { data: [...] }
                const response = await api.get('/projetos');
                const projetosDaApi = response.data.data;

                // 2. Transforma os projetos da API no formato FolderNode
                const projectFolders: FolderNode[] = projetosDaApi.map((proj: any) => ({
                    id: String(proj.id), // <-- O ID REAL (ex: '1', '2', '3')
                    name: proj.nome, // <-- O NOME REAL
                    type: 'folder',
                    path: `/${String(proj.id)}`, // Define um path (pode ser ajustado)
                    author: proj.cliente?.nome || 'Gestor',
                    modifiedAt: proj.criado_em || new Date().toISOString(),
                    size: 0,
                    children: [], // (Arquivos podem ser carregados quando clica na pasta)
                }));

                // 3. Cria a estrutura raiz do fileSystem
                const rootFolder: FolderNode = {
                    id: 'root', // O ID da raiz ainda pode ser 'root'
                    name: 'Projetos STA',
                    type: 'folder',
                    path: '/',
                    author: 'Admin',
                    modifiedAt: new Date().toISOString(),
                    size: 0,
                    children: projectFolders, // <-- Adiciona os projetos reais como filhos
                };

                // 4. Atualiza o estado
                setFileSystem(rootFolder);
                setCurrentFolder(rootFolder);
                setBreadcrumbPath([rootFolder]);

            } catch (error: any) {
                console.error("Erro ao buscar projetos:", error);
                toast({
                    title: "Erro ao carregar projetos",
                    description: "Não foi possível buscar os dados do servidor.",
                    variant: "destructive"
                });
            } finally {
                setIsLoadingData(false);
            }
        };

        fetchProjects();

    }, [user, navigate, toast]);

    // Encontra uma pasta no sistema de arquivos
    const findFolderByPath = (path: string, node: FolderNode = fileSystem): FolderNode | null => {
        if (node.path === path) return node;
        for (const child of node.children) {
            if (child.type === 'folder') {
                const found = findFolderByPath(path, child);
                if (found) return found;
            }
        }
        return null;
    };

    // Navega para uma pasta
const navigateToFolder = useCallback(async (path: string) => { // <-- Marque como async
        if (!fileSystem) return;

        // Encontra a pasta alvo na estrutura local *primeiro*
        // para obter o ID correto antes de buscar dados completos
        const targetFolderLocal = findFolderByPath(path);
        
        if (!targetFolderLocal) {
            console.warn(`Tentativa de navegar para pasta não encontrada localmente: ${path}`);
            setCurrentFolder(fileSystem); // Volta para a raiz como fallback
            setBreadcrumbPath([fileSystem]);
            return;
        }

        // --- LÓGICA DE BUSCA DE DADOS ---
        let folderDataToShow = targetFolderLocal; // Usa a pasta local por padrão

        // Se NÃO for a pasta raiz, busca os detalhes (incluindo arquivos) da API
        if (targetFolderLocal.id !== 'root') {
            setIsLoadingData(true); // <-- Mostra loading ao entrar na pasta
            try {
                // Usa o ID numérico do projeto para buscar na API
                const response = await api.get(`/projetos/${targetFolderLocal.id}`);
                const projetoComArquivos = response.data.data; // A API retorna { data: Projeto }

                // Transforma a resposta da API (incluindo arquivos) para FolderNode
                folderDataToShow = {
                    id: String(projetoComArquivos.id),
                    name: projetoComArquivos.nome,
                    type: 'folder',
                    path: targetFolderLocal.path, // Mantém o path local consistente
                    author: projetoComArquivos.cliente?.nome || 'Gestor',
                    modifiedAt: projetoComArquivos.criado_em || new Date().toISOString(),
                    size: 0,
                    // Transforma os arquivos da API em FileNode
                    children: projetoComArquivos.arquivos.map((apiArquivo: ApiArquivo) => ({
                        id: String(apiArquivo.id),
                        name: apiArquivo.nome,
                        type: 'file',
                        fileType: getFileTypeFromMime(apiArquivo.mime_type),
                        path: `${targetFolderLocal.path}/${apiArquivo.nome}`, // Constrói path do arquivo
                        author: apiArquivo.enviado_por?.nome || 'Desconhecido',
                        modifiedAt: apiArquivo.data_upload_iso,
                        size: apiArquivo.tamanho_bytes,
                    })),
                };

            } catch (error: any) {
                console.error(`Erro ao buscar detalhes do projeto ${targetFolderLocal.id}:`, error);
                toast({
                    title: "Erro ao carregar pasta",
                    description: "Não foi possível buscar os arquivos deste projeto.",
                    variant: "destructive"
                });
                // Poderia voltar para a raiz ou manter a pasta local sem arquivos
                setCurrentFolder(fileSystem); 
                setBreadcrumbPath([fileSystem]);
                setIsLoadingData(false);
                return; // Para a execução
            } finally {
                setIsLoadingData(false); // <-- Esconde o loading
            }
        }
        setCurrentFolder(folderDataToShow);

        // Constrói breadcrumbs (lógica existente adaptada)
        const pathParts = path === '/' ? [] : path.split('/').filter(Boolean);
        const newBreadcrumbs = [fileSystem]; // Começa sempre com a raiz do fileSystem
        let currentPath = '/';

        // Reconstrói a partir da raiz local para garantir consistência
        for (const part of pathParts) {
            const nextPath = currentPath === '/' ? `/${part}` : `${currentPath}/${part}`;
            const breadcrumbNode = findFolderByPath(nextPath, fileSystem); // Busca na estrutura *local*
            if (breadcrumbNode && breadcrumbNode.path !== '/') {
                 // Usa o NOME da pasta local encontrada para o breadcrumb
                newBreadcrumbs.push({ ...breadcrumbNode, name: breadcrumbNode.name }); 
                currentPath = breadcrumbNode.path; 
            } else if (path === '/') {
                break; 
            }
        }
       setBreadcrumbPath(newBreadcrumbs);

    }, [fileSystem, findFolderByPath, toast]);

    // Lógica de filtragem e ordenação
    const filteredAndSortedItems = useMemo(() => {
        if (!currentFolder) return [];

        // 1. Filtrar por pesquisa
        const filtered = currentFolder.children.filter(node =>
            node.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        // 2. Ordenar
        filtered.sort((a, b) => {
            // Pastas sempre vêm antes de arquivos
            if (a.type === 'folder' && b.type === 'file') return -1;
            if (a.type === 'file' && b.type === 'folder') return 1;

            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];

            let result = 0;
            if (aValue < bValue) result = -1;
            if (aValue > bValue) result = 1;

            return sortConfig.direction === 'asc' ? result : -result;
        });

        return filtered;
    }, [currentFolder, searchTerm, sortConfig]);

    // Função para mudar a ordenação
    const requestSort = (key: SortKey) => {
        let direction: SortDirection = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // Ícone de ordenação
    const getSortIcon = (key: SortKey) => {
        if (sortConfig.key !== key) return null;
        return sortConfig.direction === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />;
    };

    // Ações
   const handleCreateFolder = async () => { // Marque como async
        if (!currentFolder || !user || user.role !== 'gestor') return;

        const folderName = prompt("Nome da nova pasta:");
        if (folderName) {
            
            // Substitua a simulação por esta chamada à API:
            try {
                // (Opcional: mostrar um estado de loading)

                // 1. Envia os dados para a API
                // NOTA: Seu backend espera um 'nome_projeto'
                const response = await api.post('/projetos', {
                    nome_projeto: folderName,
                    descricao: 'Criado pelo Gestor',
                    // Você pode precisar decidir se associa um cliente_user_id aqui
                    cliente_user_id: null 
                });

                // 2. Pega o novo projeto retornado pela API
                // (Assumindo que sua API retorna { data: NovoProjeto })
                const novoProjetoApi = response.data.data; 

                // 3. Converte a resposta da API para o formato do frontend (FileNode)
                const newFolder: FolderNode = {
                    id: novoProjetoApi.id.toString(),
                    name: novoProjetoApi.nome,
                    path: `/${novoProjetoApi.id}`, // Ou a lógica de path que preferir
                    type: 'folder',
                    author: user?.fullName || 'Usuário',
                    modifiedAt: novoProjetoApi.criado_em || new Date().toISOString(),
                    size: 0,
                    children: []
                };

                // 4. Atualiza o estado local com os dados reais do backend
                setCurrentFolder(prev => ({ ...prev, children: [newFolder, ...prev.children] }));

                toast({ title: "Pasta criada!", description: `A pasta "${folderName}" foi salva no banco.` });

            } catch (error: any) {
                console.error("Erro ao criar projeto:", error.response?.data || error.message);
                toast({ 
                    title: "Erro ao salvar", 
                    description: "Não foi possível criar a pasta no servidor.", 
                    variant: "destructive" 
                });
            }
        }
    };

    const handleEdit = (node: FileSystemNode) => {
        const newName = prompt(`Novo nome para "${node.name}":`, node.name);
        if (newName && newName !== node.name) {
            // Simulação de edição
            toast({ title: "Renomeado!", description: `"${node.name}" agora é "${newName}".` });
            // (Aqui você atualizaria o estado imutavelmente)
        }
    };

    const handleDelete = (node: FileSystemNode) => {
        if (confirm(`Tem certeza que deseja excluir "${node.name}"?`)) {
            // Simulação de exclusão
            toast({ title: "Excluído!", description: `"${node.name}" foi excluído.` });
            // (Aqui você atualizaria o estado imutavelmente)
        }
    };

    const handleUploadComplete = (newFiles: FileNode[]) => {
        // Adiciona os novos arquivos (retornados pelo modal) ao estado atual
        setCurrentFolder(prev => ({
            ...prev,
            children: [...prev.children, ...newFiles],
        }));
    };

    // --- FUNÇÃO PARA UPLOAD VIA DRAG & DROP ---
    const handleDropUpload = async (files: File[], targetFolder: FolderNode) => {
        if (uploading) return;

        setUploading(true);
        toast({ title: "Enviando arquivos...", description: `Para: ${targetFolder.name}` });

        // Simulação de upload (como no UploadModal)
        await new Promise(resolve => setTimeout(resolve, 2000));
        const newFilesData: FileNode[] = files.map((file, i) => ({
            id: `new-file-${Date.now()}-${i}`,
            name: file.name,
            type: 'file',
            fileType: (file.name.split('.').pop() || 'other') as FileType,
            author: user?.fullName || 'Usuário',
            modifiedAt: new Date().toISOString(),
            size: file.size,
            path: `${targetFolder.path === '/' ? '' : targetFolder.path}/${file.name}`
        }));
        // Fim da simulação

        toast({ title: "Upload concluído!", description: `${files.length} arquivos enviados para ${targetFolder.name}.` });

        // Se o drop foi na pasta atual, atualiza a lista
        if (targetFolder.id === currentFolder.id) {
            handleUploadComplete(newFilesData);
        } else {
            // Se o drop foi em uma subpasta, atualiza o 'children' dela (simulação)
            setCurrentFolder(prev => ({
                ...prev,
                children: prev.children.map(child => {
                    if (child.id === targetFolder.id && child.type === 'folder') {
                        return { ...child, children: [...child.children, ...newFilesData] };
                    }
                    return child;
                })
            }));
        }

        setUploading(false);
    };

   if (isLoadingData || !user) {
        return (
            <div className="min-h-screen bg-muted/20 flex flex-col items-center justify-center">
                <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">
                    {isLoadingData ? 'Carregando projetos...' : 'Verificando usuário...'}
                </p>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen bg-muted/20 flex flex-col"
            // Eventos no container principal para limpar o estado de drag
            onDragLeave={() => setDraggedOverFolder(null)}
            onDrop={() => setDraggedOverFolder(null)}
        >
            <header className="bg-card/80 backdrop-blur-md border-b sticky top-0 z-10 shadow-sm">
                <div className="container mx-auto px-4 py-4">
                    <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-2">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Voltar ao Dashboard
                    </Button>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        Gestor de Arquivos
                    </h1>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 max-w-7xl flex-1">
                <Card className="shadow-lg border-border/50">
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                            {/* Breadcrumbs */}
                            <Breadcrumb>
                                <BreadcrumbList>
                                    {breadcrumbPath.map((folder, index) => (
                                        <React.Fragment key={folder.id}>
                                            <BreadcrumbItem>
                                                {index === breadcrumbPath.length - 1 ? (
                                                    <BreadcrumbPage className="font-semibold">{folder.name}</BreadcrumbPage>
                                                ) : (
                                                    <BreadcrumbLink asChild>
                                                        <a href="#" onClick={(e) => { e.preventDefault(); navigateToFolder(folder.path); }}>
                                                            {folder.name}
                                                        </a>
                                                    </BreadcrumbLink>
                                                )}
                                            </BreadcrumbItem>
                                            {index < breadcrumbPath.length - 1 && <BreadcrumbSeparator />}
                                        </React.Fragment>
                                    ))}
                                </BreadcrumbList>
                            </Breadcrumb>

                            {/* Botões de Ação */}
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={handleCreateFolder}>
                                    <FolderPlus className="w-4 h-4 mr-2" />
                                    Nova Pasta
                                </Button>
                              <Button 
    onClick={() => setIsUploadModalOpen(true)} 
    disabled={uploading || currentFolder.id === 'root'} // <-- Correção aqui
    title={currentFolder.id === 'root' ? "Selecione um projeto para enviar arquivos" : "Enviar arquivo para esta pasta"} // <-- Tooltip opcional
>
    {uploading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
    ) : (
        <UploadCloud className="w-4 h-4 mr-2" />
    )}
    Enviar Arquivo
</Button>
                            </div>
                        </div>

                        {/* Barra de Pesquisa */}
                        <div className="mt-6 relative">
                            <Search className="w-5 h-5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                            <Input
                                placeholder="Pesquisar nesta pasta..."
                                className="pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </CardHeader>

                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[40%] cursor-pointer" onClick={() => requestSort('name')}>
                                            <div className="flex items-center gap-2">Nome {getSortIcon('name')}</div>
                                        </TableHead>
                                        <TableHead className="w-[15%] cursor-pointer" onClick={() => requestSort('type')}>
                                            <div className="flex items-center gap-2">Tipo {getSortIcon('type')}</div>
                                        </TableHead>
                                        <TableHead className="w-[15%] cursor-pointer" onClick={() => requestSort('author')}>
                                            <div className="flex items-center gap-2">Autor {getSortIcon('author')}</div>
                                        </TableHead>
                                        <TableHead className="w-[15%] cursor-pointer" onClick={() => requestSort('modifiedAt')}>
                                            <div className="flex items-center gap-2">Modificado em {getSortIcon('modifiedAt')}</div>
                                        </TableHead>
                                        <TableHead className="w-[10%] cursor-pointer" onClick={() => requestSort('size')}>
                                            <div className="flex items-center gap-2">Tamanho {getSortIcon('size')}</div>
                                        </TableHead>
                                        <TableHead className="w-[10%] text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredAndSortedItems.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                                {searchTerm ? "Nenhum item encontrado." : "Esta pasta está vazia."}
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredAndSortedItems.map(node => (
                                            <TableRow
                                                key={node.id}
                                                // --- ALTERAÇÕES AQUI ---
                                                className={cn(
                                                    "transition-all",
                                                    node.type === 'folder' && "hover:bg-muted/50 cursor-pointer",
                                                    draggedOverFolder === node.id && "bg-primary/10 ring-2 ring-primary ring-inset" // Indicador visual
                                                )}
                                                // MUDANÇA: de onDoubleClick para onClick
                                                onClick={() => node.type === 'folder' && navigateToFolder(node.path)}

                                                // --- NOVOS EVENTOS PARA DRAG & DROP ---
                                                onDragEnter={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    // Verifica se são arquivos sendo arrastados e se é uma pasta
                                                    if (node.type === 'folder' && e.dataTransfer.types.includes('Files')) {
                                                        setDraggedOverFolder(node.id);
                                                    }
                                                }}
                                                onDragOver={(e) => {
                                                    e.preventDefault(); // Isso é CRUCIAL para permitir o drop
                                                    e.stopPropagation();
                                                }}
                                                onDrop={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setDraggedOverFolder(null); // Limpa o indicador

                                                    if (node.type === 'folder') {
                                                        const files = Array.from(e.dataTransfer.files);
                                                        if (files.length > 0 && !uploading) {
                                                            handleDropUpload(files, node);
                                                        }
                                                    }
                                                }}
                                            >
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        {getNodeIcon(node)}
                                                        <span className="font-medium truncate" title={node.name}>{node.name}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">{getNodeType(node)}</TableCell>
                                                <TableCell className="text-muted-foreground">{node.author}</TableCell>
                                                <TableCell className="text-muted-foreground">{formatDate(node.modifiedAt)}</TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {node.type === 'file' ? formatBytes(node.size) : '—'}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="w-8 h-8"
                                                            onClick={(e) => { e.stopPropagation(); handleEdit(node); }}
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="w-8 h-8 text-destructive hover:text-destructive"
                                                            onClick={(e) => { e.stopPropagation(); handleDelete(node); }}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </main>

            {/* Rodapé */}
            <Footer />

            {/* Modal de Upload */}
          <UploadModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                projetoId={currentFolder?.id ?? null} // <-- ADICIONE ESTA LINHA
                currentPath={currentFolder?.path || '/'}
                onUploadComplete={handleUploadComplete}
            />
        </div>
    );
}