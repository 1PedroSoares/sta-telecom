import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Folder, FileText, File, ChevronRight, UploadCloud, FolderPlus, ArrowLeft,
    FileSpreadsheet, FileImage, FileArchive, Edit, Trash2, Search,
    ArrowUp, ArrowDown, Loader2, LogOut, Download // Adicionado Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter
} from "@/components/ui/table";
import {
    Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList,
    BreadcrumbPage, BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription, // Opcional
    DialogFooter,      // Opcional
    DialogClose        // Opcional
} from '@/components/ui/dialog';
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


type ApiProjeto = {
  id: string;
  nome: string;
  descricao: string | null;
  criado_em: string;
  cliente?: { nome: string; };
  arquivos: ApiArquivo[]; // Usa o tipo ApiArquivo que já definimos
  size: number;
  children?: ApiProjeto[];
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
    // 1. Verifica se 'bytes' é nulo, undefined, 0, ou NaN
 if (!bytes || bytes <= 0) {
        // --- MUDANÇA AQUI ---
        // Se o tamanho for 0, exibe '0 Bytes' em vez de um traço
        return '0 Bytes';
        // --- FIM DA MUDANÇA ---
    }

    // 2. Se for um número válido, continua o cálculo
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// Formatar data
const formatDate = (isoString: string) => {
    // 1. Cria o objeto Date
    const date = new Date(isoString);

    // 2. Verifica se a data é válida (isNaN(date.getTime()))
    if (!isoString || isNaN(date.getTime())) {
        return '—'; // Retorna um traço se a data for nula ou inválida
    }

    // 3. Se for válida, formata
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
};

// --- Componente Principal ---
export default function FileManager() {
    const navigate = useNavigate();
   const { user, logout, isLoading } = useAuth();
   const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewingFile, setViewingFile] = useState<FileNode | null>(null);
    const [fileBlobUrl, setFileBlobUrl] = useState<string | null>(null); // Armazena o URL local (Blob)
    const [isFetchingFile, setIsFetchingFile] = useState(false);
    const [fileHtmlContent, setFileHtmlContent] = useState<string | null>(null);
    // Estado geral de upload (já pode existir)
    const [draggedOverFolderId, setDraggedOverFolderId] = useState<string | null>(null);

    // (Em um app real, fileSystem seria buscado do backend)
 const [fileSystem, setFileSystem] = useState<FolderNode | null>(null); // Initialize as null
const [currentFolder, setCurrentFolder] = useState<FolderNode | null>(null); // Initialize as null
const [breadcrumbPath, setBreadcrumbPath] = useState<FolderNode[]>([]); // Initialize as empty array

    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({ key: 'name', direction: 'asc' });
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    
    // --- NOVOS ESTADOS PARA DRAG & DROP ---
    const [uploading, setUploading] = useState(false);
    const [draggedOverFolder, setDraggedOverFolder] = useState<string | null>(null);


      const transformApiProjetoToFolderNode = (apiProjeto: ApiProjeto): FolderNode => {
    const projectFolder: FolderNode = {
      id: String(apiProjeto.id),
      name: apiProjeto.nome,
      type: 'folder',
      path: `/${String(apiProjeto.id)}`, // Ajuste o path conforme necessário (talvez só '/' para o cliente?)
      author: apiProjeto.cliente?.nome || 'Cliente',
      modifiedAt: apiProjeto.criado_em || new Date().toISOString(),
      size: apiProjeto.size || 0,
      children: apiProjeto.arquivos.map(apiArquivo => ({
        id: String(apiArquivo.id),
        name: apiArquivo.nome,
        type: 'file',
        fileType: getFileTypeFromMime(apiArquivo.mime_type),
        path: `/${String(apiProjeto.id)}/${apiArquivo.nome}`, // Path do arquivo dentro do projeto
        author: apiArquivo.enviado_por?.nome || 'Desconhecido',
        modifiedAt: apiArquivo.data_upload_iso,
        size: apiArquivo.tamanho_bytes,
      })),
    };
    return projectFolder;
  };

    
    // Redireciona se não for 'employee'
useEffect(() => {
        // NÃO chame useAuth() aqui

        // Use 'isLoading' obtido do useAuth() no topo do componente
        if (isLoading || !user) {
            if (!isLoading && !user) setIsLoadingData(false); // Make sure setIsLoadingData is defined
            return;
        }

        // ----- FUNÇÃO INTERNA PARA BUSCAR DADOS -----
        const fetchProjects = async () => {
            setIsLoadingData(true);
            try {
                let rootFolder: FolderNode | null = null;
                
                // --- SUBSTITUA A LÓGICA 'if/else' GESTOR/CLIENTE POR ISTO ---

                let projetosRaizDaApi: ApiProjeto[] = [];
                let rootName: string = '';

                if (user.role === 'gestor') {
                    console.log("FileManager: Fetching data for GESTOR (Root Level)");
                    const response = await api.get('/projetos');
                    projetosRaizDaApi = response.data.data;
                    rootName = 'Todos os Projetos';
                } else if (user.role === 'cliente') {
                    console.log("FileManager: Fetching data for CLIENTE (Root Level)");
                    // Esta rota AGORA retorna '{"data": [projeto]}' ou '{"data": []}'
                    const response = await api.get('/meu-projeto'); 
                    projetosRaizDaApi = response.data.data;
                    rootName = 'Meus Arquivos';
                }

                // --- LÓGICA UNIFICADA (Para Gestor E Cliente) ---
                // Mapeia a lista de projetos (seja 0, 1 ou N)
                const rootProjectFolders: FolderNode[] = projetosRaizDaApi.map((proj: ApiProjeto) => {
                    const apiDate = proj.criado_em; 
                    const parsedDate = new Date(apiDate);
                    const validModifiedAt = (apiDate && !isNaN(parsedDate.getTime()))
                        ? apiDate 
                        : new Date().toISOString();

                    return {
                        id: String(proj.id),
                        name: proj.nome,
                        type: 'folder',
                        path: `/${String(proj.id)}`, // Path de nível 1 (ex: /1, /30)
                        author: proj.cliente?.nome || (user.role === 'gestor' ? 'Gestor' : user.nome),
                        modifiedAt: validModifiedAt,
                        size: proj.size || 0, // 'size' agora vem da API
                        children: [], // Filhos só são carregados ao clicar
                    };
                });

                // Cria a pasta raiz virtual
                rootFolder = {
                    id: 'root',
                    name: rootName, // Nome dinâmico
                    type: 'folder',
                    path: '/',
                    author: 'Admin',
                    modifiedAt: new Date().toISOString(),
                    size: 0, 
                    children: rootProjectFolders, // Adiciona os projetos mapeados
                };

                // Atualiza os estados se rootFolder foi definido
                if (rootFolder) {
                    setFileSystem(rootFolder);
                    setCurrentFolder(rootFolder);
                    setBreadcrumbPath([rootFolder]);
                } else {
                     // Caso inesperado (ex: perfil desconhecido ou erro não capturado)
                     console.error("Não foi possível definir rootFolder. User role:", user.role);
                     throw new Error("Perfil de utilizador não reconhecido ou erro na busca de dados.");
                }

            } catch (error: any) {
                console.error("Erro ao buscar dados do FileManager:", error);
                 // Tratamento de erro unificado (inclui 404 para cliente)
                if (user.role === 'cliente' && error.response?.status === 404) {
                     toast({ title: "Nenhum projeto associado", description: "Não há projetos vinculados à sua conta.", variant: 'default' });
                      const emptyRoot: FolderNode = { id: 'root-empty', name: 'Meu Projeto (Vazio)', type: 'folder', path: '/', author: user.nome || 'Cliente', modifiedAt: new Date().toISOString(), size: 0, children: [] };
                      setFileSystem(emptyRoot);
                      setCurrentFolder(emptyRoot);
                      setBreadcrumbPath([emptyRoot]);
                } else { // Outros erros (500, rede, etc.)
                    toast({
                        title: "Erro ao carregar dados",
                        description: error.response?.data?.message || error.message || "Tente recarregar a página.",
                        variant: "destructive",
                    });
                     const errorRoot: FolderNode = { id: 'root-error', name: 'Erro ao Carregar', type: 'folder', path: '/', author: '', modifiedAt: '', size: 0, children: [] };
                     setFileSystem(errorRoot);
                     setCurrentFolder(errorRoot);
                     setBreadcrumbPath([errorRoot]);
                }
            } finally {
                setIsLoadingData(false); // Garante que o loading termina
            }
        };

        fetchProjects();

 }, [user, isLoading]); // Adicione/remova dependências conforme o seu código

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
// Navega para uma pasta, buscando seu conteúdo da API (exceto para a raiz)
    const navigateToFolder = useCallback(async (path: string) => {
        setIsLoadingData(true); // Mostra loading imediatamente

        // --- LÓGICA PARA RAIZ ---
        if (path === '/') {
            if (fileSystem) {
                setCurrentFolder(fileSystem);
                setBreadcrumbPath([fileSystem]); // Só a raiz no breadcrumb
            } else {
                console.error("fileSystem não carregado ao navegar para a raiz.");
            }
            setIsLoadingData(false); // Esconde loading
            return;
        }

        // --- LÓGICA PARA PASTAS NÃO RAIZ ---
        try {
            // Extrai o ID da pasta do final do path
            const pathParts = path.split('/').filter(Boolean);
            const targetFolderId = pathParts[pathParts.length - 1];

            if (!targetFolderId || targetFolderId === 'root') {
                 throw new Error(`ID inválido extraído do path: ${path}`);
            }

            console.log(`Navegando para path ${path}, buscando ID ${targetFolderId}`);
            const response = await api.get(`/projetos/${targetFolderId}`);
            const projetoApi = response.data.data; // Assumindo wrapping

            // Mapeia subpastas e ficheiros (como antes)
            const subFolders: FolderNode[] = (projetoApi.children || []).map((childProj: ApiProjeto): FolderNode => ({ // Tipagem explícita
                id: String(childProj.id),
                name: childProj.nome,
                type: 'folder',
                path: `${path}/${String(childProj.id)}`, // Path da subpasta
                author: childProj.cliente?.nome || 'Gestor',
                modifiedAt: childProj.criado_em || new Date().toISOString(),
                size: childProj.size || 0,
                children: [],
            }));

            const files: FileNode[] = (projetoApi.arquivos || []).map((apiArquivo: ApiArquivo): FileNode => ({ // Tipagem explícita
                id: String(apiArquivo.id),
                name: apiArquivo.nome,
                type: 'file',
                fileType: getFileTypeFromMime(apiArquivo.mime_type),
                path: `${path}/${apiArquivo.nome}`, // Path do ficheiro
                author: apiArquivo.enviado_por?.nome || 'Desconhecido',
                modifiedAt: apiArquivo.data_upload_iso,
                size: apiArquivo.tamanho_bytes,
            }));

            // Monta o FolderNode para a pasta atual
            const folderDataToShow: FolderNode = {
                id: String(projetoApi.id),
                name: projetoApi.nome,
                type: 'folder',
                path: path, // Usa o path da navegação
                author: projetoApi.cliente?.nome || 'Gestor',
                modifiedAt: projetoApi.criado_em || new Date().toISOString(),
                size: projetoApi.size || 0,
                children: [...subFolders, ...files],
            };

            // Atualiza a pasta atual
            setCurrentFolder(folderDataToShow);

            // --- LÓGICA SIMPLIFICADA PARA BREADCRUMBS ---
            // Adiciona a pasta atual ao breadcrumb da pasta anterior
            setBreadcrumbPath(prevBreadcrumbs => {
                 // Remove possíveis nós futuros se o utilizador voltou para trás
                 const currentIndex = prevBreadcrumbs.findIndex(folder => folder.path === path);
                 if (currentIndex !== -1) {
                     return prevBreadcrumbs.slice(0, currentIndex + 1);
                 }
                 // Adiciona o nó atual aos breadcrumbs anteriores
                 // Garante que não adiciona duplicado se já existir (pouco provável)
                 if (prevBreadcrumbs[prevBreadcrumbs.length-1]?.id !== folderDataToShow.id) {
                    return [...prevBreadcrumbs, folderDataToShow];
                 }
                 return prevBreadcrumbs;

            });
            // --- FIM BREADCRUMBS ---

        } catch (error: any) {
            console.error(`Erro ao navegar para ${path}:`, error);
            toast({ title: "Erro ao carregar pasta", description: "Não foi possível buscar os dados.", variant: "destructive" });
            // Fallback: talvez voltar para a pasta anterior ou raiz?
            // Por agora, apenas termina o loading
        } finally {
            setIsLoadingData(false); // Esconde loading
        }

    }, [fileSystem, toast, setIsLoadingData]); // Dependências simplificadas

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



    const handleDownload = async (fileNode: FileNode) => {
        // Opcional: Mostrar um indicador de loading específico para download
        toast({ title: "Iniciando download...", description: fileNode.name });

        try {
            // 1. Usa o 'api' (axios) que envia o token
            const response = await api.get(
                `/arquivos/${fileNode.id}/download`, // Usa a rota de download
                { responseType: 'blob' } // Pede os dados como ficheiro binário
            );

            // 2. Cria um URL local temporário para o ficheiro binário (Blob)
            const url = window.URL.createObjectURL(new Blob([response.data]));

            // 3. Cria um link temporário na memória
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileNode.name); // Define o nome do ficheiro para download

            // 4. Simula o clique no link para iniciar o download
            document.body.appendChild(link); // Precisa estar no DOM para o clique funcionar em alguns navegadores
            link.click();

            // 5. Limpa (remove o link e revoga o URL do Blob)
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);

        } catch (error: any) {
            console.error("Erro ao fazer download do ficheiro:", error.response?.data || error.message);
            toast({
                title: "Erro no Download",
                description: `Não foi possível baixar o ficheiro ${fileNode.name}. (${error.message})`,
                variant: "destructive"
            });
        } finally {
            // Opcional: Esconder o indicador de loading
        }
    };


   const handleViewFile = async (fileNode: FileNode) => {
    // Tipos que podemos tentar pré-visualizar
    const supportedTypes: FileType[] = ['pdf', 'img', 'doc', 'xls']; // Adicione 'doc', 'xls' se for implementar
    if (!supportedTypes.includes(fileNode.fileType)) {
             toast({
                 title: "Pré-visualização não suportada",
                 description: `A pré-visualização para ficheiros do tipo "${getNodeType(fileNode)}" não está disponível.`,
                 variant: "default"
             });
             return;
        }

        setViewingFile(fileNode);
        setIsViewModalOpen(true);
        setIsFetchingFile(true); // <-- Inicia o loading
        setFileBlobUrl(null);    // <-- Limpa o URL antigo
        setFileHtmlContent(null);

      try {
            // --- AJUSTE NA LÓGICA DE BUSCA ---
            let response;
            if (fileNode.fileType === 'doc' || fileNode.fileType === 'xls') {
                // Para Office, busca como TEXTO (HTML)
                response = await api.get(
                    `/arquivos/${fileNode.id}/view`,
                    { responseType: 'text' } // <-- Pede como texto
                );
                setFileHtmlContent(response.data); // <-- Guarda o HTML
                setFileBlobUrl(null); // Garante que blob url está nulo
            } else {
                // Para PDF e Imagem, busca como BLOB (como antes)
                response = await api.get(
                    `/arquivos/${fileNode.id}/view`,
                    { responseType: 'blob' }
                );
                const url = URL.createObjectURL(response.data);
                setFileBlobUrl(url); // <-- Guarda o Blob URL
                setFileHtmlContent(null); // Garante que html está nulo
            }
        } catch (error: any) {
            console.error("Erro ao buscar ficheiro para visualização:", error.response?.data || error.message);
            toast({ title: "Erro ao carregar ficheiro", description: error.message, variant: "destructive" });
            setIsViewModalOpen(false); // Fecha o modal se falhar
        } finally {
            setIsFetchingFile(false); // <-- Termina o loading
        }
    };

const renderFilePreview = (file: FileNode) => {
        if (isFetchingFile) { // Simplificado: Mostra loading se estiver a buscar
            return (
                <div className="flex justify-center items-center h-full">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="ml-2 text-muted-foreground">A carregar ficheiro...</p>
                </div>
            );
        }

        // Se terminou de buscar mas não há conteúdo (erro?)
        if (!fileBlobUrl && !fileHtmlContent) {
             return (
                 <div className="text-center p-10 text-destructive-foreground bg-destructive rounded">
                     Erro ao carregar pré-visualização. Tente baixar o ficheiro.
                 </div>
             );
        }


        switch (file.fileType) {
            case 'img':
                // Imagem ainda usa fileBlobUrl
                return (
                    <img src={fileBlobUrl!} alt={`Pré-visualização de ${file.name}`} className="max-w-full h-auto mx-auto"/>
                );
            case 'pdf':
                 // PDF ainda usa fileBlobUrl
                return (
                    <iframe src={fileBlobUrl!} title={`Visualizador para ${file.name}`} className="w-full h-full border-0"/>
                );

            // --- MUDANÇA AQUI ---
            case 'doc':
            case 'xls':
                // Office usa fileHtmlContent com srcDoc
                return (
                    <iframe
                        srcDoc={fileHtmlContent!} // <-- Usa srcDoc com o conteúdo HTML
                        title={`Visualizador para ${file.name}`}
                        className="w-full h-full border-0 bg-white"
                        sandbox="allow-scripts allow-same-origin" // Mantenha o sandbox
                    />
                );

            default:
                // Para 'zip', 'other', etc.
                 return (
                     <div className="text-center p-10">
                         <p className="text-lg font-medium mb-4">Pré-visualização não suportada</p>
                         <p className="text-muted-foreground mb-6">
                             Não é possível pré-visualizar este tipo de ficheiro ({getNodeType(file)}).
                         </p>
                         <Button asChild>
                              <a href={`${api.defaults.baseURL}/arquivos/${file.id}/download`} target="_blank" rel="noopener noreferrer">
                                 <Download className="w-4 h-4 mr-2" />
                                 Baixar {file.name}
                             </a>
                         </Button>
                     </div>
                 );
        }
    };

    // Ações
   const handleCreateFolder = async () => { // Marque como async
        if (!currentFolder || !user || user.role !== 'gestor') return;

        const folderName = prompt("Nome da nova pasta:");
        if (folderName) {
            
            // Substitua a simulação por esta chamada à API:
           try {
               const parentId = currentFolder.id === 'root' ? null : currentFolder.id;

                const response = await api.post('/projetos', {
                    nome_projeto: folderName,
                    descricao: `Subpasta de ${currentFolder.name}`, // Descrição opcional
                    cliente_user_id: null, // Subpastas geralmente não têm cliente direto
                    parent_id: parentId   // Envia o parent_id correto
                });
              const novoProjetoApi = response.data.data; // Assumindo wrapping ativo

                 // Converte a resposta da API para o formato do frontend (FileNode)
                const newFolder: FolderNode = {
                    id: String(novoProjetoApi.id),
                    name: novoProjetoApi.nome,
                    // O path agora precisa refletir a hierarquia
                    // Uma lógica mais robusta seria buscar o path completo do pai, mas por agora:
                    path: `${currentFolder.path === '/' ? '' : currentFolder.path}/${String(novoProjetoApi.id)}`, // Pode precisar de ajuste
                    type: 'folder',
                    author: user?.nome || 'Utilizador',
                    modifiedAt: novoProjetoApi.criado_em || new Date().toISOString(),
                    size: 0,
                    children: [] // Nova pasta começa vazia
                };

                // Atualiza APENAS a pasta atual para incluir a nova subpasta
                setCurrentFolder(prev => {
                    if (!prev) return null;
                    // Adiciona a nova pasta no início da lista de children da pasta atual
                    return { ...prev, children: [newFolder, ...prev.children] };
                });

                // 2. Atualiza o fileSystem principal para incluir a nova pasta
                // setFileSystem(prev => {
                //     if (!prev || prev.id !== 'root') return prev; // Garante que é a raiz
                //      // Adiciona a nova pasta no início da lista
                //     return { ...prev, children: [newFolder, ...prev.children] };
                // });
                // --- FIM DA ATUALIZAÇÃO ---


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

  const handleEdit = async (node: FileSystemNode) => { // Marque como async
        if (!user || user.role !== 'gestor') return;

        const originalName = node.name; // Guardar nome original para o toast
        const newName = prompt(`Novo nome para "${originalName}":`, originalName);

        if (newName && newName !== originalName) {

            let endpoint = '';
            let payload: any = {};

            if (node.type === 'folder') { // É um Projeto (pasta)
                endpoint = `/projetos/${node.id}`;
                payload = { nome_projeto: newName }; // Backend espera 'nome_projeto'
            } else { // É um Arquivo
                // API atual não suporta renomear ficheiros individuais
                toast({
                    title: "Funcionalidade Indisponível",
                    description: "Ainda não é possível renomear ficheiros individuais.",
                    variant: "default"
                });
                return; // Para a execução
            }

            try {
                // (Opcional: Mostrar estado de loading)
                const response = await api.patch(endpoint, payload); // Usar PATCH
               const updatedApiData = response.data.data; // Assumindo withoutWrapping() ativo

                 if (!updatedApiData || typeof updatedApiData.nome === 'undefined') {
                    console.error("Dados atualizados inválidos recebidos da API:", updatedApiData);
                    throw new Error("Resposta inválida do servidor após atualização.");
                 }

                // Atualiza o estado local APÓS sucesso da API
                setCurrentFolder(prev => {
                    if (!prev) return null;
                    const updatedChildren = prev.children.map(child =>
                        child.id === node.id
                        ? { ...child, name: updatedApiData.nome } // Atualiza o nome local com dados da API
                        : child
                    );
                    return { ...prev, children: updatedChildren };
                });

                toast({ title: "Renomeado!", description: `"${originalName}" agora é "${updatedApiData.nome}".` });

            } catch (error: any) {
                console.error(`Erro ao renomear ${node.type}:`, error.response?.data || error.message || error);
                toast({
                    title: "Erro ao renomear",
                    description: `Não foi possível atualizar o nome no servidor. (${error.message})`,
                    variant: "destructive"
                });
            }
        }
    };

  const handleDelete = async (node: FileSystemNode) => { // Marque como async
        if (!user || user.role !== 'gestor') return;

        if (confirm(`Tem certeza que deseja excluir "${node.name}"? ${node.type === 'folder' ? '(Isso também excluirá todos os arquivos dentro dela)' : ''}`)) {
            
            // Determina o endpoint
            let endpoint = '';
            if (node.type === 'folder') {
                endpoint = `/projetos/${node.id}`;
            } else { // type === 'file'
                endpoint = `/arquivos/${node.id}`;
            }

            try {
                 // (Opcional: Mostrar estado de loading)
                await api.delete(endpoint);

                 // Atualiza o estado local de forma imutável
                setCurrentFolder(prev => {
                    if (!prev) return null;
                    return {
                        ...prev,
                        children: prev.children.filter(child => child.id !== node.id) // Remove o item
                    };
                });

                toast({ title: "Excluído!", description: `"${node.name}" foi excluído.` });

            } catch (error: any) {
                console.error(`Erro ao excluir ${node.type}:`, error.response?.data || error.message);
                 toast({
                    title: "Erro ao excluir",
                    description: `Não foi possível excluir o item do servidor. (${error.response?.data?.message || error.message})`,
                    variant: "destructive"
                });
            }
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
   const handleDropUpload = async (files: File[], targetFolder: FolderNode) => { // Recebe targetFolder
        // Ignora se já estiver a enviar ou se o alvo não for uma pasta válida (raiz)
        if (uploading || !targetFolder || targetFolder.id === 'root') {
            if (targetFolder.id === 'root') {
                toast({ title: "Ação Inválida", description: "Não pode soltar ficheiros na pasta raiz.", variant: "destructive"});
            }
            setDraggedOverFolderId(null);
            return;
        }

        setUploading(true);
        setDraggedOverFolderId(null);
        toast({ title: "Iniciando upload...", description: `Enviando ${files.length} ficheiro(s) para "${targetFolder.name}"` }); // Usa targetFolder.name

        // Cria as promessas de upload
        const uploadPromises = files.map(file => {
            const formData = new FormData();
            formData.append('arquivo', file);
            // --- VERIFICAÇÃO CRUCIAL ---
            // Certifique-se que está a usar targetFolder.id aqui
            formData.append('projeto_id', targetFolder.id);

            // Retorna a promessa da chamada API
            return api.post<{ data: ApiArquivo }>('/arquivos', formData);
        });

        try {
            const responses = await Promise.all(uploadPromises);

            // Processa as respostas para criar os FileNodes
          const newFilesData: FileNode[] = responses.map((response, index) => {
                const newArquivo = response.data.data;
                return {
                    id: String(newArquivo.id),
                    name: newArquivo.nome,
                    type: 'file',
                    fileType: getFileTypeFromMime(newArquivo.mime_type),
                    // Path relativo à pasta alvo
                    path: `${targetFolder.path === '/' ? '' : targetFolder.path}/${newArquivo.nome}`, // Usa targetFolder.path
                    author: newArquivo.enviado_por?.nome || user?.nome || 'Usuário',
                    modifiedAt: newArquivo.data_upload_iso,
                    size: newArquivo.tamanho_bytes,
                };
            });

            toast({ title: "Upload concluído!", description: `${files.length} ficheiro(s) enviados para ${targetFolder.name}.` });

            // Atualiza o estado local se o drop foi na pasta atualmente visualizada
          if (targetFolder.id === currentFolder?.id) { // Compara targetFolder com currentFolder
                setCurrentFolder(prev => prev ? ({ ...prev, children: [...prev.children, ...newFilesData] }) : null);
            } else {
                 console.log(`Ficheiros enviados para a pasta "${targetFolder.name}" (não visível atualmente).`);
            }

        } catch (err: any) {
            console.error('Erro detalhado no drop upload:', err.response?.data || err.message || err);
            let errorMsg = `Ocorreu um erro ao enviar os ficheiros.`;
            if (err.response && err.response.data && err.response.data.errors) {
                 errorMsg = 'Erro de validação: ' + Object.values(err.response.data.errors).flat().join(' ');
            } else if (err.response?.data?.message) {
                 errorMsg = err.response.data.message;
            } else if (err.message) {
                 errorMsg = err.message;
            }
            setError(errorMsg); // Assume que tem um state 'error' ou usa toast
             toast({ title: "Erro no Upload", description: errorMsg, variant: "destructive" });
        } finally {
            setUploading(false);
        }
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
        className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex flex-col"
        // --- ADICIONE ESTES EVENTOS ---
        onDragLeave={(e) => {
             // Limpa se sair da janela inteira ou para elemento não relacionado
             const relatedTarget = e.relatedTarget as Node;
             if (!e.currentTarget.contains(relatedTarget) && relatedTarget !== null) { // Evita limpar ao mover entre linhas
                setDraggedOverFolderId(null);
             }
        }}
        onDrop={(e) => {
            // Limpa se o drop ocorrer fora de uma pasta válida
            e.preventDefault(); // Evita comportamento padrão
            setDraggedOverFolderId(null);
        }}
        // --- FIM DA ADIÇÃO ---
    >
          <header className="bg-card/80 backdrop-blur-md border-b sticky top-0 z-10 shadow-sm">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">
                            {user?.role === 'gestor' ? 'Gestor de Arquivos' : 'Meus Arquivos'}
                        </h1>
                        {/* A propriedade fullName não existe no seu tipo User, use 'nome' */}
                        <p className="text-muted-foreground">Bem-vindo, {user?.nome || 'Utilizador'}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button variant="outline" onClick={logout} className="gap-2"> {/* Confirme que está usando 'logout' aqui */}
                            <LogOut className="w-4 h-4" /> Sair
                        </Button>
                    </div>
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
                          {user?.role === 'gestor' && ( // <-- Adicione esta condição
                                <div className="flex gap-2">
                                    <Button variant="outline" onClick={handleCreateFolder}>
                                        <FolderPlus className="w-4 h-4 mr-2" />
                                        Nova Pasta
                                    </Button>
                                    <Button
                                        onClick={() => setIsUploadModalOpen(true)}
                                        disabled={uploading || currentFolder.id === 'root'}
                                        title={currentFolder.id === 'root' ? "Selecione um projeto para enviar arquivos" : "Enviar arquivo para esta pasta"}
                                    >
                                        {uploading ? (
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        ) : (
                                            <UploadCloud className="w-4 h-4 mr-2" />
                                        )}
                                        Enviar Arquivo
                                    </Button>
                                </div>
                            )}
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
            {/* Agora esta célula é apenas informativa, sem handlers de drop */}
            <TableCell
                colSpan={6}
                className="h-24 text-center text-muted-foreground"
            >
                {searchTerm ? "Nenhum item encontrado." : "Esta pasta está vazia."}
            </TableCell>
        </TableRow>
        
                                    ) : (
                                       
                                        filteredAndSortedItems.map(node => (
                                           <TableRow
    key={node.id}
    className={cn(
        "transition-all",
        // Estilos existentes
        node.type === 'folder' && "hover:bg-muted/50 cursor-pointer",
        // --- NOVO ESTILO PARA FEEDBACK VISUAL ---
        draggedOverFolderId === node.id && node.type === 'folder' && "bg-primary/10 ring-2 ring-primary ring-inset"
    )}
    onDoubleClick={() => node.type === 'folder' && navigateToFolder(node.path)}

    // --- NOVOS EVENTOS PARA DRAG & DROP ---
  onDragEnter={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            // Só ativa se forem ficheiros e NÃO for a pasta raiz
                            if (e.dataTransfer.types.includes('Files') && currentFolder?.id !== 'root') {
                                // Opcional: Adicionar um estado/classe para feedback visual na área geral
                                // Ex: setDraggingOverArea(true);
                                e.currentTarget.classList.add('bg-primary/5', 'ring-2', 'ring-primary', 'ring-inset'); // Feedback visual direto
                            }
                        }}
                       onDragOver={(e) => {
                                        // Previne o comportamento padrão (abrir ficheiro)
                                        e.preventDefault();
                                        e.stopPropagation();
                                        // Define o efeito visual (opcional, mas bom)
                                        if (currentFolder?.id !== 'root') {
                                             e.dataTransfer.dropEffect = 'copy';
                                        } else {
                                             e.dataTransfer.dropEffect = 'none';
                                        }
                                    }}
                       onDragLeave={(e) => {
        e.preventDefault();
        e.stopPropagation();
         const relatedTarget = e.relatedTarget as Node; // <-- Confirme que está assim
         if (!e.currentTarget.contains(relatedTarget)) {
             if (draggedOverFolderId === node.id) {
                 setDraggedOverFolderId(null);
             }
         }
    }}
                   onDrop={(e) => {
    // Previne o comportamento padrão
    e.preventDefault();
    e.stopPropagation();
    setDraggedOverFolderId(null);
    // Remove o feedback visual do CardContent (se existir)
    const cardContent = e.currentTarget.closest('div[data-radix-scroll-area-viewport]')?.parentElement?.parentElement; // Heurística para encontrar CardContent
    cardContent?.classList.remove('bg-primary/5', 'ring-2', 'ring-primary', 'ring-inset');

    const files = Array.from(e.dataTransfer.files); // Pega os arquivos uma vez

    if (node.type === 'folder') { // Verifica se soltou EM CIMA de uma linha de PASTA
        if (files.length > 0 && !uploading) {
            // Chama o upload para a pasta específica da linha ('node')
            handleDropUpload(files, node); // <--- Upload para a pasta da linha
        }
    } else if (currentFolder && currentFolder.id !== 'root') { // SENÃO, verifica se soltou na ÁREA GERAL da pasta atual (e não é a raiz)
        // Este bloco só executa se o 'if' anterior for falso
        if (files.length > 0 && !uploading) {
            // Chama o upload para a pasta atualmente visualizada ('currentFolder')
            handleDropUpload(files, currentFolder); // <--- Upload para a pasta atual
        }
    } else { // Caso contrário (soltou na raiz ou em um arquivo, ou currentFolder não existe)
         toast({ title: "Ação Inválida", description: "Não pode soltar ficheiros aqui ou na pasta raiz.", variant: "destructive"});
    }
}}
                                            >
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        {getNodeIcon(node)}
{node.type === 'file' ? (
                // --- FICHEIRO CLICÁVEL ---
                <span
                    className="font-medium truncate cursor-pointer hover:underline text-primary"
                    title={`Ver ${node.name}`}
                    onClick={() => handleViewFile(node)} // Chama a função de visualização
                >
                    {node.name}
                </span>
            ) : (
                // --- PASTA NÃO CLICÁVEL (usa duplo clique na linha) ---
                <span className="font-medium truncate" title={node.name}>
                    {node.name}
                </span>
            )}                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">{getNodeType(node)}</TableCell>
                                                <TableCell className="text-muted-foreground">{node.author}</TableCell>
                                                <TableCell className="text-muted-foreground">{formatDate(node.modifiedAt)}</TableCell>
              <TableCell className="text-muted-foreground">
                                                    {/* Esta lógica agora funciona para arquivos E pastas */}
                                                    {formatBytes(node.size)}
                                                </TableCell>
                                                <TableCell className="text-right">

                                               {node.type === 'file' && (
              <Button
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8 mr-1"
                  onClick={(e) => { e.stopPropagation(); handleDownload(node); }} // <-- Use onClick
                  title={`Baixar ${node.name}`}
                  // Remova asChild e <a> se estava a usar
              >
                   <Download className="w-4 h-4" />
              </Button>
          )}                                     {user?.role === 'gestor' && ( // <-- Adicione esta condição
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
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                       
                                    )}
                                    
                                </TableBody>

                                <TableFooter>
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className={cn(
                                                "h-24 text-center text-muted-foreground transition-all",
                                                currentFolder?.id !== 'root' && "border-2 border-dashed border-transparent cursor-copy"
                                            )}
                                            
                                            onDragOver={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                // Só permite soltar se NÃO for a raiz
                                                if (currentFolder && currentFolder.id !== 'root') {
                                                    e.dataTransfer.dropEffect = 'copy';
                                                    // Adiciona feedback visual (borda e fundo)
                                                    e.currentTarget.classList.add('bg-primary/10', 'border-primary');
                                                } else {
                                                    e.dataTransfer.dropEffect = 'none';
                                                }
                                            }}
                                            onDragLeave={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                // Remove feedback visual
                                                e.currentTarget.classList.remove('bg-primary/10', 'border-primary');
                                            }}
                                            onDrop={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                // Remove feedback visual
                                                e.currentTarget.classList.remove('bg-primary/10', 'border-primary');

                                                // Lógica de upload para a PASTA ATUAL
                                                if (currentFolder && currentFolder.id !== 'root') {
                                                    const files = Array.from(e.dataTransfer.files);
                                                    if (files.length > 0 && !uploading) {
                                                        // Usa a mesma função, mas sempre com 'currentFolder'
                                                        handleDropUpload(files, currentFolder);
                                                    }
                                                } else {
                                                    toast({ title: "Ação Inválida", description: "Não pode soltar ficheiros na pasta raiz.", variant: "destructive" });
                                                }
                                            }}
                                        >
                                            {/* Mensagem dinâmica */}
                                            {uploading ? (
                                                <div className="flex justify-center items-center">
                                                     <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                     Enviando...
                                                </div>
                                            ) : (
                                                currentFolder?.id !== 'root'
                                                    ? `Arraste arquivos aqui para adicionar a "${currentFolder?.name}"`
                                                    : 'Selecione um projeto para enviar arquivos'
                                            )}
                                        </TableCell>
                                    </TableRow>
                                </TableFooter>
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

        {viewingFile && (
                <Dialog
                    open={isViewModalOpen}
                    onOpenChange={(open) => {
                        setIsViewModalOpen(open);
                        if (!open) { // Se estiver a fechar
                            if (fileBlobUrl) {
                                URL.revokeObjectURL(fileBlobUrl);
                                setFileBlobUrl(null);
                            }
                            setFileHtmlContent(null); // <-- Limpa o conteúdo HTML
                        }
                    }}
                >
                    <DialogContent className="max-w-3xl h-[80vh] flex flex-col p-0"> {/* Ajuste tamanho e padding */}
                        <DialogHeader className="p-4 border-b">
                            <DialogTitle className="truncate">{viewingFile.name}</DialogTitle>
                            <DialogDescription>
                                Tipo: {getNodeType(viewingFile)} | Tamanho: {formatBytes(viewingFile.size)}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex-1 overflow-auto p-4"> {/* Área de conteúdo com scroll */}
                            {renderFilePreview(viewingFile)} {/* Função para renderizar o preview */}
                        </div>
                         <DialogFooter className="p-4 border-t">
                            {/* Botão de Download dentro do Modal */}
                            <Button
                                 variant="outline"
                                 onClick={() => viewingFile && handleDownload(viewingFile)} // <-- Use onClick
                                 // Remova asChild e <a>
                                 disabled={!viewingFile} // Segurança extra
                             >
                                 <Download className="w-4 h-4 mr-2" />
                                 Baixar
                             </Button>
                             <DialogClose asChild>
                                <Button variant="secondary">Fechar</Button>
                             </DialogClose>
                         </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}