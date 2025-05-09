import { useState, useEffect } from "react";
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
import { Stock, StockTransaction, Article } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Search, Plus, ArrowDown, ArrowUp } from "lucide-react";
import { stockService, orderService, articleService } from "@/services/api";

const StockPage = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isStockEntryDialogOpen, setIsStockEntryDialogOpen] = useState<boolean>(false);
  const [isStockExitDialogOpen, setIsStockExitDialogOpen] = useState<boolean>(false);
  const [selectedArticleId, setSelectedArticleId] = useState<number | null>(null);
  const [stockQuantity, setStockQuantity] = useState<number>(0);

  // State for edit and history dialogs
  const [editStock, setEditStock] = useState<Stock | null>(null);
  const [historyStock, setHistoryStock] = useState<Stock | null>(null);
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [orderArticle, setOrderArticle] = useState<Stock | null>(null);
  const [orderArticleDetails, setOrderArticleDetails] = useState<Article | null>(null);
  const [orderQuantity, setOrderQuantity] = useState<number>(1);
  const [orderDialogLoading, setOrderDialogLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    fetchStocks();
  }, []);

  const fetchStocks = async () => {
    setLoading(true);
    try {
      const response = await stockService.getAllStocks();
      setStocks(response.success && response.data ? response.data : []);
      setAuthError(null);
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les articles
  const filteredStocks = stocks.filter(stock => {
    return stock.articleCode?.toLowerCase().includes(searchQuery.toLowerCase()) || 
           stock.articleName?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  console.log('stocks:', stocks);
  console.log('filteredStocks:', filteredStocks);

  // Improved error handling for authentication
  const handleApiError = (error: any) => {
    if (error?.response?.status === 401) {
      setAuthError("Votre session a expiré ou vous n'êtes pas authentifié. Veuillez vous reconnecter.");
    } else {
      toast.error(error?.message || "Erreur inconnue");
    }
  };

  // Fonction pour ajouter du stock
  const handleStockEntry = async () => {
    if (!selectedArticleId || stockQuantity <= 0) {
      toast.error("Veuillez sélectionner un article et entrer une quantité valide");
      return;
    }
    try {
      await stockService.adjustStock(selectedArticleId, stockQuantity);
      toast.success(`Entrée de stock de ${stockQuantity} unités enregistrée`);
      fetchStocks();
      setAuthError(null);
    } catch (error) {
      handleApiError(error);
    }
    setIsStockEntryDialogOpen(false);
    setSelectedArticleId(null);
    setStockQuantity(0);
  };

  // Fonction pour sortir du stock
  const handleStockExit = async () => {
    if (!selectedArticleId || stockQuantity <= 0) {
      toast.error("Veuillez sélectionner un article et entrer une quantité valide");
      return;
    }
    try {
      await stockService.adjustStock(selectedArticleId, -stockQuantity);
      toast.success(`Sortie de stock de ${stockQuantity} unités enregistrée`);
      fetchStocks();
      setAuthError(null);
    } catch (error) {
      handleApiError(error);
    }
    setIsStockExitDialogOpen(false);
    setSelectedArticleId(null);
    setStockQuantity(0);
  };

  // Edit stock handler
  const handleEditStock = async (stock: Stock) => {
    setEditStock(stock);
  };
  const handleSaveEditStock = async (updated: Partial<Stock>) => {
    if (!editStock) return;
    try {
      await stockService.updateStock(editStock.articleId, updated);
      toast.success("Stock mis à jour");
      setEditStock(null);
      fetchStocks();
    } catch (error) {
      toast.error("Erreur lors de la mise à jour du stock");
    }
  };

  // History handler
  const handleShowHistory = async (stock: Stock) => {
    setHistoryStock(stock);
    setLoadingTransactions(true);
    const response = await stockService.getStockTransactions(stock.articleId);
    setTransactions(response.success && response.data ? response.data : []);
    setLoadingTransactions(false);
  };
  const handleCloseHistory = () => {
    setHistoryStock(null);
    setTransactions([]);
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

  // Commande (Order) logic
  const handleOpenOrderDialog = async (stock: Stock | null) => {
    if (!stock) {
      toast.error("Veuillez sélectionner un article pour commander.");
      return;
    }
    setOrderArticle(stock);
    setOrderDialogLoading(true);
    // Fetch the Article details for lotSize and delaidoptention
    const res = await articleService.getArticleByName(stock.articleName);
    if (res.success && res.data) {
      setOrderArticleDetails(res.data);
      setOrderQuantity(res.data.lotSize || 1);
    } else {
      setOrderArticleDetails(null);
      setOrderQuantity(1);
    }
    setOrderDialogOpen(true);
    setOrderDialogLoading(false);
  };
  const handleCreateOrder = async () => {
    if (!orderArticle || !orderArticleDetails || orderQuantity <= 0) return;
    try {
      await orderService.createSupplierOrder({
        articleId: orderArticle.articleId,
        quantity: orderQuantity,
        expectedDate: new Date(Date.now() + (orderArticleDetails.delaidoptention || 0) * 24 * 60 * 60 * 1000),
      });
      toast.success("Commande créée avec succès");
      setOrderDialogOpen(false);
      setOrderArticle(null);
      setOrderArticleDetails(null);
      setOrderQuantity(orderArticleDetails.lotSize || 1);
      setAuthError(null);
      fetchStocks();
    } catch (error) {
      handleApiError(error);
    }
  };

  if (loading) {
    console.log('Loading...');
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500 text-lg">{authError}</div>
      </div>
    );
  }

  console.log('Rendering stock page UI');

  return (
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
              {stocks.filter(stock => stock.quantity >= stock.minQuantity).length}
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
          <div className="flex gap-2 items-center">
            <Button 
              onClick={() => handleOpenOrderDialog(stocks.find(stock => stock.articleId === selectedArticleId) || null)}
              disabled={!selectedArticleId}
            >
              <Plus className="h-4 w-4 mr-2" /> Commande
            </Button>
            {selectedArticleId && (
              <span className="text-sm text-muted-foreground">Article sélectionné : {stocks.find(s => s.articleId === selectedArticleId)?.articleName}</span>
            )}
          </div>
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
              <TableHead>Emplacement</TableHead>
              <TableHead className="text-center">État</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStocks.length > 0 ? (
              filteredStocks.map((stock) => {
                const stockStatus = 
                  stock.quantity < stock.minQuantity ? "low" : "good";
                return (
                  <TableRow
                    key={stock.id}
                    className={selectedArticleId === stock.articleId ? "bg-blue-100" : ""}
                    onClick={() => setSelectedArticleId(stock.articleId)}
                    style={{ cursor: "pointer" }}
                  >
                    <TableCell className="font-medium">{stock.articleCode}</TableCell>
                    <TableCell>{stock.articleName}</TableCell>
                    <TableCell className="text-right">{stock.quantity}</TableCell>
                    <TableCell className="text-right">{stock.minQuantity}</TableCell>
                    <TableCell>{stock.location}</TableCell>
                    <TableCell className="text-center">
                      <span className={`inline-block rounded-full h-3 w-3 ${
                        stockStatus === "low" ? "bg-destructive" : "bg-green-500"
                      }`} />
                    </TableCell>
                    <TableCell className="text-center">
                      <Button size="sm" variant="outline" onClick={e => { e.stopPropagation(); handleEditStock(stock); }}>Éditer</Button>
                      <Button size="sm" variant="outline" className="ml-2" onClick={e => { e.stopPropagation(); handleShowHistory(stock); }}>Historique</Button>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Aucun article trouvé
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {/* Edit Dialog */}
      {editStock && (
        <Dialog open={!!editStock} onOpenChange={() => setEditStock(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Éditer le stock</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              <Label>Stock minimum</Label>
              <Input
                type="number"
                value={editStock.minQuantity}
                onChange={e => setEditStock({ ...editStock, minQuantity: Number(e.target.value) })}
              />
              <Label>Emplacement</Label>
              <Input
                value={editStock.location}
                onChange={e => setEditStock({ ...editStock, location: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditStock(null)}>Annuler</Button>
              <Button onClick={() => handleSaveEditStock({
                minQuantity: editStock.minQuantity,
                location: editStock.location
              })}>Enregistrer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      {/* History Dialog */}
      {historyStock && (
        <Dialog open={!!historyStock} onOpenChange={handleCloseHistory}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Historique des mouvements pour {historyStock.articleName}</DialogTitle>
            </DialogHeader>
            {loadingTransactions ? (
              <div>Chargement...</div>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Quantité</TableHead>
                      <TableHead>Utilisateur</TableHead>
                      <TableHead>Note</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.length > 0 ? transactions.map(tx => (
                      <TableRow key={tx.id}>
                        <TableCell>{new Date(tx.timestamp).toLocaleString()}</TableCell>
                        <TableCell>{tx.type === "ENTRY" ? "Entrée" : "Sortie"}</TableCell>
                        <TableCell>{tx.quantityChange}</TableCell>
                        <TableCell>{tx.user}</TableCell>
                        <TableCell>{tx.note}</TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">Aucun mouvement</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={handleCloseHistory}>Fermer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      {/* Commande Dialog */}
      {orderDialogOpen && orderArticle && (
        <Dialog open={orderDialogOpen} onOpenChange={setOrderDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Créer une commande pour {orderArticle.articleName}</DialogTitle>
            </DialogHeader>
            {orderDialogLoading ? (
              <div>Chargement...</div>
            ) : (
              <div className="space-y-2">
                <Label>Quantité</Label>
                <Input
                  type="number"
                  min={1}
                  value={orderQuantity}
                  onChange={e => setOrderQuantity(Number(e.target.value))}
                />
                <div className="text-sm text-muted-foreground">
                  Date d'obtention estimée : {orderArticleDetails ? new Date(Date.now() + (orderArticleDetails.delaidoptention || 0) * 24 * 60 * 60 * 1000).toLocaleDateString() : '-'}
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setOrderDialogOpen(false)}>Annuler</Button>
              <Button onClick={handleCreateOrder} disabled={orderDialogLoading}>Commander</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default StockPage;
