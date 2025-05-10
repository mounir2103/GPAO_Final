import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Save, RefreshCw, Check, X, ArrowUp, ArrowDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import ApiClient from '@/lib/api-client';
import { toast } from 'sonner';

interface Article {
  id: number;
  name: string;
}

interface Machine {
  id: number;
  name: string;
}

interface AssignmentMatrix {
  matrix: number[][];
  products: Article[];
  machines: Machine[];
}

const MachineAssignment: React.FC = () => {
  const [matrix, setMatrix] = useState<number[][]>([]);
  const [products, setProducts] = useState<Article[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [machineOrder, setMachineOrder] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchMatrix();
  }, []);

  const fetchMatrix = async () => {
    setLoading(true);
    try {
      const data = await ApiClient.get<AssignmentMatrix>('/production-planning/matrix');
      setMatrix(data.matrix);
      setProducts(data.products);
      setMachines(data.machines);
      
      // Initialize machine order from matrix values
      const initialOrder: Record<string, number> = {};
      data.matrix.forEach((row, i) => {
        row.forEach((value, j) => {
          if (value > 0) {
            initialOrder[`${i}-${j}`] = value;
          }
        });
      });
      setMachineOrder(initialOrder);
      
      setError(null);
    } catch (e) {
      setError('Erreur lors du chargement de la matrice');
      toast.error('Erreur lors du chargement de la matrice');
    } finally {
      setLoading(false);
    }
  };

  const toggleAssignment = (productIndex: number, machineIndex: number) => {
    const newMatrix = matrix.map(row => [...row]);
    const key = `${productIndex}-${machineIndex}`;
    // Liste des ordres pour ce produit
    const productOrders = machines.map((_, j) => newMatrix[productIndex][j]).filter(val => val > 0);
    if (newMatrix[productIndex][machineIndex] === 0) {
      // Assigner une nouvelle machine : ordre = max+1 pour ce produit
      const maxOrder = productOrders.length > 0 ? Math.max(...productOrders) : 0;
      newMatrix[productIndex][machineIndex] = maxOrder + 1;
    } else {
      // Désassigner la machine : mettre à 0 puis réindexer les ordres pour ce produit
      newMatrix[productIndex][machineIndex] = 0;
      // Récupérer les indices des machines assignées pour ce produit
      const assigned = machines
        .map((_, j) => ({ j, order: newMatrix[productIndex][j] }))
        .filter(x => x.order > 0)
        .sort((a, b) => a.order - b.order);
      // Réindexer les ordres (1,2,3...)
      assigned.forEach((x, idx) => {
        newMatrix[productIndex][x.j] = idx + 1;
      });
    }
    // Mettre à jour le state
    setMatrix(newMatrix);
    // Recalculer machineOrder pour l'affichage
    const newOrder: Record<string, number> = {};
    newMatrix.forEach((row, i) => {
      row.forEach((val, j) => {
        if (val > 0) newOrder[`${i}-${j}`] = val;
      });
    });
    setMachineOrder(newOrder);
  };

  const updateMachineOrder = (productIndex: number, machineIndex: number, direction: 'up' | 'down') => {
    const key = `${productIndex}-${machineIndex}`;
    const currentOrder = machineOrder[key];
    if (!currentOrder) return;

    const newMatrix = matrix.map(row => [...row]);
    const newOrder = { ...machineOrder };

    // Find the machine to swap with
    const swapKey = Object.entries(machineOrder).find(([k, order]) => {
      const [p, m] = k.split('-').map(Number);
      return p === productIndex && order === (direction === 'up' ? currentOrder - 1 : currentOrder + 1);
    })?.[0];

    if (swapKey) {
      const [swapP, swapM] = swapKey.split('-').map(Number);
      // Swap orders
      newOrder[key] = machineOrder[swapKey];
      newOrder[swapKey] = currentOrder;
      
      // Update matrix
      newMatrix[productIndex][machineIndex] = machineOrder[swapKey];
      newMatrix[swapP][swapM] = currentOrder;
      
      setMatrix(newMatrix);
      setMachineOrder(newOrder);
    }
  };

  const saveAssignments = async () => {
    setSaving(true);
    try {
      await ApiClient.post('/production-planning/matrix', {
        matrix,
        products,
        machines
      });
      toast.success('Assignations sauvegardées avec succès');
    } catch (e) {
      setError('Erreur lors de la sauvegarde des assignations');
      toast.error('Erreur lors de la sauvegarde des assignations');
    } finally {
      setSaving(false);
    }
  };

  const getProductMachineCount = (productIndex: number) => {
    return matrix[productIndex]?.filter(val => val > 0).length || 0;
  };

  const getMachineProductCount = (machineIndex: number) => {
    return matrix.reduce((count, row) => count + (row[machineIndex] > 0 ? 1 : 0), 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Assignation Machines-Articles</h1>
        <div className="space-x-2">
          <Button 
            onClick={fetchMatrix} 
            variant="outline" 
            className="bg-gray-50 hover:bg-gray-100"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Button 
            onClick={saveAssignments} 
            disabled={saving}
            className="bg-primary hover:bg-primary/90"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Liste des produits */}
        <Card>
          <CardHeader>
            <CardTitle>Articles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {products.map((product, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedProduct === i 
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => setSelectedProduct(i)}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{product.name}</span>
                    <Badge variant="secondary">
                      {getProductMachineCount(i)} machines
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Matrice d'assignation */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>
              {selectedProduct !== null 
                ? `Assignation des machines pour ${products[selectedProduct].name}`
                : 'Sélectionnez un article pour assigner des machines'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedProduct !== null ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {machines.map((machine, j) => {
                  const isAssigned = matrix[selectedProduct][j] > 0;
                  const order = machineOrder[`${selectedProduct}-${j}`];
                  return (
                    <TooltipProvider key={j}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                              isAssigned
                                ? 'border-primary bg-primary/10'
                                : 'border-muted hover:border-primary/50'
                            }`}
                            onClick={() => toggleAssignment(selectedProduct, j)}
                          >
                            <div className="flex flex-col items-center space-y-2">
                              {isAssigned ? (
                                <>
                                  <div className="flex items-center space-x-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        updateMachineOrder(selectedProduct, j, 'up');
                                      }}
                                      disabled={order === 1}
                                    >
                                      <ArrowUp className="h-4 w-4" />
                                    </Button>
                                    <span className="font-bold text-lg">{order}</span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        updateMachineOrder(selectedProduct, j, 'down');
                                      }}
                                      disabled={order === getProductMachineCount(selectedProduct)}
                                    >
                                      <ArrowDown className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  <Check className="h-6 w-6 text-primary" />
                                </>
                              ) : (
                                <X className="h-6 w-6 text-muted-foreground" />
                              )}
                              <span className="font-medium text-center">{machine.name}</span>
                              <Badge variant="secondary">
                                {getMachineProductCount(j)} articles
                              </Badge>
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Cliquez pour {isAssigned ? 'retirer' : 'assigner'} cette machine</p>
                          {isAssigned && (
                            <p>Utilisez les flèches pour modifier l'ordre</p>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                })}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                Sélectionnez un article dans la liste pour commencer l'assignation des machines
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MachineAssignment; 