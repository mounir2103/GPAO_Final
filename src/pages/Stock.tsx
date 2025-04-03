
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Stock } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Search, Plus, ArrowDown, ArrowUp, Filter } from "lucide-react";

// Données fictives pour la démo
const mockStocks: Stock[] = [
  {
    articleId: "1",
    articleCode: "MP001",
    articleName: "Aluminium 6061",
    available: 450,
    reserved: 120,
    expected: 250
  },
  {
    articleId: "2",
    articleCode: "MP002",
    articleName: "Acier S235",
    available: 780,
    reserved: 350,
    expected: 500
  },
  {
    articleId: "3",
    articleCode: "COMP001",
    articleName: "Carte électronique type A",
    available: 85,
    reserved: 40,
    expected: 100
  },
  {
    articleId: "4",
    articleCode: "PF001",
    articleName: "Capteur de pression",
    available: 32,
    reserved: 15,
    expected: 50
  },
  {
    articleId: "5",
    articleCode: "PF002",
    articleName: "Module de contrôle",
    available: 18,
    reserved: 8,
    expected: 30
  }
];

const StockPage = () => {
  const [stocks, setStocks] = useState<Stock[]>(mockStocks);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isStockEntryDialogOpen, setIsStockEntryDialogOpen] = useState<boolean>(false);
  const [isStockExitDialogOpen, setIsStockExitDialogOpen] = useState<boolean>(false);
  const [selectedArticleId, setSelectedArticleId] = useState<string>("");
  const [stockQuantity, setStockQuantity] = useState<number>(0);

  // Filtrer les articles
  const filteredStocks = stocks.filter(stock => {
    return stock.articleCode?.toLowerCase().includes(searchQuery.toLowerCase()) || 
           stock.articleName?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Fonction pour ajouter du stock
  const handleStockEntry = () => {
    if (!selectedArticleId || stockQuantity <= 0) {
      toast.error("Veuillez sélectionner un article et entrer une quantité valide");
      return;
    }

    setStocks(prevStocks => 
      prevStocks.map(stock => 
        stock.articleId === selectedArticleId 
          ? { ...stock, available: stock.available + stockQuantity } 
          : stock
      )
    );

    toast.success(`Entrée de stock de ${stockQuantity} unités enregistrée`);
    setIsStockEntryDialogOpen(false);
    setSelectedArticleId("");
    setStockQuantity(0);
  };

  // Fonction pour sortir du stock
  const handleStockExit = () => {
    if (!selectedArticleId || stockQuantity <= 0) {
      toast.error("Veuillez sélectionner un article et entrer une quantité valide");
      return;
    }

    const stockItem = stocks.find(stock => stock.articleId === selectedArticleId);
    
    if (!stockItem || stockItem.available < stockQuantity) {
      toast.error("Stock insuffisant pour cette opération");
      return;
    }

    setStocks(prevStocks => 
      prevStocks.map(stock => 
        stock.articleId === selectedArticleId 
          ? { ...stock, available: stock.available - stockQuantity } 
          : stock
      )
    );

    toast.success(`Sortie de stock de ${stockQuantity} unités enregistrée`);
    setIsStockExitDialogOpen(false);
    setSelectedArticleId("");
    setStockQuantity(0);
  };

  // Formulaire de mouvement de stock
  const StockMovementForm = ({ isEntry = true }) => {
    return (
      <div className="grid gap-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="article">Article</Label>
          <Select value={selectedArticleId} onValueChange={setSelectedArticleId}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un article" />
            </SelectTrigger>
            <SelectContent>
              {stocks.map(stock => (
                <SelectItem key={stock.articleId} value={stock.articleId}>
                  {stock.articleCode} - {stock.articleName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantité</Label>
          <Input
            id="quantity"
            type="number"
            min={1}
            value={stockQuantity}
            onChange={(e) => setStockQuantity(Number(e.target.value))}
          />
        </div>
        
        {selectedArticleId && isEntry === false && (
          <div className="text-sm">
            Stock disponible: {stocks.find(stock => stock.articleId === selectedArticleId)?.available || 0} unités
          </div>
        )}
        
        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => isEntry ? setIsStockEntryDialogOpen(false) : setIsStockExitDialogOpen(false)}
          >
            Annuler
          </Button>
          <Button 
            type="button" 
            onClick={isEntry ? handleStockEntry : handleStockExit}
          >
            {isEntry ? "Enregistrer l'entrée" : "Enregistrer la sortie"}
          </Button>
        </DialogFooter>
      </div>
    );
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold">Gestion des Stocks</h1>
          <p className="text-muted-foreground">
            Suivez l'état des stocks et gérez les mouvements d'entrée et sortie
          </p>
        </div>

        {/* Résumé des stocks */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Total articles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stocks.length}</div>
              <p className="text-muted-foreground text-sm">Articles en stock</p>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Stock faible</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-500">
                {stocks.filter(stock => stock.available < 50).length}
              </div>
              <p className="text-muted-foreground text-sm">Articles à réapprovisionner</p>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Réceptions attendues</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-500">
                {stocks.filter(stock => stock.expected > 0).length}
              </div>
              <p className="text-muted-foreground text-sm">Articles en attente</p>
            </CardContent>
          </Card>
        </div>

        {/* Outils de recherche et boutons d'action */}
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
            <Dialog open={isStockEntryDialogOpen} onOpenChange={setIsStockEntryDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <ArrowDown className="h-4 w-4 mr-2" /> Entrée stock
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Entrée de stock</DialogTitle>
                  <DialogDescription>
                    Enregistrez une entrée de stock pour un article
                  </DialogDescription>
                </DialogHeader>
                <StockMovementForm isEntry={true} />
              </DialogContent>
            </Dialog>

            <Dialog open={isStockExitDialogOpen} onOpenChange={setIsStockExitDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <ArrowUp className="h-4 w-4 mr-2" /> Sortie stock
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Sortie de stock</DialogTitle>
                  <DialogDescription>
                    Enregistrez une sortie de stock pour un article
                  </DialogDescription>
                </DialogHeader>
                <StockMovementForm isEntry={false} />
              </DialogContent>
            </Dialog>

            <Button>
              <Plus className="h-4 w-4 mr-2" /> Commande
            </Button>
          </div>
        </div>

        {/* Tableau des stocks */}
        <div className="rounded-md border shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead className="text-right">Stock disponible</TableHead>
                <TableHead className="text-right">Stock réservé</TableHead>
                <TableHead className="text-right">Stock attendu</TableHead>
                <TableHead className="text-right">Stock total</TableHead>
                <TableHead className="text-center">État</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStocks.length > 0 ? (
                filteredStocks.map((stock) => {
                  const totalStock = stock.available + stock.reserved;
                  const stockStatus = stock.available < 30 ? "low" : stock.available < 100 ? "medium" : "good";
                  
                  return (
                    <TableRow key={stock.articleId}>
                      <TableCell className="font-medium">{stock.articleCode}</TableCell>
                      <TableCell>{stock.articleName}</TableCell>
                      <TableCell className="text-right">{stock.available}</TableCell>
                      <TableCell className="text-right">{stock.reserved}</TableCell>
                      <TableCell className="text-right">{stock.expected}</TableCell>
                      <TableCell className="text-right">{totalStock}</TableCell>
                      <TableCell className="text-center">
                        <span className={`inline-block rounded-full h-3 w-3 ${
                          stockStatus === "low" ? "bg-destructive" : 
                          stockStatus === "medium" ? "bg-orange-400" : "bg-green-500"
                        }`} />
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
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

export default StockPage;
