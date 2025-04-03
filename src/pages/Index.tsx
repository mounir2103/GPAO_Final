
import { useState } from "react";
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
import Layout from "@/components/layout/Layout";

// Données fictives pour la démo
const stockTrendData = [
  { month: 'Jan', stock: 65, consumption: 45 },
  { month: 'Fév', stock: 59, consumption: 49 },
  { month: 'Mar', stock: 80, consumption: 58 },
  { month: 'Avr', stock: 81, consumption: 56 },
  { month: 'Mai', stock: 56, consumption: 60 },
  { month: 'Juin', stock: 55, consumption: 50 },
  { month: 'Juil', stock: 40, consumption: 45 },
];

const productionData = [
  { product: 'Produit A', planned: 100, actual: 85 },
  { product: 'Produit B', planned: 80, actual: 75 },
  { product: 'Produit C', planned: 50, actual: 52 },
  { product: 'Produit D', planned: 70, actual: 68 },
  { product: 'Produit E', planned: 45, actual: 40 },
];

// Données pour les KPIs
const kpis = [
  {
    title: "Articles à commander",
    value: 12,
    trend: "+2",
    icon: <ShoppingCart className="h-8 w-8 text-blue-500" />
  },
  {
    title: "Stock disponible",
    value: "€54,382",
    trend: "+12.5%",
    icon: <Package className="h-8 w-8 text-green-500" />
  },
  {
    title: "Ordres de fabrication",
    value: 24,
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

// Notifications et alertes
const alerts = [
  { id: 1, type: "warning", message: "Stock bas pour l'article A123" },
  { id: 2, type: "info", message: "Commande fournisseur F234 reçue" },
  { id: 3, type: "error", message: "Retard de production sur commande C456" },
  { id: 4, type: "success", message: "Objectifs de production atteints pour Mai" }
];

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  
  return (
    <Layout>
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

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="overview">Aperçu</TabsTrigger>
            <TabsTrigger value="analytics">Analyses</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            {/* Graphiques principaux */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="lg:col-span-2 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Évolution du stock</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={stockTrendData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="stock" 
                          stroke="#2563eb" 
                          activeDot={{ r: 8 }} 
                        />
                        <Line 
                          type="monotone" 
                          dataKey="consumption" 
                          stroke="#f97316" 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Alertes et notifications */}
              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Alertes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {alerts.map((alert) => (
                      <div 
                        key={alert.id} 
                        className={`p-3 rounded-md text-sm ${
                          alert.type === "warning" ? "bg-yellow-50 text-yellow-700 border-l-4 border-yellow-400" :
                          alert.type === "error" ? "bg-red-50 text-red-700 border-l-4 border-red-400" :
                          alert.type === "success" ? "bg-green-50 text-green-700 border-l-4 border-green-400" :
                          "bg-blue-50 text-blue-700 border-l-4 border-blue-400"
                        }`}
                      >
                        {alert.message}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Actions rapides */}
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Actions rapides</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Button>Nouvel ordre de fabrication</Button>
                  <Button variant="outline">Créer un article</Button>
                  <Button variant="outline">Entrée de stock</Button>
                  <Button variant="outline">Calcul CBN</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 gap-4">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Performance de production</CardTitle>
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
                        <Bar dataKey="planned" fill="#2563eb" name="Planifié" />
                        <Bar dataKey="actual" fill="#f97316" name="Réalisé" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Dashboard;
