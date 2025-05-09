// src/pages/CBN.tsx
import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { calculateCBN, formatDataForChart } from "@/lib/gpao-utils";
import { Article, CBNCalculation, PlanningPeriod } from "@/lib/types";
import { toast } from "sonner";
import { Calculator, Download, Save } from "lucide-react";
import { CBNResultsTable } from "@/components/cbn/CBNResultsTable";
import { CBNChart } from "@/components/cbn/CBNChart";
import { articleService, cbnService } from "@/services/api";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useNavigate } from 'react-router-dom';

const CBNPage = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [periods, setPeriods] = useState<PlanningPeriod[]>([]);
  const [calculations, setCalculations] = useState<any[]>([]);
  const [showChart, setShowChart] = useState(true);
  const [initialStock, setInitialStock] = useState<number>(0);

  // Pagination states
  const [page, setPage] = useState(0);
  const [size] = useState(50); // nombre d'articles par page
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Chargement initial et progressif
  useEffect(() => {
    fetchArticles(0, true);
    // eslint-disable-next-line
  }, []);

  const fetchArticles = async (pageToLoad: number, initial = false) => {
    if (initial) {
      setLoading(true);
      setError(null);
    } else {
      setLoadingMore(true);
    }
    try {
      const response = await articleService.getAllArticles({ page: pageToLoad, size, sort: 'name,asc' });
      if (response.success && response.data) {
        const newArticles = response.data.list || [];
        setArticles(prev => initial ? newArticles : [...prev, ...newArticles]);
        setHasMore(newArticles.length === size);
        setPage(pageToLoad);
      } else {
        setError(response.error || 'Failed to fetch articles');
        setHasMore(false);
      }
    } catch (err: any) {
      setError('Failed to fetch articles');
      setHasMore(false);
    } finally {
      if (initial) setLoading(false);
      else setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    fetchArticles(page + 1);
  };

  const handleArticleSelect = (articleId: string) => {
    const article = articles.find(a => a.articleId.toString() === articleId);
    setSelectedArticle(article || null);
    setCalculations([]);
  };

  const handleAddPeriod = () => {
    const newPeriod: PlanningPeriod = {
      periodId: periods.length + 1,
      periodName: `Période ${periods.length + 1}`
    };
    setPeriods([...periods, newPeriod]);
  };

  const handleRemovePeriod = (index: number) => {
    setPeriods(periods.filter((_, i) => i !== index));
  };

  const [periodValues, setPeriodValues] = useState<{ [key: number]: { grossRequirements: number; scheduledReceipts: number } }>({});

  const handlePeriodValueChange = (index: number, field: 'grossRequirements' | 'scheduledReceipts', value: number) => {
    const periodId = periods[index].periodId;
    setPeriodValues(prev => ({
      ...prev,
      [periodId]: {
        ...prev[periodId],
        [field]: value
      }
    }));
  };

  const handleCalculate = () => {
    if (!selectedArticle) {
      toast.error("Veuillez sélectionner un article");
      return;
    }
    if (periods.length === 0) {
      toast.error("Veuillez ajouter au moins une période");
      return;
    }
    setLoading(true);
    try {
      const cbnPeriods = periods.map(period => ({
        periodId: period.periodId,
        periodName: period.periodName,
      }));
      // Build grossRequirements and scheduledReceipts as Record<number, number>
      const grossRequirements: Record<number, number> = {};
      const scheduledReceipts: Record<number, number> = {};
      periods.forEach(period => {
        grossRequirements[period.periodId] = periodValues[period.periodId]?.grossRequirements || 0;
        scheduledReceipts[period.periodId] = periodValues[period.periodId]?.scheduledReceipts || 0;
      });
      const results = calculateCBN(selectedArticle, cbnPeriods, initialStock, grossRequirements, scheduledReceipts);
      setCalculations(results.periods);
      toast.success("Calcul du CBN terminé");
    } catch (error) {
      console.error("Erreur lors du calcul du CBN:", error);
      toast.error("Échec du calcul du CBN");
    } finally {
      setLoading(false);
    }
  };

  const chartData = calculations.length > 0
    ? formatDataForChart({ articleId: selectedArticle?.articleId ?? 0, periods: calculations }, periods)
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  // Fonction pour rendre les lancements d'ordres planifiés avec décalage selon le délai d'obtention
  const renderPlannedOrderReleases = (periodIndex: number) => {
    if (!selectedArticle) return "-";
    
    const leadTime = selectedArticle.delaidoptention || 0;
    
    // Si on a besoin d'accéder à une période future qui n'existe pas encore dans le tableau
    if (periodIndex + leadTime >= calculations.length) {
      return "-";
    }
    
    // Retourne la valeur des lancements d'une période future (selon le délai d'obtention)
    return calculations[periodIndex + leadTime]?.plannedOrders || 0;
  };

  return (
    <div className="container mx-auto p-4">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Calcul des Besoins Nets (CBN)</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Sélection d'un article</CardTitle>
              <CardDescription>Sélectionnez un article pour calculer le CBN</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                <Label htmlFor="article">Article</Label>
                  <Select onValueChange={handleArticleSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un article" />
                  </SelectTrigger>
                  <SelectContent>
                      {articles.map(article => (
                        <SelectItem key={article.articleId} value={article.articleId.toString()}>
                          {article.name}
                      </SelectItem>
                    ))}
                      {hasMore && (
                        <div className="flex justify-center p-2">
                          <Button variant="outline" size="sm" onClick={handleLoadMore} disabled={loadingMore}>
                            {loadingMore ? 'Chargement...' : "Charger plus d'articles"}
                          </Button>
                        </div>
                      )}
                  </SelectContent>
                </Select>
                </div>
              </div>
            </CardContent>
          </Card>

              {selectedArticle && (
            <Card>
              <CardHeader>
                <CardTitle>Détails de l'article</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p><strong>Code :</strong> {selectedArticle.code_bare}</p>
                  <p><strong>Nom :</strong> {selectedArticle.name}</p>
                  <p><strong>Stock de sécurité :</strong> {selectedArticle.safetyStock}</p>
                  <p><strong>Délai d'obtention :</strong> {selectedArticle.delaidoptention} jours</p>
                  <p><strong>Taille de lot :</strong> {selectedArticle.lotSize}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <Card className="mt-6">
          <CardHeader>
            <h2 className="text-xl">Périodes</h2>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {periods.map((period, index) => (
                <div key={period.periodId} className="grid grid-cols-4 gap-4 items-end">
                  <div>
                    <Label>Période {index + 1}</Label>
                    <Input value={period.periodName} readOnly />
                  </div>
                  <div>
                    <Label>Besoins Bruts</Label>
                    <Input
                      type="number"
                      value={periodValues[period.periodId]?.grossRequirements || 0}
                      onChange={(e) => handlePeriodValueChange(index, 'grossRequirements', parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label>Réceptions Planifiées</Label>
                    <Input
                      type="number"
                      value={periodValues[period.periodId]?.scheduledReceipts || 0}
                      onChange={(e) => handlePeriodValueChange(index, 'scheduledReceipts', parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <Button variant="destructive" onClick={() => handleRemovePeriod(index)}>
                      Supprimer
                    </Button>
                  </div>
                </div>
              ))}
              <Button onClick={handleAddPeriod}>Ajouter une période</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <h2 className="text-xl">Paramètres</h2>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div>
                    <Label htmlFor="initialStock">Stock initial</Label>
                    <Input 
                      id="initialStock"
                      type="number"
                      value={initialStock}
                      onChange={(e) => setInitialStock(Number(e.target.value))}
                    />
                  </div>
                  </div>
          </CardContent>
        </Card>

        <div className="flex justify-end mb-6">
          <Button onClick={handleCalculate} disabled={loading || !selectedArticle || periods.length === 0}>
            {loading ? 'Calcul en cours...' : 'Calculer le CBN'}
                  </Button>
                </div>

        {calculations.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <h2 className="text-xl">Résultats du CBN</h2>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead>
                    <tr>
                      <th className="px-4 py-2">Période</th>
                      <th className="px-4 py-2">Besoins Bruts</th>
                      <th className="px-4 py-2">Réceptions Planifiées</th>
                      <th className="px-4 py-2">Stock Prévisionnel</th>
                      <th className="px-4 py-2">Ordres Planifiés</th>
                      <th className="px-4 py-2">Lancements d'Ordres Planifiés</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calculations.map((calc, index) => (
                      <tr key={index}>
                        <td className="border px-4 py-2">{calc.periodName}</td>
                        <td className="border px-4 py-2">{calc.grossRequirements}</td>
                        <td className="border px-4 py-2">{calc.scheduledReceipts}</td>
                        <td className="border px-4 py-2">{calc.projectedInventory}</td>
                        <td className="border px-4 py-2">{calc.plannedOrders}</td>
                        <td className="border px-4 py-2">{renderPlannedOrderReleases(index)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CBNPage;