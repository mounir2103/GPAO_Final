
import { useState } from "react";
import Layout from "@/components/layout/Layout";
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
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Calendar } from 'lucide-react';

// Données fictives pour les rapports
const stockValueData = [
  { category: "Matières premières", value: 28500 },
  { category: "Composants", value: 42300 },
  { category: "Produits finis", value: 34800 },
];

const colors = ["#3498db", "#9b59b6", "#2ecc71", "#f1c40f", "#e74c3c"];

const productionTrendData = [
  { month: "Jan", planned: 120, actual: 115, efficiency: 96 },
  { month: "Fév", planned: 150, actual: 140, efficiency: 93 },
  { month: "Mar", planned: 180, actual: 175, efficiency: 97 },
  { month: "Avr", planned: 200, actual: 190, efficiency: 95 },
  { month: "Mai", planned: 220, actual: 215, efficiency: 98 },
  { month: "Juin", planned: 190, actual: 175, efficiency: 92 },
];

const materialsUsageData = [
  { name: "Aluminium", quantity: 850 },
  { name: "Acier", quantity: 1250 },
  { name: "Plastique", quantity: 560 },
  { name: "Cuivre", quantity: 340 },
  { name: "Silicium", quantity: 210 },
];

const ReportsPage = () => {
  const [periodFilter, setPeriodFilter] = useState("6months");

  return (
    <Layout>
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
                  <div className="text-3xl font-bold text-green-500">96.7%</div>
                  <p className="text-muted-foreground text-sm">Moyenne sur 6 mois</p>
                </CardContent>
              </Card>
              
              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Total produit</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">1,245 unités</div>
                  <p className="text-muted-foreground text-sm">Sur la période sélectionnée</p>
                </CardContent>
              </Card>
              
              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Retards</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-500">7 ordres</div>
                  <p className="text-muted-foreground text-sm">En retard sur la planification</p>
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
                    <LineChart
                      data={productionTrendData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" domain={[80, 100]} />
                      <Tooltip />
                      <Legend />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="planned"
                        name="Planifié"
                        stroke="#3498db"
                        activeDot={{ r: 8 }}
                        strokeWidth={2}
                      />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="actual"
                        name="Réalisé"
                        stroke="#e74c3c"
                        strokeWidth={2}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="efficiency"
                        name="Efficacité (%)"
                        stroke="#2ecc71"
                        strokeDasharray="5 5"
                        strokeWidth={2}
                      />
                    </LineChart>
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
                          formatter={(value) => [`${value} €`, "Valeur"]}
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
                  <CardTitle>Évolution des stocks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={productionTrendData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="planned" name="Stock initial" fill="#3498db" />
                        <Bar dataKey="actual" name="Stock final" fill="#2ecc71" />
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
                      data={materialsUsageData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={100} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="quantity" name="Quantité (kg)" fill="#3498db" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-6 space-y-2">
                  <h3 className="font-medium">Analyse de la consommation</h3>
                  <p className="text-sm text-muted-foreground">
                    L'acier représente la plus grande partie de la consommation de matières premières, 
                    suivi par l'aluminium. Une optimisation des processus de découpe pourrait réduire 
                    la consommation de ces matériaux de 8 à 12%.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default ReportsPage;
