import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Plus, Search } from 'lucide-react';
import { ArticlesTable } from '@/components/articles/ArticlesTable';
import { ArticleForm } from '@/components/articles/ArticleForm';
import { articleService } from '@/services/api';
import { Article, ArticleType, ArticleDTO } from '@/lib/types';
import { toast } from "sonner";

const ArticlesPage: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<ArticleType | 'all'>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  
  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await articleService.getAllArticles({ 
        page: 0, 
        size: 100,
        sort: "createdDate,desc"
      });
      if (response.success && response.data) {
        setArticles(response.data.list || []);
      } else {
        setArticles([]);
        setError(response.error || 'Failed to load articles');
        toast.error(response.error || 'Failed to load articles');
      }
    } catch (err) {
      console.error('Error fetching articles:', err);
      setArticles([]);
      setError('Failed to load articles. Please try again later.');
      toast.error('Failed to load articles. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleAddArticle = async (article: ArticleDTO) => {
    try {
      const response = await articleService.createArticle(article);
      if (response.success) {
        toast.success(response.message || 'Article ajouté avec succès');
        await fetchArticles();
        setIsAddDialogOpen(false);
      } else {
        if (response.status === 401 || response.status === 403) {
          toast.error('Votre session a expiré. Veuillez vous reconnecter.');
          window.location.href = '/login';
        } else if (response.status === 409) {
          toast.error('Un article avec ce code existe déjà.');
        } else {
          toast.error(response.error || 'Échec de l\'ajout de l\'article');
        }
      }
    } catch (err) {
      console.error('Error adding article:', err);
      toast.error('Échec de l\'ajout de l\'article. Veuillez réessayer.');
    }
  };

  const handleEditArticle = async (article: ArticleDTO) => {
    try {
      const response = await articleService.updateArticle(article.articleId!, article);
      if (response.success) {
        toast.success(response.message || 'Article mis à jour avec succès');
        await fetchArticles();
        setIsEditDialogOpen(false);
      } else {
        if (response.status === 401 || response.status === 403) {
          toast.error('Votre session a expiré. Veuillez vous reconnecter.');
          window.location.href = '/login';
        } else {
          toast.error(response.error || 'Échec de la mise à jour de l\'article');
        }
      }
    } catch (err) {
      console.error('Error updating article:', err);
      toast.error('Échec de la mise à jour de l\'article. Veuillez réessayer.');
    }
  };

  const handleDeleteArticle = async () => {
    if (!selectedArticle) return;
    try {
      const response = await articleService.deleteArticle(selectedArticle.name);
      if (response.success) {
        toast.success(response.message || 'Article deleted successfully');
        await fetchArticles();
    setIsDeleteDialogOpen(false);
      } else {
        if (response.status === 401 || response.status === 403) {
          toast.error('Your session has expired. Please log in again.');
          window.location.href = '/login';
        } else {
          toast.error(response.error || 'Failed to delete article');
        }
      }
    } catch (err) {
      console.error('Error deleting article:', err);
      toast.error('Failed to delete article. Please try again.');
    }
  };

  const filteredArticles = articles.filter(article => {
    const name = article.name || "";
    const code = article.code_bare || "";
    const matchesSearch = name.toLowerCase().includes(search.toLowerCase()) ||
      code.toLowerCase().includes(search.toLowerCase());
    const matchesType = selectedType === 'all' || 
      (selectedType === 'raw' && article.isArticleAchte) ||
      (selectedType === 'component' && article.isArticleFabrique) ||
      (selectedType === 'finished' && !article.isArticleAchte && !article.isArticleFabrique);
    return matchesSearch && matchesType;
  });

  const convertToArticleDTO = (article: Article): ArticleDTO => {
    return {
      articleId: article.articleId,
      code_bare: article.code_bare,
      articleName: article.name,
      articleDescription: article.articleDescription,
      unitPrice: article.unitPrice,
      TVA: article.TVA,
      Fournisseur: article.Fournisseur,
      delaidoptention: article.delaidoptention,
      status: article.status,
      isArticleFabrique: article.isArticleFabrique,
      isArticleAchte: article.isArticleAchte,
      safetyStock: article.safetyStock,
      lotSize: article.lotSize,
      type: article.type || 'raw',
      unit: article.unit || 'pcs'
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Articles</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Article
        </Button>
        </div>

      <div className="flex gap-4">
          <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
            placeholder="Search articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
            />
          </div>
        <Select value={selectedType} onValueChange={(value) => setSelectedType(value as ArticleType | 'all')}>
              <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="raw">Raw Materials</SelectItem>
            <SelectItem value="component">Components</SelectItem>
            <SelectItem value="finished">Finished Products</SelectItem>
              </SelectContent>
            </Select>
        </div>

        <ArticlesTable
        articles={filteredArticles}
        onEdit={(article) => {
          setSelectedArticle(article);
          setIsEditDialogOpen(true);
        }}
        onDelete={(article) => {
          setSelectedArticle(article);
          setIsDeleteDialogOpen(true);
        }}
        onView={(article) => {
          setSelectedArticle(article);
          setIsViewDialogOpen(true);
        }}
      />

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
            <DialogHeader>
            <DialogTitle>Add New Article</DialogTitle>
            </DialogHeader>
            <ArticleForm
              onSubmit={handleAddArticle}
              onCancel={() => setIsAddDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
            <DialogHeader>
            <DialogTitle>Edit Article</DialogTitle>
            </DialogHeader>
            {selectedArticle && (
              <ArticleForm
                article={selectedArticle}
                onSubmit={handleEditArticle}
                onCancel={() => setIsEditDialogOpen(false)}
              />
            )}
          </DialogContent>
        </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Article</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this article?</p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteArticle}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent>
            <DialogHeader>
            <DialogTitle>Article Details</DialogTitle>
            </DialogHeader>
            {selectedArticle && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Name</h3>
                <p>{selectedArticle.name}</p>
                </div>
              <div>
                <h3 className="font-medium">Barcode</h3>
                <p>{selectedArticle.code_bare}</p>
                </div>
              <div>
                <h3 className="font-medium">Description</h3>
                <p>{selectedArticle.articleDescription}</p>
                </div>
              <div>
                <h3 className="font-medium">Unit Price</h3>
                <p>{selectedArticle.unitPrice}</p>
                </div>
              <div>
                <h3 className="font-medium">TVA</h3>
                <p>{selectedArticle.TVA}</p>
                </div>
              <div>
                <h3 className="font-medium">Supplier</h3>
                <p>{selectedArticle.Fournisseur}</p>
                </div>
              <div>
                <h3 className="font-medium">Lead Time</h3>
                <p>{selectedArticle.delaidoptention}</p>
                </div>
              <div>
                <h3 className="font-medium">Safety Stock</h3>
                <p>{selectedArticle.safetyStock}</p>
                    </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
  );
};

export default ArticlesPage;
