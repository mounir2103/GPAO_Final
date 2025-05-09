import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Save, RefreshCw, Check, X } from 'lucide-react';
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
    newMatrix[productIndex][machineIndex] = newMatrix[productIndex][machineIndex] === 1 ? 0 : 1;
    setMatrix(newMatrix);
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
    return matrix[productIndex]?.filter(val => val === 1).length || 0;
  };

  const getMachineProductCount = (machineIndex: number) => {
    return matrix.reduce((count, row) => count + (row[machineIndex] === 1 ? 1 : 0), 0);
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
        <Card className="lg:col-span-1">
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
                {machines.map((machine, j) => (
                  <TooltipProvider key={j}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            matrix[selectedProduct][j] === 1
                              ? 'border-primary bg-primary/10'
                              : 'border-muted hover:border-primary/50'
                          }`}
                          onClick={() => toggleAssignment(selectedProduct, j)}
                        >
                          <div className="flex flex-col items-center space-y-2">
                            {matrix[selectedProduct][j] === 1 ? (
                              <Check className="h-6 w-6 text-primary" />
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
                        <p>Cliquez pour {matrix[selectedProduct][j] === 1 ? 'retirer' : 'assigner'} cette machine</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
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