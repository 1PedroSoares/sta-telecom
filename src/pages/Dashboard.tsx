// sta/src/pages/Dashboard.tsx

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Folder, FileText, File, ChevronRight, UploadCloud, FolderPlus, ArrowLeft,
  FileSpreadsheet, FileImage, FileArchive, Edit, Trash2, Search,
  ArrowUp, ArrowDown, LogOut, FileImage as FileImageHeader , Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
import { Footer } from '@/components/Footer';
import UploadModal from '@/components/UploadModal';
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
  // url_download: string; // Não precisamos diretamente aqui
};

type ApiProjeto = {
  id: string;
  nome: string;
  descricao: string | null;
  criado_em: string; // Ou o nome correto retornado pela API
  cliente?: { nome: string; }; // Simplificado
  arquivos: ApiArquivo[];
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

// --- Dados Mockados Iniciais ---

const mockData: FolderNode = {
  id: '1', // Assuming 'Projetos STA' maps to a project/folder with ID 1
  name: 'Projetos STA', type: 'folder', path: '/', author: 'Admin', modifiedAt: '2023-01-10T10:00:00Z', size: 0,
  children: [
    {
      id: '2', // Assuming 'Cliente A (OS-2024-001)' maps to project ID 2
      name: 'Cliente A (OS-2024-001)', type: 'folder', path: '/f1', author: 'Gestor 1', modifiedAt: '2024-02-15T09:30:00Z', size: 0, children: [
         { id: '3', name: 'Relatórios Técnicos', type: 'folder', path: '/f1/f1-1', author: 'Gestor 1', modifiedAt: '2024-03-20T14:00:00Z', size: 0, children: [] },
        // ... files ...
      ]
    },
],
};


const getFileTypeFromMime = (mimeType: string | null | undefined): FileType => {
    if (!mimeType) return 'other';
    if (mimeType.includes('pdf')) return 'pdf';
    if (mimeType.includes('word')) return 'doc';
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'xls';
    if (mimeType.startsWith('image/')) return 'img';
    if (mimeType.includes('zip')) return 'zip';
    return 'other';
};

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


export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isDataLoading, setIsDataLoading] = useState(true);

  // --- Estados do Gerenciador de Arquivos ---
  const [fileSystem, setFileSystem] = useState<FolderNode>(mockData);
  const [currentFolder, setCurrentFolder] = useState<FolderNode>(mockData);
  const [breadcrumbPath, setBreadcrumbPath] = useState<FolderNode[]>([mockData]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({ key: 'name', direction: 'asc' });
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);


  const transformApiProjetoToFolderNode = useCallback((apiProjeto: ApiProjeto): FolderNode => {
    const projectFolder: FolderNode = {
      id: String(apiProjeto.id),
      name: apiProjeto.nome,
      type: 'folder',
      path: '/', // Cliente vê seu projeto como a raiz
      author: apiProjeto.cliente?.nome || 'Cliente',
      // Usar a data de criação do projeto ou a data atual se não disponível
      modifiedAt: apiProjeto.criado_em || new Date().toISOString(),
      size: 0,
      children: apiProjeto.arquivos.map(apiArquivo => ({
        id: String(apiArquivo.id),
        name: apiArquivo.nome,
        type: 'file',
        fileType: getFileTypeFromMime(apiArquivo.mime_type),
        path: `/${apiArquivo.nome}`, // Arquivos diretamente na raiz do projeto
        author: apiArquivo.enviado_por?.nome || 'Desconhecido',
        modifiedAt: apiArquivo.data_upload_iso,
        size: apiArquivo.tamanho_bytes,
      })),
    };
    return projectFolder;
  }, []);

  useEffect(() => {
    // Não busca se autenticação ainda está carregando ou se não há utilizador
    if (isAuthLoading || !user) {
        if (!isAuthLoading && !user) setIsDataLoading(false); // Para loading se não logado
        return;
    }

    const fetchData = async () => {
        setIsDataLoading(true);
        try {
            let rootFolder: FolderNode | null = null;

            if (user.role === 'gestor') {
                // --- LÓGICA PARA GESTOR ---
                const response = await api.get('/projetos'); // Busca todos os projetos
                const projetosDaApi = response.data.data;

                const projectFolders: FolderNode[] = projetosDaApi.map((proj: ApiProjeto) => ({
                    id: String(proj.id),
                    name: proj.nome,
                    type: 'folder',
                    path: `/${String(proj.id)}`, // Path baseado no ID
                    author: proj.cliente?.nome || 'Gestor',
                    modifiedAt: proj.criado_em || new Date().toISOString(),
                    size: 0,
                    // Gestor carrega filhos (arquivos) ao navegar (como no FileManager)
                    children: [], 
                }));

                rootFolder = {
                    id: 'root',
                    name: 'Todos os Projetos', // Nome da raiz para o gestor
                    type: 'folder',
                    path: '/',
                    author: 'Admin',
                    modifiedAt: new Date().toISOString(),
                    size: 0,
                    children: projectFolders,
                };

            } else if (user.role === 'cliente') {
                // --- LÓGICA PARA CLIENTE ---
                const response = await api.get('/meu-projeto'); // Busca o projeto do cliente
                const projetoData = response.data.data;

                if (projetoData) {
                    // Transforma o projeto e seus arquivos (a função já existe)
                    rootFolder = transformApiProjetoToFolderNode(projetoData);
                    // Ajusta o nome da raiz para o cliente
                    rootFolder.name = projetoData.nome || 'Meu Projeto'; 
                } else {
                    // Cliente sem projeto: Cria uma raiz vazia
                     toast({ title: "Nenhum projeto encontrado", variant: "destructive" });
                     rootFolder = { 
                         id: 'root', name: 'Meus Arquivos', type: 'folder', path: '/', 
                         author: user.fullName || 'Cliente', modifiedAt: new Date().toISOString(), 
                         size: 0, children: [] 
                     };
                }
            }

            // Atualiza os estados se rootFolder foi definido
            if (rootFolder) {
                setFileSystem(rootFolder);
                setCurrentFolder(rootFolder);
                setBreadcrumbPath([rootFolder]);
            } else {
                 // Caso inesperado (ex: perfil desconhecido)
                 throw new Error("Perfil de utilizador não reconhecido para buscar dados.");
            }

        } catch (error: any) {
            console.error("Erro ao buscar dados do dashboard:", error);
            toast({
                title: "Erro ao carregar arquivos",
                description: error.response?.data?.message || error.message || "Tente recarregar a página.",
                variant: "destructive",
            });
            // Define um estado vazio em caso de erro para evitar crash
             const errorRoot: FolderNode = { id: 'root-error', name: 'Erro ao Carregar', type: 'folder', path: '/', author: '', modifiedAt: '', size: 0, children: [] };
             setFileSystem(errorRoot);
             setCurrentFolder(errorRoot);
             setBreadcrumbPath([errorRoot]);
        } finally {
            setIsDataLoading(false);
        }
    };

    fetchData();
  // Depende do utilizador, status da auth, e da função de transformação
  }, [user, isAuthLoading, transformApiProjetoToFolderNode, toast, navigate]);

//  useEffect(() => {
//       if (user) { // Apenas executa se o user existir
//           // Simula o carregamento dos arquivos do cliente
//           setTimeout(() => {
//             // No futuro, aqui você buscaria os dados do backend
//             setCurrentFolder(mockData);
//             setFileSystem(mockData);
//             setBreadcrumbPath([mockData]);
//             setLoading(false);
//           }, 1000);
//       } else {
//          // Se não há usuário, talvez nem precise carregar, ou redirecionar (melhor feito no App.tsx)
//          setLoading(false); // Para parar o loading se não houver user
//       }
//    }, [user]);

 const handleLogout = async () => {
    // --- CORRECTION HERE ---
    await logout(); // Change signOut() to logout()
    // --- END CORRECTION ---
    // navigate('/'); // The logout function in AuthContext now handles redirection
  };

  // --- Funções do Gerenciador de Arquivos ---

  // Encontra uma pasta no sistema de arquivos
 const findFolderByPath = useCallback((path: string, node: FolderNode | null = fileSystem): FolderNode | null => {
    if (!node) return null; // Retorna null se fileSystem ainda não carregou
    if (node.path === path) return node;
    for (const child of node.children) {
      if (child.type === 'folder') {
        const found = findFolderByPath(path, child); // Recursão continua igual
        if (found) return found;
      }
    }
    return null;
  }, [fileSystem]);

  // Navega para uma pasta
 const navigateToFolder = useCallback((path: string) => {
    if (!fileSystem) return; // Não faz nada se o sistema não carregou

    const folder = findFolderByPath(path);
    if (folder) {
      setCurrentFolder(folder);
      // Constrói breadcrumbs (lógica adaptada para garantir que fileSystem existe)
      const pathParts = path === '/' ? [] : path.split('/').filter(Boolean); // Trata a raiz
      const newBreadcrumbs = [fileSystem]; // Começa sempre com a raiz
      let currentPath = '/';

      for (const part of pathParts) {
        // Constrói o caminho incrementalmente
        const nextPath = currentPath === '/' ? `/${part}` : `${currentPath}/${part}`;
        const nextFolder = findFolderByPath(nextPath); // Usa a função segura findFolderByPath

        // Adiciona ao breadcrumb apenas se encontrar a pasta e se o caminho for diferente da raiz
        if (nextFolder && nextFolder.path !== '/') {
            newBreadcrumbs.push(nextFolder);
            currentPath = nextFolder.path; // Atualiza o caminho atual para o da pasta encontrada
        } else if (path === '/') {
            // Se o target for a raiz, só a raiz deve estar no breadcrumb
            break; // Sai do loop
        }
         // Se não encontrar (não deveria acontecer em estrutura simples), ignora
      }
       setBreadcrumbPath(newBreadcrumbs);
    } else {
        console.warn(`Tentativa de navegar para pasta não encontrada: ${path}`);
         // Opcional: Redirecionar para a raiz ou mostrar erro
         setCurrentFolder(fileSystem); // Volta para a raiz como fallback
         setBreadcrumbPath([fileSystem]);
    }
  }, [fileSystem, findFolderByPath]);

  // Lógica de filtragem e ordenação
  const filteredAndSortedItems = useMemo(() => {
    if (!currentFolder) return [];

    // 1. Filtrar por pesquisa
    const filtered = currentFolder.children.filter(node =>
      // ADICIONE "node.name &&" AQUI
      node.name && node.name.toLowerCase().includes(searchTerm.toLowerCase())
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
 const handleCreateFolder = () => {
    if (!currentFolder || !user || user.role !== 'gestor') return; // Segurança extra

    const folderName = prompt("Nome da nova pasta:");
    if (folderName) {
      // Simulação de criação - IDEALMENTE CHAMARIA A API AQUI
      const newFolder: FolderNode = {
        id: `new-folder-${Date.now()}`, name: folderName,
        // Path construído corretamente
        path: `${currentFolder.path === '/' ? '' : currentFolder.path}/${folderName}`,
        type: 'folder', author: user?.fullName || 'Usuário',
        modifiedAt: new Date().toISOString(), size: 0, children: []
      };

      // Atualiza o estado localmente (imutável)
      setCurrentFolder(prev => prev ? ({ ...prev, children: [newFolder, ...prev.children] }) : null);

      toast({ title: "Pasta criada!", description: `A pasta "${folderName}" foi criada localmente.` });
      // TODO: Adicionar chamada API para criar a pasta no backend
    }
  };

  const handleEdit = (node: FileSystemNode) => {
    if (!currentFolder || !user || user.role !== 'gestor') return; // Segurança extra

    const newName = prompt(`Novo nome para "${node.name}":`, node.name);
    if (newName && newName !== node.name) {
      // Simulação de edição - IDEALMENTE CHAMARIA A API AQUI
      setCurrentFolder(prev => prev ? ({
          ...prev,
          children: prev.children.map(child =>
              child.id === node.id ? { ...child, name: newName } : child
          )
      }) : null);
      toast({ title: "Renomeado!", description: `"${node.name}" agora é "${newName}" (localmente).` });
      // TODO: Adicionar chamada API para renomear no backend
    }
  };

  const handleDelete = (node: FileSystemNode) => {
     if (!currentFolder || !user || user.role !== 'gestor') return; // Segurança extra

    if (confirm(`Tem certeza que deseja excluir "${node.name}"?`)) {
      // Simulação de exclusão - IDEALMENTE CHAMARIA A API AQUI
       setCurrentFolder(prev => prev ? ({
           ...prev,
           children: prev.children.filter(child => child.id !== node.id)
       }) : null);
      toast({ title: "Excluído!", description: `"${node.name}" foi excluído (localmente).` });
      // TODO: Adicionar chamada API para excluir no backend
    }
  };

 const handleUploadComplete = (newFiles: FileNode[]) => {
      // Adiciona os novos arquivos ao estado atual (lógica existente ok, mas verifica currentFolder)
      if (!currentFolder) return;
      setCurrentFolder(prev => prev ? ({
          ...prev,
          children: [...prev.children, ...newFiles],
      }) : null);
  };

if (isAuthLoading || isDataLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex flex-col items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">
          {isAuthLoading ? 'Verificando autenticação...' : 'Carregando arquivos...'}
        </p>
      </div>
    );
  }

  // Se terminou de carregar mas não há pasta atual (ex: erro na API ou cliente sem projeto)
   if (!currentFolder) {
      return (
          <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex flex-col">
              {/* Manter o Header para logout */}
              <header className="bg-card/80 backdrop-blur-md border-b border-border shadow-sm sticky top-0 z-50">
                  <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                      <div>
                          <h1 className="text-2xl font-bold text-foreground">
                              {user?.role === 'gestor' ? 'Portal do Colaborador' : 'Portal do Cliente'}
                          </h1>
                          <p className="text-muted-foreground">Bem-vindo, {user?.fullName}</p>
                      </div>
                      <div className="flex items-center gap-4">
                          <Button variant="outline" onClick={handleLogout} className="gap-2">
                              <LogOut className="w-4 h-4" />
                              Sair
                          </Button>
                      </div>
                  </div>
              </header>
              <main className="container mx-auto px-4 py-8 flex-1 flex items-center justify-center">
                  <p className="text-xl text-muted-foreground">Não foi possível carregar os arquivos ou nenhum projeto foi encontrado.</p>
              </main>
              <Footer />
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex flex-col">
      <header className="bg-card/80 backdrop-blur-md border-b border-border shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {user?.role === 'gestor' ? 'Portal do Colaborador' : 'Portal do Cliente'}
            </h1>
            <p className="text-muted-foreground">Bem-vindo, {user?.fullName}</p>
          </div>
          <div className="flex items-center gap-4">
            {user?.role === 'gestor' && (
              <Button onClick={() => navigate('/file-manager')} className="gap-2 bg-primary hover:bg-primary/90">
                <FileImageHeader className="w-4 h-4" />
                Gerenciar Arquivos
              </Button>
            )}
            <Button variant="outline" onClick={handleLogout} className="gap-2">
              <LogOut className="w-4 h-4" />
              Sair
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
                              {folder.name === 'Meus Arquivos' ? 'Início' : folder.name}
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
       {/* {user?.role === 'gestor' && ( // <-- Starts here
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleCreateFolder}>
                    <FolderPlus className="w-4 h-4 mr-2" />
                    Nova Pasta
                  </Button>
                  <Button onClick={() => setIsUploadModalOpen(true)}>
                    <UploadCloud className="w-4 h-4 mr-2" />
                    Enviar Arquivo
                  </Button>
                </div>
              )} */}

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
                        className={cn(node.type === 'folder' && "hover:bg-muted/50 cursor-pointer")}
                        onDoubleClick={() => node.type === 'folder' && navigateToFolder(node.path)}
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
                            <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => handleEdit(node)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="w-8 h-8 text-destructive hover:text-destructive" onClick={() => handleDelete(node)}>
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
        projetoId={currentFolder?.id ?? null} // Passa o ID da pasta atual
        currentPath={currentFolder?.path || '/'} // Passa o caminho atual
        onUploadComplete={handleUploadComplete} // Passa a função de callback
      />
    </div>
  );
}