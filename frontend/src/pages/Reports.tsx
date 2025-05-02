import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Calendar } from 'lucide-react';
import { Article } from "@/lib/types";
import { toast } from "sonner";

const colors = ["#3498db", "#9b59b6", "#2ecc71", "#f1c40f", "#e74c3c"];

const mockArticles: Article[] = [
  {
    articleId: 1,
    code_bare: "VIS-M6",
    name: "Vis M6",
    articleDescription: "Vis standard M6",
    unitPrice: 0.10,
    TVA: 20,
    Fournisseur: "BricoPro",
    delaidoptention: 3,
    status: "RAW_MATERIAL",
    isArticleFabrique: false,
    isArticleAchte: true,
    safetyStock: 50,
    bomEntries: [],
    stockSecurity: 50,
    leadTime: 3,
    lotSize: 100,
    quantity: 120
  },
  {
    articleId: 2,
    code_bare: "PLAQUE-ACIER",
    name: "Plaque acier",
    articleDescription: "Plaque d'acier 2mm",
    unitPrice: 15,
    TVA: 20,
    Fournisseur: "AcierPlus",
    delaidoptention: 7,
    status: "RAW_MATERIAL",
    isArticleFabrique: false,
    isArticleAchte: true,
    safetyStock: 20,
    bomEntries: [],
    stockSecurity: 20,
    leadTime: 7,
    lotSize: 10,
    quantity: 30
  },
  {
    articleId: 3,
    code_bare: "PROD-FIN-01",
    name: "Produit fini 1",
    articleDescription: "Produit fini assemblé",
    unitPrice: 50,
    TVA: 20,
    Fournisseur: "",
    delaidoptention: 10,
    status: "FINISHED",
    isArticleFabrique: true,
    isArticleAchte: false,
    safetyStock: 10,
    bomEntries: [],
    stockSecurity: 10,
    leadTime: 10,
    lotSize: 20,
    quantity: 8
  }
];

const ReportsPage = () => {
  const [periodFilter, setPeriodFilter] = useState("6months");
  const [articles, setArticles] = useState<Article[]>(mockArticles);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Préparation des données pour les graphiques
  const stockValueData = [
    { 
      category: "Matières premières", 
      value: articles
        .filter(article => article.isArticleAchte)
        .reduce((sum, article) => sum + (article.quantity * article.unitPrice), 0)
    },
    { 
      category: "Composants", 
      value: articles
        .filter(article => article.isArticleFabrique)
        .reduce((sum, article) => sum + (article.quantity * article.unitPrice), 0)
    },
    { 
      category: "Produits finis", 
      value: articles
        .filter(article => !article.isArticleAchte && !article.isArticleFabrique)
        .reduce((sum, article) => sum + (article.quantity * article.unitPrice), 0)
    }
  ];

  const productionData = articles
    .filter(article => article.isArticleFabrique)
    .map(article => ({
      name: article.name,
      planned: article.lotSize,
      actual: article.quantity,
      efficiency: article.quantity > 0 ? (article.quantity / article.lotSize) * 100 : 0
    }));

  const materialsData = articles
    .filter(article => article.isArticleAchte)
    .map(article => ({
      name: article.name,
      quantity: article.quantity
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
        <h1 className="text-3xl font-bold">Rapports et Analyses</h1>
        <p className="text-muted-foreground">
          Consultez les rapports et indicateurs clés de performance
        </p>
      </div>

      {/* Filtres */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <span className="text-muted-foreground">Période:</span>
          <Select value={periodFilter} onValueChange={setPeriodFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30days">30 jours</SelectItem>
              <SelectItem value="3months">3 mois</SelectItem>
              <SelectItem value="6months">6 mois</SelectItem>
              <SelectItem value="1year">1 an</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline">Exporter</Button>
      </div>

      <Tabs defaultValue="production" className="space-y-4">
        <TabsList>
          <TabsTrigger value="production">Production</TabsTrigger>
          <TabsTrigger value="inventory">Stocks</TabsTrigger>
          <TabsTrigger value="materials">Matières</TabsTrigger>
        </TabsList>

        {/* Onglet Production */}
        <TabsContent value="production">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Taux d'efficacité</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-500">
                  {productionData.length > 0 
                    ? `${(productionData.reduce((sum, item) => sum + item.efficiency, 0) / productionData.length).toFixed(1)}%`
                    : "0%"}
                </div>
                <p className="text-muted-foreground text-sm">Moyenne sur les articles fabriqués</p>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total produit</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {productionData.reduce((sum, item) => sum + item.actual, 0)} unités
                </div>
                <p className="text-muted-foreground text-sm">Sur la période sélectionnée</p>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Articles à produire</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-500">
                  {productionData.filter(item => item.actual < item.planned).length}
                </div>
                <p className="text-muted-foreground text-sm">En dessous de la taille de lot</p>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6 shadow-sm">
            <CardHeader>
              <CardTitle>Performance de production</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={productionData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Bar
                      yAxisId="left"
                      dataKey="planned"
                      name="Taille de lot"
                      fill="#3498db"
                    />
                    <Bar
                      yAxisId="left"
                      dataKey="actual"
                      name="Stock actuel"
                      fill="#e74c3c"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="efficiency"
                      name="Efficacité (%)"
                      stroke="#2ecc71"
                      strokeDasharray="5 5"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Stocks */}
        <TabsContent value="inventory">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1 shadow-sm">
              <CardHeader>
                <CardTitle>Valeur des stocks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stockValueData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {stockValueData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [`${value.toLocaleString()} €`, "Valeur"]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Valeur totale:</span>
                    <span className="font-bold">
                      {stockValueData.reduce((sum, item) => sum + item.value, 0).toLocaleString()} €
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2 shadow-sm">
              <CardHeader>
                <CardTitle>État des stocks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={articles.map(article => ({
                        name: article.name,
                        stock: article.quantity,
                        safetyStock: article.safetyStock
                      }))}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="stock" name="Stock actuel" fill="#3498db" />
                      <Bar dataKey="safetyStock" name="Stock de sécurité" fill="#2ecc71" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Onglet Matières */}
        <TabsContent value="materials">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Consommation de matières premières</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={materialsData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="quantity" name="Quantité" fill="#3498db" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-6 space-y-2">
                <h3 className="font-medium">Analyse de la consommation</h3>
                <p className="text-sm text-muted-foreground">
                  {materialsData.length > 0
                    ? `La matière première la plus consommée est ${materialsData.reduce((prev, current) => 
                        (prev.quantity > current.quantity) ? prev : current
                      ).name}.`
                    : "Aucune donnée de consommation disponible."}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsPage;
