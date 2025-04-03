
import React, { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Search, Filter, Edit, Trash } from "lucide-react";
import { Article } from "@/lib/types";

// Données fictives pour la démo
const mockArticles: Article[] = [
  {
    id: "1",
    code: "MP001",
    name: "Aluminium 6061",
    type: "raw",
    unit: "kg",
    stockSecurity: 100,
    leadTime: 7,
    lotSize: 250,
    price: 3.5
  },
  {
    id: "2",
    code: "MP002",
    name: "Acier S235",
    type: "raw",
    unit: "kg",
    stockSecurity: 200,
    leadTime: 14,
    lotSize: 500,
    price: 2.8
  },
  {
    id: "3",
    code: "COMP001",
    name: "Carte électronique type A",
    type: "component",
    unit: "pcs",
    stockSecurity: 50,
    leadTime: 21,
    lotSize: 100,
    price: 15.75
  },
  {
    id: "4",
    code: "PF001",
    name: "Capteur de pression",
    type: "finished",
    unit: "pcs",
    stockSecurity: 20,
    leadTime: 3,
    lotSize: 50,
    price: 78.5,
    components: [
      { articleId: "1", articleCode: "MP001", articleName: "Aluminium 6061", quantity: 0.5 },
      { articleId: "3", articleCode: "COMP001", articleName: "Carte électronique type A", quantity: 1 }
    ]
  },
  {
    id: "5",
    code: "PF002",
    name: "Module de contrôle",
    type: "finished",
    unit: "pcs",
    stockSecurity: 15,
    leadTime: 5,
    lotSize: 30,
    price: 125,
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
  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);
  
  // Filtrer les articles
  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.code.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          article.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || article.type === filterType;
    return matchesSearch && matchesType;
  });
  
  // Fonction pour ajouter un nouvel article (simulation)
  const handleAddArticle = (newArticle: Partial<Article>) => {
    const article: Article = {
      id: `${articles.length + 1}`,
      code: newArticle.code || "",
      name: newArticle.name || "",
      type: newArticle.type as any || "raw",
      unit: newArticle.unit || "pcs",
      stockSecurity: newArticle.stockSecurity || 0,
      leadTime: newArticle.leadTime || 0,
      lotSize: newArticle.lotSize || 1,
      price: newArticle.price || 0
    };
    
    setArticles([...articles, article]);
    setIsAddDialogOpen(false);
  };
  
  // Formulaire d'ajout d'article
  const ArticleForm = () => {
    const [formData, setFormData] = useState<Partial<Article>>({
      code: "",
      name: "",
      type: "raw",
      unit: "pcs",
      stockSecurity: 10,
      leadTime: 7,
      lotSize: 1,
      price: 0
    });
    
    const handleChange = (field: string, value: any) => {
      setFormData({ ...formData, [field]: value });
    };
    
    return (
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="code">Code</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => handleChange("code", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Nom</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => handleChange("type", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="raw">Matière première</SelectItem>
                <SelectItem value="component">Composant</SelectItem>
                <SelectItem value="finished">Produit fini</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="unit">Unité</Label>
            <Select
              value={formData.unit}
              onValueChange={(value) => handleChange("unit", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Unité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pcs">Pièce</SelectItem>
                <SelectItem value="kg">Kilogramme</SelectItem>
                <SelectItem value="m">Mètre</SelectItem>
                <SelectItem value="l">Litre</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="stockSecurity">Stock de sécurité</Label>
            <Input
              id="stockSecurity"
              type="number"
              value={formData.stockSecurity}
              onChange={(e) => handleChange("stockSecurity", parseFloat(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="leadTime">Délai d'obtention (jours)</Label>
            <Input
              id="leadTime"
              type="number"
              value={formData.leadTime}
              onChange={(e) => handleChange("leadTime", parseInt(e.target.value))}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="lotSize">Taille de lot</Label>
            <Input
              id="lotSize"
              type="number"
              value={formData.lotSize}
              onChange={(e) => handleChange("lotSize", parseFloat(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Prix unitaire</Label>
            <Input
              id="price"
              type="number"
              value={formData.price}
              onChange={(e) => handleChange("price", parseFloat(e.target.value))}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
            Annuler
          </Button>
          <Button type="button" onClick={() => handleAddArticle(formData)}>
            Ajouter
          </Button>
        </DialogFooter>
      </div>
    );
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
              placeholder="Rechercher par code ou nom..." 
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Tous les types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="raw">Matières premières</SelectItem>
                <SelectItem value="component">Composants</SelectItem>
                <SelectItem value="finished">Produits finis</SelectItem>
              </SelectContent>
            </Select>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" /> Nouvel article</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Ajouter un nouvel article</DialogTitle>
                  <DialogDescription>
                    Renseignez les détails du nouvel article ci-dessous
                  </DialogDescription>
                </DialogHeader>
                <ArticleForm />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Tableau des articles */}
        <div className="rounded-md border shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Unité</TableHead>
                <TableHead className="text-right">Stock sécu.</TableHead>
                <TableHead className="text-right">Délai (j)</TableHead>
                <TableHead className="text-right">Prix</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredArticles.length > 0 ? (
                filteredArticles.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell className="font-medium">{article.code}</TableCell>
                    <TableCell>{article.name}</TableCell>
                    <TableCell>
                      {article.type === "raw" && "Matière première"}
                      {article.type === "component" && "Composant"}
                      {article.type === "finished" && "Produit fini"}
                    </TableCell>
                    <TableCell>{article.unit}</TableCell>
                    <TableCell className="text-right">{article.stockSecurity}</TableCell>
                    <TableCell className="text-right">{article.leadTime}</TableCell>
                    <TableCell className="text-right">{article.price.toFixed(2)} €</TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center space-x-1">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    Aucun article trouvé
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </Layout>
  );
};

export default ArticlesPage;
