import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { BarChart3, Package, ShoppingCart, TrendingUp, Truck } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar
} from "recharts";
import { articleService } from "@/services/api";
import { Article } from "@/lib/types";
import { toast } from "sonner";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const response = await articleService.getAllArticles({ page: 0, size: 100, sort: 'name,asc' });
      if (response.success && response.data) {
        setArticles(response.data.list || []);
      } else {
        setError(response.error || 'Erreur lors de la récupération des articles');
      }
    } catch (err: any) {
      setError('Erreur lors de la récupération des articles');
    } finally {
      setLoading(false);
    }
  };

  // Calcul des KPIs basés sur les données réelles
  const kpis = [
    {
      title: "Articles à commander",
      value: articles.filter(article => article.quantity < article.safetyStock).length,
      trend: "+2",
      icon: <ShoppingCart className="h-8 w-8 text-blue-500" />
    },
    {
      title: "Stock disponible",
      value: `€${articles.reduce((sum, article) => sum + (article.quantity * article.unitPrice), 0).toLocaleString()}`,
      trend: "+12.5%",
      icon: <Package className="h-8 w-8 text-green-500" />
    },
    {
      title: "Articles fabriqués",
      value: articles.filter(article => article.isArticleFabrique).length,
      trend: "-3",
      trendDown: true,
      icon: <Truck className="h-8 w-8 text-orange-500" />
    },
    {
      title: "Taux de service",
      value: "98.2%",
      trend: "+0.5%",
      icon: <TrendingUp className="h-8 w-8 text-indigo-500" />
    }
  ];

  // Préparation des données pour les graphiques
  const stockTrendData = articles.map(article => ({
    name: article.name,
    stock: article.quantity,
    safetyStock: article.safetyStock
  }));

  const productionData = articles
    .filter(article => article.isArticleFabrique)
    .map(article => ({
      product: article.name,
      planned: article.lotSize,
      actual: article.quantity
    }));

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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">Tableau de bord</h1>
        <p className="text-muted-foreground">
          Vue d'ensemble de votre système de production
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => (
          <Card key={index} className="shadow-sm">
            <CardContent className="p-6 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
                <h3 className="text-2xl font-bold mt-1">{kpi.value}</h3>
                <p className={`text-sm mt-1 ${kpi.trendDown ? 'text-destructive' : 'text-green-600'}`}>
                  {kpi.trend}
                </p>
              </div>
              {kpi.icon}
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="overview">Aperçu</TabsTrigger>
          <TabsTrigger value="analytics">Analyses</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          {/* Graphiques principaux */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">État des stocks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={stockTrendData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="stock" fill="#2563eb" name="Stock actuel" />
                      <Bar dataKey="safetyStock" fill="#f97316" name="Stock de sécurité" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Production</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={productionData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="product" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="planned" fill="#2563eb" name="Taille de lot" />
                      <Bar dataKey="actual" fill="#f97316" name="Stock actuel" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
