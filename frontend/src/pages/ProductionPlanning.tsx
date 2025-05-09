import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Play, ArrowRight, CheckCircle2, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import ApiClient from '@/lib/api-client';
import { kuziackMethod } from '@/lib/gpao-utils';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import VisNetwork from '@/components/VisNetwork';

interface MatrixResponse {
  matrix: number[][];
  products: Array<{ id: number; name: string }>;
  machines: Array<{ id: number; name: string }>;
}

interface Cell {
  step: number;
  products: Array<{ id: number; name: string; index: number }>;
  machines: Array<{ id: number; name: string; index: number }>;
  submatrix: number[][];
}

const ProductionPlanning: React.FC = () => {
  const [matrix, setMatrix] = useState<number[][]>([]);
  const [products, setProducts] = useState<Array<{ id: number; name: string }>>([]);
  const [machines, setMachines] = useState<Array<{ id: number; name: string }>>([]);
  const [cells, setCells] = useState<Cell[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('matrix');
  const [startIndex, setStartIndex] = useState(0);
  const [calculating, setCalculating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [rangsStats, setRangsStats] = useState<any>(null);
  const [rangsNiveaux, setRangsNiveaux] = useState<any>(null);
  const [gammesInput, setGammesInput] = useState<string>(`{
  "P1": {"M1": 1, "M3": 2, "M5": 3, "M6": 4},
  "P2": {"M2": 1, "M4": 2, "M5": 3, "M6": 4},
  "P3": {"M2": 1, "M3": 2, "M5": 3},
  "P4": {"M1": 1, "M2": 2, "M3": 3, "M7": 4},
  "P5": {"M1": 1, "M2": 2, "M4": 3, "M5": 4, "M7": 5},
  "P6": {"M1": 1, "M2": 2, "M5": 3, "M6": 4, "M7": 5}
}`);
  const [ilotGammes, setIlotGammes] = useState<any>(null);
  const [ilotStats, setIlotStats] = useState<any>(null);
  const [ilotNiveaux, setIlotNiveaux] = useState<any>(null);
  const [showIlotGraph, setShowIlotGraph] = useState(false);

  useEffect(() => { fetchMatrix(); }, []);

  const fetchMatrix = async () => {
    setLoading(true);
    try {
      const data = await ApiClient.get<MatrixResponse>('/production-planning/matrix');
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

  const runKuziack = async () => {
    setCalculating(true);
    setProgress(0);
    try {
      // Simuler une progression
      const interval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      // Utiliser l'implémentation TypeScript locale
      const cells = kuziackMethod(matrix, products, machines, startIndex);
      setCells(cells);
      setActiveTab('kuziack');
      
      clearInterval(interval);
      setProgress(100);
      toast.success('Algorithme Kuziack exécuté avec succès');
    } catch (e) {
      setError('Erreur lors de l\'exécution de l\'algorithme de Kuziack');
      toast.error('Erreur lors de l\'exécution de l\'algorithme de Kuziack');
    } finally {
      setCalculating(false);
    }
  };

  const runRangsMoyens = async () => {
    setCalculating(true);
    setProgress(0);
    try {
      const interval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);
      const gammes = JSON.parse(gammesInput);
      const data = await ApiClient.post<any>('/production-planning/rangs-moyens', gammes);
      setRangsStats(data.stats);
      setRangsNiveaux(data.niveaux);
      setActiveTab('rangs');
      clearInterval(interval);
      setProgress(100);
      toast.success('Rangs moyens calculés avec succès');
    } catch (e) {
      setError('Erreur lors du calcul des rangs moyens');
      toast.error('Erreur lors du calcul des rangs moyens');
    } finally {
      setCalculating(false);
    }
  };

  // Extraire le mapping gammes pour un îlot Kuziack
  const extractGammesFromIlot = (cell: Cell) => {
    // Pour chaque produit, on prend la séquence des machines (rang = index+1)
    const gammes: Record<string, Record<string, number>> = {};
    cell.products.forEach((p, pi) => {
      const ops: Record<string, number> = {};
      cell.machines.forEach((m, mi) => {
        if (cell.submatrix[pi][mi] > 0) {
          ops[m.name] = mi + 1; // Rang = index+1 dans la séquence
        }
      });
      gammes[p.name] = ops;
    });
    return gammes;
  };

  // Calculer les rangs moyens pour un îlot
  const runRangsMoyensIlot = async (cell: Cell) => {
    setCalculating(true);
    setProgress(0);
    try {
      const interval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);
      const gammes = extractGammesFromIlot(cell);
      setIlotGammes(gammes);
      const data = await ApiClient.post<any>('/production-planning/rangs-moyens', gammes);
      setIlotStats(data.stats);
      setIlotNiveaux(data.niveaux);
      setShowIlotGraph(true);
      setActiveTab('rangs');
      clearInterval(interval);
      setProgress(100);
      toast.success('Rangs moyens pour l\'îlot calculés avec succès');
    } catch (e) {
      setError('Erreur lors du calcul des rangs moyens pour l\'îlot');
      toast.error('Erreur lors du calcul des rangs moyens pour l\'îlot');
    } finally {
      setCalculating(false);
    }
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
        <h1 className="text-3xl font-bold tracking-tight">Planification de Production</h1>
        <div className="space-x-2">
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              value={startIndex}
              onChange={(e) => setStartIndex(parseInt(e.target.value))}
              className="w-20 px-2 py-1 border rounded"
              placeholder="Index départ"
            />
            <Button 
              onClick={runKuziack} 
              disabled={calculating}
              variant="outline" 
              className="bg-blue-50 hover:bg-blue-100"
            >
              <Play className="h-4 w-4 mr-2" />
              Exécuter Kuziack
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {calculating && (
        <div className="space-y-2">
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-muted-foreground text-center">
            Calcul en cours... {progress}%
          </p>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="matrix">Matrice</TabsTrigger>
          <TabsTrigger value="kuziack">Kuziack</TabsTrigger>
          <TabsTrigger value="rangs">Rangs Moyens</TabsTrigger>
        </TabsList>

        <TabsContent value="matrix">
          <Card>
            <CardHeader>
              <CardTitle>Matrice d'assignation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="border p-2 text-left font-semibold">Article \ Machine</th>
                      {machines.map((m, i) => (
                        <th key={i} className="border p-2 text-center font-semibold">{m.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {matrix.map((row, i) => (
                      <tr key={i} className="hover:bg-muted/50">
                        <td className="border p-2 font-medium">{products[i].name}</td>
                        {row.map((cell, j) => (
                          <td key={j} className="border p-2 text-center">
                            {cell > 0 ? (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary">
                                {cell}
                              </span>
                            ) : ''}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kuziack">
          <Card>
            <CardHeader>
              <CardTitle>Résultats de l'algorithme de Kuziack</CardTitle>
            </CardHeader>
            <CardContent>
              {cells.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {cells.map((cell, idx) => (
                    <Card key={idx} className="bg-muted/50">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">Îlot {cell.step}</CardTitle>
                          <Badge variant="secondary">
                            {cell.products.length} produits
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground">Produits</h4>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {cell.products.map(p => (
                                <Badge key={p.id} variant="outline">
                                  {p.name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground">Machines</h4>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {cell.machines.map(m => (
                                <Badge key={m.id} variant="outline">
                                  {m.name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground">Sous-matrice</h4>
                            <div className="overflow-x-auto mt-2">
                              <table className="w-full border-collapse">
                                <tbody>
                                  {cell.submatrix.map((row, i) => (
                                    <tr key={i}>
                                      {row.map((cell, j) => (
                                        <td key={j} className="border p-1 text-center">
                                          {cell > 0 ? (
                                            <CheckCircle2 className="h-4 w-4 text-primary mx-auto" />
                                          ) : (
                                            <XCircle className="h-4 w-4 text-muted-foreground mx-auto" />
                                          )}
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                          <div className="mt-2">
                            <Button size="sm" onClick={() => runRangsMoyensIlot(cell)}>
                              Rangs moyens pour cet îlot
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Exécutez l'algorithme de Kuziack pour voir les résultats</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rangs">
          <Card>
            <CardHeader>
              <CardTitle>Méthode des rangs moyens</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Résultats pour un îlot sélectionné */}
              {ilotStats && ilotNiveaux && (
                <div className="mb-8">
                  <h4 className="font-medium mb-2">(Îlot sélectionné depuis Kuziack)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-2">Statistiques par machine</h4>
                      <table className="min-w-full border">
                        <thead>
                          <tr>
                            <th className="border p-2">Machine</th>
                            <th className="border p-2">Total</th>
                            <th className="border p-2">Count</th>
                            <th className="border p-2">Rang moyen</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(ilotStats).map(([m, s]: any) => (
                            <tr key={m}>
                              <td className="border p-2">{m}</td>
                              <td className="border p-2">{s.total}</td>
                              <td className="border p-2">{s.count}</td>
                              <td className="border p-2">{s.moyen}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Groupes par rang moyen</h4>
                      <table className="min-w-full border">
                        <thead>
                          <tr>
                            <th className="border p-2">Rang moyen</th>
                            <th className="border p-2">Machines</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(ilotNiveaux).map(([moyen, machines]: any) => (
                            <tr key={moyen}>
                              <td className="border p-2">{moyen}</td>
                              <td className="border p-2">{(machines as string[]).join(', ')}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  {/* Graphe visuel (à venir) */}
                  {showIlotGraph && ilotGammes && (
                    <div className="mt-8">
                      <h4 className="font-medium mb-2">Visualisation graphique</h4>
                      <VisNetwork gammes={ilotGammes} niveaux={ilotNiveaux} />
                    </div>
                  )}
                </div>
              )}
              <div className="mb-4">
                <Textarea
                  value={gammesInput}
                  onChange={e => setGammesInput(e.target.value)}
                  rows={8}
                  className="w-full font-mono"
                />
                <Button onClick={runRangsMoyens} className="mt-2" disabled={calculating}>
                  Calculer les rangs moyens
                </Button>
              </div>
              {rangsStats && rangsNiveaux && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Statistiques par machine</h4>
                    <table className="min-w-full border">
                      <thead>
                        <tr>
                          <th className="border p-2">Machine</th>
                          <th className="border p-2">Total</th>
                          <th className="border p-2">Count</th>
                          <th className="border p-2">Rang moyen</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(rangsStats).map(([m, s]: any) => (
                          <tr key={m}>
                            <td className="border p-2">{m}</td>
                            <td className="border p-2">{s.total}</td>
                            <td className="border p-2">{s.count}</td>
                            <td className="border p-2">{s.moyen}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Groupes par rang moyen</h4>
                    <table className="min-w-full border">
                      <thead>
                        <tr>
                          <th className="border p-2">Rang moyen</th>
                          <th className="border p-2">Machines</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(rangsNiveaux).map(([moyen, machines]: any) => (
                          <tr key={moyen}>
                            <td className="border p-2">{moyen}</td>
                            <td className="border p-2">{(machines as string[]).join(', ')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductionPlanning;