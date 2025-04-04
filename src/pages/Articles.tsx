import React, { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Filter } from "lucide-react";
import { Article, ArticleStatus } from "@/lib/types";
import { ArticlesTable } from "@/components/articles/ArticlesTable";
import { ArticleForm } from "@/components/articles/ArticleForm";
import { toast } from "sonner";

// Données fictives pour la démo
const mockArticles: Article[] = [
  {
    id: "1",
    code_bare: "MP001",
    articleName: "Aluminium 6061",
    type: "raw",
    unit: "kg",
    safetyStock: 100,
    delaidoptention: 7,
    lotSize: 250,
    unitPrice: 3.5,
    articleDescription: "Alliage d'aluminium de haute qualité pour l'industrie",
    tva: 20,
    fournisseur: "MetalPro Industries",
    status: "active",
    articleAchte: true,
    articleFabrique: false,
    // Compatibilité avec le code existant
    code: "MP001",
    name: "Aluminium 6061",
    stockSecurity: 100,
    leadTime: 7,
    price: 3.5,
    TVA: 20,
    isArticleAchete: true,
    isArticleFabrique: false
  },
  {
    id: "2",
    code_bare: "MP002",
    articleName: "Acier S235",
    type: "raw",
    unit: "kg",
    safetyStock: 200,
    delaidoptention: 14,
    lotSize: 500,
    unitPrice: 2.8,
    articleDescription: "Acier de construction standard",
    tva: 20,
    fournisseur: "SteelMaster",
    status: "active",
    articleAchte: true,
    articleFabrique: false,
    // Compatibilité avec le code existant
    code: "MP002",
    name: "Acier S235",
    stockSecurity: 200,
    leadTime: 14,
    price: 2.8,
    TVA: 20,
    isArticleAchete: true,
    isArticleFabrique: false
  },
  {
    id: "3",
    code_bare: "COMP001",
    articleName: "Carte électronique type A",
    type: "component",
    unit: "pcs",
    safetyStock: 50,
    delaidoptention: 21,
    lotSize: 100,
    unitPrice: 15.75,
    articleDescription: "Carte électronique pour capteurs de pression",
    tva: 20,
    fournisseur: "ElectroTech",
    status: "active",
    articleAchte: true,
    articleFabrique: false,
    // Compatibilité avec le code existant
    code: "COMP001",
    name: "Carte électronique type A",
    stockSecurity: 50,
    leadTime: 21,
    price: 15.75,
    TVA: 20,
    isArticleAchete: true,
    isArticleFabrique: false
  },
  {
    id: "4",
    code_bare: "PF001",
    articleName: "Capteur de pression",
    type: "finished",
    unit: "pcs",
    safetyStock: 20,
    delaidoptention: 3,
    lotSize: 50,
    unitPrice: 78.5,
    articleDescription: "Capteur de pression haute précision",
    tva: 20,
    fournisseur: null,
    status: "active",
    articleFabrique: true,
    articleAchte: false,
    // Compatibilité avec le code existant
    code: "PF001",
    name: "Capteur de pression",
    stockSecurity: 20,
    leadTime: 3,
    price: 78.5,
    TVA: 20,
    isArticleFabrique: true,
    isArticleAchete: false,
    components: [
      { articleId: "1", articleCode: "MP001", articleName: "Aluminium 6061", quantity: 0.5 },
      { articleId: "3", articleCode: "COMP001", articleName: "Carte électronique type A", quantity: 1 }
    ]
  },
  {
    id: "5",
    code_bare: "PF002",
    articleName: "Module de contrôle",
    type: "finished",
    unit: "pcs",
    safetyStock: 15,
    delaidoptention: 5,
    lotSize: 30,
    unitPrice: 125,
    articleDescription: "Module de contrôle pour systèmes industriels",
    tva: 20,
    fournisseur: null,
    status: "active",
    articleFabrique: true,
    articleAchte: false,
    // Compatibilité avec le code existant
    code: "PF002",
    name: "Module de contrôle",
    stockSecurity: 15,
    leadTime: 5,
    price: 125,
    TVA: 20,
    isArticleFabrique: true,
    isArticleAchete: false,
    components: [
      { articleId: "2", articleCode: "MP002", articleName: "Acier S235", quantity: 1.2 },
      { articleId: "3", articleCode: "COMP001", articleName: "Carte électronique type A", quantity: 2 }
    ]
  }
];

const ArticlesPage = () => {
  const [articles, setArticles] = useState<Article[]>(mockArticles);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("all");
  
  // Dialogues
  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState<boolean>(false);
  
  // Article sélectionné
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  
  // Filtrer les articles
  const filteredArticles = articles.filter(article => {
    const searchFields = [
      article.code_bare || article.code || "",
      article.articleName || article.name || "",
      article.articleDescription || "",
      article.fournisseur || ""
    ];
    
    const matchesSearch = searchFields.some(field => 
      field.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    const matchesType = filterType === "all" || article.type === filterType;
    return matchesSearch && matchesType;
  });
  
  // Fonction pour ajouter un nouvel article
  const handleAddArticle = (newArticle: Article) => {
    setArticles([...articles, newArticle]);
    setIsAddDialogOpen(false);
    toast.success("Article ajouté avec succès");
  };
  
  // Fonction pour éditer un article
  const handleEditArticle = (editedArticle: Article) => {
    const updatedArticles = articles.map(article => 
      article.id === editedArticle.id ? editedArticle : article
    );
    setArticles(updatedArticles);
    setIsEditDialogOpen(false);
    toast.success("Article modifié avec succès");
  };
  
  // Fonction pour supprimer un article
  const handleDeleteArticle = () => {
    if (!selectedArticle) return;
    
    const updatedArticles = articles.filter(article => article.id !== selectedArticle.id);
    setArticles(updatedArticles);
    setIsDeleteDialogOpen(false);
    setSelectedArticle(null);
    toast.success("Article supprimé avec succès");
  };
  
  // Handlers pour l'ouverture des dialogues
  const openEditDialog = (article: Article) => {
    setSelectedArticle(article);
    setIsEditDialogOpen(true);
  };
  
  const openDeleteDialog = (article: Article) => {
    setSelectedArticle(article);
    setIsDeleteDialogOpen(true);
  };
  
  const openViewDialog = (article: Article) => {
    setSelectedArticle(article);
    setIsViewDialogOpen(true);
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold">Gestion des Articles</h1>
          <p className="text-muted-foreground">
            Gérer l'ensemble de vos articles, matières premières et produits finis
          </p>
        </div>

        {/* Outils de recherche et filtres */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Rechercher par code, nom, description..." 
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tous les types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="raw">Matières premières</SelectItem>
                <SelectItem value="component">Composants</SelectItem>
                <SelectItem value="finished">Produits finis</SelectItem>
              </SelectContent>
            </Select>
            
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" /> Nouvel article
            </Button>
          </div>
        </div>

        {/* Tableau des articles */}
        <ArticlesTable
          data={filteredArticles}
          onEdit={openEditDialog}
          onDelete={openDeleteDialog}
          onView={openViewDialog}
        />

        {/* Dialogue d'ajout d'article */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>Ajouter un nouvel article</DialogTitle>
              <DialogDescription>
                Renseignez les détails du nouvel article ci-dessous
              </DialogDescription>
            </DialogHeader>
            <ArticleForm
              onSubmit={handleAddArticle}
              onCancel={() => setIsAddDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Dialogue d'édition d'article */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>Modifier l'article</DialogTitle>
              <DialogDescription>
                Modifiez les détails de l'article
              </DialogDescription>
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

        {/* Dialogue de suppression d'article */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer cet article ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action est irréversible. L'article {selectedArticle?.code_bare || selectedArticle?.code} - {selectedArticle?.articleName || selectedArticle?.name} sera définitivement supprimé.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteArticle} className="bg-destructive text-destructive-foreground">
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Dialogue de visualisation d'article */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>Détails de l'article</DialogTitle>
            </DialogHeader>
            {selectedArticle && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Code</p>
                  <p>{selectedArticle.code_bare || selectedArticle.code}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Nom</p>
                  <p>{selectedArticle.articleName || selectedArticle.name}</p>
                </div>
                <div className="space-y-1 col-span-2">
                  <p className="text-sm font-medium">Description</p>
                  <p>{selectedArticle.articleDescription || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Type</p>
                  <p>
                    {selectedArticle.type === 'raw' && 'Matière première'}
                    {selectedArticle.type === 'component' && 'Composant'}
                    {selectedArticle.type === 'finished' && 'Produit fini'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Unité</p>
                  <p>{selectedArticle.unit}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Prix unitaire</p>
                  <p>{(selectedArticle.unitPrice || selectedArticle.price).toFixed(2)} €</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">TVA</p>
                  <p>{selectedArticle.tva || selectedArticle.TVA || 20} %</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Fournisseur</p>
                  <p>{selectedArticle.fournisseur || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Stock de sécurité</p>
                  <p>{selectedArticle.safetyStock || selectedArticle.stockSecurity} {selectedArticle.unit}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Délai d'obtention</p>
                  <p>{selectedArticle.delaidoptention || selectedArticle.leadTime} jours</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Taille de lot</p>
                  <p>{selectedArticle.lotSize} {selectedArticle.unit}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Statut</p>
                  <p>{selectedArticle.status || 'Actif'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Article fabriqué</p>
                  <p>{(selectedArticle.articleFabrique || selectedArticle.isArticleFabrique) ? 'Oui' : 'Non'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Article acheté</p>
                  <p>{(selectedArticle.articleAchte || selectedArticle.isArticleAchete) ? 'Oui' : 'Non'}</p>
                </div>
                
                {selectedArticle.components && selectedArticle.components.length > 0 && (
                  <div className="col-span-2 space-y-2 mt-4">
                    <h3 className="font-medium">Composants</h3>
                    <div className="border rounded-md">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="px-4 py-2 text-left">Code</th>
                            <th className="px-4 py-2 text-left">Nom</th>
                            <th className="px-4 py-2 text-right">Quantité</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedArticle.components.map((component) => (
                            <tr key={component.articleId} className="border-b">
                              <td className="px-4 py-2">{component.articleCode}</td>
                              <td className="px-4 py-2">{component.articleName}</td>
                              <td className="px-4 py-2 text-right">{component.quantity}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default ArticlesPage;
