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
import { Search, Plus, ArrowDown, ArrowUp } from "lucide-react";

const mockStocks: Stock[] = [
  {
    id: 1,
    articleId: 1,
    articleName: "Vis M6",
    articleCode: "VIS-M6",
    quantity: 120,
    minQuantity: 50,
    maxQuantity: 200,
    lastUpdated: "2024-06-01",
    location: "A1"
  },
  {
    id: 2,
    articleId: 2,
    articleName: "Plaque acier",
    articleCode: "PLAQUE-ACIER",
    quantity: 30,
    minQuantity: 20,
    maxQuantity: 100,
    lastUpdated: "2024-06-01",
    location: "B2"
  }
];

const StockPage = () => {
  const [stocks, setStocks] = useState<Stock[]>(mockStocks);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isStockEntryDialogOpen, setIsStockEntryDialogOpen] = useState<boolean>(false);
  const [isStockExitDialogOpen, setIsStockExitDialogOpen] = useState<boolean>(false);
  const [selectedArticleId, setSelectedArticleId] = useState<number | null>(null);
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
    setStocks(prev => prev.map(stock =>
      stock.articleId === selectedArticleId
        ? { ...stock, quantity: stock.quantity + stockQuantity }
        : stock
    ));
    toast.success(`Entrée de stock de ${stockQuantity} unités enregistrée`);
    setIsStockEntryDialogOpen(false);
    setSelectedArticleId(null);
    setStockQuantity(0);
  };

  // Fonction pour sortir du stock
  const handleStockExit = () => {
    if (!selectedArticleId || stockQuantity <= 0) {
      toast.error("Veuillez sélectionner un article et entrer une quantité valide");
      return;
    }
    setStocks(prev => prev.map(stock =>
      stock.articleId === selectedArticleId
        ? { ...stock, quantity: Math.max(0, stock.quantity - stockQuantity) }
        : stock
    ));
    toast.success(`Sortie de stock de ${stockQuantity} unités enregistrée`);
    setIsStockExitDialogOpen(false);
    setSelectedArticleId(null);
    setStockQuantity(0);
  };

  // Formulaire de mouvement de stock
  const StockMovementForm = ({ isEntry = true }) => {
    return (
      <div className="grid gap-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="article">Article</Label>
          <Select 
            value={selectedArticleId?.toString() || ""} 
            onValueChange={(value) => setSelectedArticleId(parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un article" />
            </SelectTrigger>
            <SelectContent>
              {stocks.map(stock => (
                <SelectItem key={stock.articleId} value={stock.articleId.toString()}>
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
            Stock disponible: {stocks.find(stock => stock.articleId === selectedArticleId)?.quantity || 0} unités
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

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      </Layout>
    );
  }

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
                {stocks.filter(stock => stock.quantity < stock.minQuantity).length}
              </div>
              <p className="text-muted-foreground text-sm">Articles à réapprovisionner</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Stock optimal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">
                {stocks.filter(stock => stock.quantity >= stock.minQuantity && stock.quantity <= stock.maxQuantity).length}
              </div>
              <p className="text-muted-foreground text-sm">Articles bien approvisionnés</p>
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
                <TableHead className="text-right">Stock minimum</TableHead>
                <TableHead className="text-right">Stock maximum</TableHead>
                <TableHead>Emplacement</TableHead>
                <TableHead className="text-center">État</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStocks.length > 0 ? (
                filteredStocks.map((stock) => {
                  const stockStatus = 
                    stock.quantity < stock.minQuantity ? "low" :
                    stock.quantity > stock.maxQuantity ? "high" : "good";
                  return (
                    <TableRow key={stock.id}>
                      <TableCell className="font-medium">{stock.articleCode}</TableCell>
                      <TableCell>{stock.articleName}</TableCell>
                      <TableCell className="text-right">{stock.quantity}</TableCell>
                      <TableCell className="text-right">{stock.minQuantity}</TableCell>
                      <TableCell className="text-right">{stock.maxQuantity}</TableCell>
                      <TableCell>{stock.location}</TableCell>
                      <TableCell className="text-center">
                        <span className={`inline-block rounded-full h-3 w-3 ${
                          stockStatus === "low" ? "bg-destructive" : 
                          stockStatus === "high" ? "bg-orange-400" : "bg-green-500"
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
