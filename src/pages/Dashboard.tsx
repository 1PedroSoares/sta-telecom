// sta/src/pages/Dashboard.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Folder, FileText, File, ChevronRight, UploadCloud, FolderPlus, ArrowLeft,
  FileSpreadsheet, FileImage, FileArchive, Edit, Trash2, Search,
  ArrowUp, ArrowDown, LogOut, FileImage as FileImageHeader
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
import { UploadModal } from '@/components/UploadModal';

// --- Tipos de Dados ---
type FileType = 'pdf' | 'doc' | 'xls' | 'img' | 'zip' | 'other';

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
  id: 'root', name: 'Meus Arquivos', type: 'folder', path: '/', author: 'Admin', modifiedAt: '2023-01-10T10:00:00Z', size: 0,
  children: [
    {
      id: 'f1', name: 'OS-2024-001 (Torre)', type: 'folder', path: '/f1', author: 'Gestor 1', modifiedAt: '2024-02-15T09:30:00Z', size: 0, children: [
        { id: 'f1-1', name: 'Relatórios Técnicos', type: 'folder', path: '/f1/f1-1', author: 'Gestor 1', modifiedAt: '2024-03-20T14:00:00Z', size: 0, children: [] },
        { id: 'file-1a', name: 'Contrato.pdf', type: 'file', fileType: 'pdf', path: '/f1/file-1a', author: 'Admin', modifiedAt: '2024-02-15T09:35:00Z', size: 1200000 },
        { id: 'file-1b', name: 'Planilha_Custos.xlsx', type: 'file', fileType: 'xls', path: '/f1/file-1b', author: 'Gestor 1', modifiedAt: '2024-03-01T11:20:00Z', size: 55000 },
      ]
    },
    {
      id: 'f2', name: 'OS-2024-002 (Fibra)', type: 'folder', path: '/f2', author: 'Admin', modifiedAt: '2024-03-10T08:00:00Z', size: 0, children: [
        { id: 'file-2a', name: 'Apresentacao.doc', type: 'file', fileType: 'doc', path: '/f2/file-2a', author: 'Gestor 2', modifiedAt: '2024-03-11T16:05:00Z', size: 2300000 },
        { id: 'file-2b', 'name': 'Logo_Cliente.png', type: 'file', fileType: 'img', path: '/f2/file-2b', author: 'Gestor 2', modifiedAt: '2024-03-11T10:15:00Z', size: 89000 },
      ]
    },
    { id: 'file-root', name: 'Padroes_Seguranca.pdf', type: 'file', fileType: 'pdf', path: '/file-root', author: 'Admin', modifiedAt: '2023-01-20T17:00:00Z', size: 750000 },
  ],
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
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  // --- Estados do Gerenciador de Arquivos ---
  const [fileSystem, setFileSystem] = useState<FolderNode>(mockData);
  const [currentFolder, setCurrentFolder] = useState<FolderNode>(mockData);
  const [breadcrumbPath, setBreadcrumbPath] = useState<FolderNode[]>([mockData]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({ key: 'name', direction: 'asc' });
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    // Simula o carregamento dos arquivos do cliente
    setTimeout(() => {
      // No futuro, aqui você buscaria os dados do backend
      // e talvez ajustaria o mockData com base no user.id
      setCurrentFolder(mockData);
      setFileSystem(mockData);
      setBreadcrumbPath([mockData]);
      setLoading(false);
    }, 1000);
  }, [user, navigate]);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  // --- Funções do Gerenciador de Arquivos ---

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
  const navigateToFolder = (path: string) => {
    const folder = findFolderByPath(path);
    if (folder) {
      setCurrentFolder(folder);
      // Constrói breadcrumbs
      const pathParts = path.split('/').filter(Boolean);
      const newBreadcrumbs = [fileSystem];
      let currentPath = '/';
      for (const part of pathParts) {
        currentPath = currentPath + part + '/';
        const nextFolder = findFolderByPath(currentPath.slice(0, -1)); // Remove / do final
        if (nextFolder) newBreadcrumbs.push(nextFolder);
      }
      setBreadcrumbPath(newBreadcrumbs);
    }
  };

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
  const handleCreateFolder = () => {
    const folderName = prompt("Nome da nova pasta:");
    if (folderName) {
      // Simulação de criação
      const newFolder: FolderNode = {
        id: `new-folder-${Date.now()}`, name: folderName,
        path: `${currentFolder.path === '/' ? '' : currentFolder.path}/${folderName}`,
        type: 'folder', author: user?.fullName || 'Usuário',
        modifiedAt: new Date().toISOString(), size: 0, children: []
      };

      // Atualiza o estado (de forma imutável)
      // (Esta é uma simulação simples, um backend real faria isso)
      setCurrentFolder(prev => ({ ...prev, children: [newFolder, ...prev.children] }));

      toast({ title: "Pasta criada!", description: `A pasta "${folderName}" foi criada.` });
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


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex flex-col">
      <header className="bg-card/80 backdrop-blur-md border-b border-border shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {user?.role === 'employee' ? 'Portal do Colaborador' : 'Portal do Cliente'}
            </h1>
            <p className="text-muted-foreground">Bem-vindo, {user?.fullName}</p>
          </div>
          <div className="flex items-center gap-4">
            {user?.role === 'employee' && (
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
        currentPath={currentFolder?.path || '/'}
        onUploadComplete={handleUploadComplete}
      />
    </div>
  );
}