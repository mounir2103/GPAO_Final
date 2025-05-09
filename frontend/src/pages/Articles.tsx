import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<ArticleType | 'all'>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  
  const fetchArticles = async () => {
    try {
      setLoading(true);
      const response = await articleService.getAllArticles({
        page: 0,
        size: 100,
        sort: "createdDate,desc"
      });
      if (response.success && response.data) {
        setArticles(response.data.list || []);
      } else {
        setError(response.error || "Erreur lors du chargement des articles");
      }
    } catch (error) {
      setError("Erreur lors du chargement des articles");
      console.error("Error fetching articles:", error);
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
        toast.success("Article ajouté avec succès");
        setIsAddDialogOpen(false);
        fetchArticles();
      } else {
        toast.error(response.error || "Erreur lors de l'ajout de l'article");
      }
    } catch (error) {
      toast.error("Erreur lors de l'ajout de l'article");
      console.error("Error adding article:", error);
    }
  };

  const handleEditArticle = async (article: ArticleDTO) => {
    if (!selectedArticle) return;
    try {
      const response = await articleService.updateArticle(selectedArticle.articleId, article);
      if (response.success) {
        toast.success("Article modifié avec succès");
        setIsEditDialogOpen(false);
        setSelectedArticle(null);
        fetchArticles();
      } else {
        toast.error(response.error || "Erreur lors de la modification de l'article");
      }
    } catch (error) {
      toast.error("Erreur lors de la modification de l'article");
      console.error("Error updating article:", error);
    }
  };

  const handleDeleteArticle = async () => {
    if (!selectedArticle) return;
    try {
      const response = await articleService.deleteArticle(selectedArticle.name);
      if (response.success) {
        toast.success("Article supprimé avec succès");
        setIsDeleteDialogOpen(false);
        setSelectedArticle(null);
        fetchArticles();
      } else {
        toast.error(response.error || "Erreur lors de la suppression de l'article");
      }
    } catch (error) {
      toast.error("Erreur lors de la suppression de l'article");
      console.error("Error deleting article:", error);
    }
  };

  const handleViewArticle = (article: Article) => {
    setSelectedArticle(article);
    setIsViewDialogOpen(true);
  };

  const handleEditClick = (article: Article) => {
    setSelectedArticle(article);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (article: Article) => {
    setSelectedArticle(article);
    setIsDeleteDialogOpen(true);
  };

  const filteredArticles = articles.filter((article) =>
    article.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const convertToArticleDTO = (article: Article): ArticleDTO => {
    return {
      articleId: article.articleId,
      codeBare: article.codeBare,
      articleName: article.name,
      articleDescription: article.articleDescription,
      unitPrice: article.unitPrice,
      tva: article.tva,
      fournisseur: article.fournisseur,
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
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Articles</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Article
        </Button>
      </div>

      <div className="mb-4">
        <Input
          type="text"
          placeholder="Rechercher un article..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <ArticlesTable
        articles={filteredArticles}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
        onView={handleViewArticle}
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
          <DialogDescription>
            Êtes-vous sûr de vouloir supprimer cet article ? Cette action est irréversible.
          </DialogDescription>
          <div className="flex justify-end space-x-2">
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
                <p>{selectedArticle.codeBare}</p>
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
                <p>{selectedArticle.tva}</p>
              </div>
              <div>
                <h3 className="font-medium">Supplier</h3>
                <p>{selectedArticle.fournisseur}</p>
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
