
import React, { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { calculateCBN } from "@/lib/gpao-utils";
import { Article, PlanningPeriod, CBNCalculation } from "@/lib/types";
import { toast } from "sonner";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";
import { Calculator } from "lucide-react";

// Données fictives pour la démo
const mockArticles: Article[] = [
  {
    id: "1",
    code: "MP001",
    name: "Aluminium 6061",
    type: "raw",
    unit: "kg",
    stockSecurity: 100,
    leadTime: 7,
    lotSize: 250,
    price: 3.5
  },
  {
    id: "4",
    code: "PF001",
    name: "Capteur de pression",
    type: "finished",
    unit: "pcs",
    stockSecurity: 20,
    leadTime: 3,
    lotSize: 50,
    price: 78.5,
    components: [
      { articleId: "1", articleCode: "MP001", articleName: "Aluminium 6061", quantity: 0.5 },
      { articleId: "3", articleCode: "COMP001", articleName: "Carte électronique type A", quantity: 1 }
    ]
  },
  {
    id: "5",
    code: "PF002",
    name: "Module de contrôle",
    type: "finished",
    unit: "pcs",
    stockSecurity: 15,
    leadTime: 5,
    lotSize: 30,
    price: 125,
    components: [
      { articleId: "2", articleCode: "MP002", articleName: "Acier S235", quantity: 1.2 },
      { articleId: "3", articleCode: "COMP001", articleName: "Carte électronique type A", quantity: 2 }
    ]
  }
];

const mockPeriods: PlanningPeriod[] = [
  { id: 1, name: "Semaine 1", startDate: new Date(2023, 0, 1), endDate: new Date(2023, 0, 7) },
  { id: 2, name: "Semaine 2", startDate: new Date(2023, 0, 8), endDate: new Date(2023, 0, 14) },
  { id: 3, name: "Semaine 3", startDate: new Date(2023, 0, 15), endDate: new Date(2023, 0, 21) },
  { id: 4, name: "Semaine 4", startDate: new Date(2023, 0, 22), endDate: new Date(2023, 0, 28) },
  { id: 5, name: "Semaine 5", startDate: new Date(2023, 0, 29), endDate: new Date(2023, 1, 4) },
  { id: 6, name: "Semaine 6", startDate: new Date(2023, 1, 5), endDate: new Date(2023, 1, 11) },
  { id: 7, name: "Semaine 7", startDate: new Date(2023, 1, 12), endDate: new Date(2023, 1, 18) },
  { id: 8, name: "Semaine 8", startDate: new Date(2023, 1, 19), endDate: new Date(2023, 1, 25) }
];

const CBNPage = () => {
  const [selectedArticleId, setSelectedArticleId] = useState<string>("");
  const [initialStock, setInitialStock] = useState<number>(0);
  const [grossRequirements, setGrossRequirements] = useState<Record<number, number>>({});
  const [scheduledReceipts, setScheduledReceipts] = useState<Record<number, number>>({});
  const [cbnResult, setCbnResult] = useState<CBNCalculation | null>(null);

  // Trouver l'article sélectionné
  const selectedArticle = mockArticles.find(article => article.id === selectedArticleId);

  // Fonction pour mettre à jour les besoins bruts
  const handleUpdateGrossRequirement = (periodId: number, value: number) => {
    const updatedRequirements = { ...grossRequirements, [periodId]: value };
    setGrossRequirements(updatedRequirements);
  };

  // Fonction pour mettre à jour les réceptions programmées
  const handleUpdateScheduledReceipt = (periodId: number, value: number) => {
    const updatedReceipts = { ...scheduledReceipts, [periodId]: value };
    setScheduledReceipts(updatedReceipts);
  };

  // Fonction pour effectuer le calcul CBN
  const handleCalculateCBN = () => {
    if (!selectedArticle) {
      toast.error("Veuillez sélectionner un article");
      return;
    }

    const result = calculateCBN(
      selectedArticle,
      mockPeriods,
      initialStock,
      grossRequirements,
      scheduledReceipts
    );

    setCbnResult(result);
    toast.success("Calcul CBN effectué avec succès");
  };

  // Préparation des données pour le graphique
  const chartData = cbnResult?.periods.map(period => {
    const periodData = mockPeriods.find(p => p.id === period.periodId);
    return {
      name: periodData?.name || `Période ${period.periodId}`,
      grossRequirements: period.grossRequirements,
      netRequirements: period.netRequirements,
      projectedInventory: period.projectedInventory,
      plannedOrders: period.plannedOrders
    };
  }) || [];

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold">Calcul des Besoins Nets (CBN)</h1>
          <p className="text-muted-foreground">
            Planifiez votre production en calculant les besoins nets et les ordres de fabrication
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panneau de configuration */}
          <Card className="lg:col-span-1 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                <span>Paramètres de calcul</span>
              </CardTitle>
              <CardDescription>
                Sélectionnez un article et définissez les données d'entrée
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="article">Article</Label>
                <Select value={selectedArticleId} onValueChange={setSelectedArticleId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un article" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockArticles.map(article => (
                      <SelectItem key={article.id} value={article.id}>
                        {article.code} - {article.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedArticle && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="initialStock">Stock initial</Label>
                    <Input 
                      id="initialStock"
                      type="number"
                      value={initialStock}
                      onChange={(e) => setInitialStock(Number(e.target.value))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Stock de sécurité: {selectedArticle.stockSecurity} {selectedArticle.unit}</Label>
                    <Label>Délai d'obtention: {selectedArticle.leadTime} jours</Label>
                    <Label>Taille de lot: {selectedArticle.lotSize} {selectedArticle.unit}</Label>
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={handleCalculateCBN} className="w-full">
                Lancer le calcul CBN
              </Button>
            </CardFooter>
          </Card>

          {/* Tableau des périodes et données d'entrée */}
          <Card className="lg:col-span-2 shadow-sm">
            <CardHeader>
              <CardTitle>Données d'entrée par période</CardTitle>
              <CardDescription>
                Entrez les besoins bruts et réceptions programmées pour chaque période
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Période</TableHead>
                      <TableHead>Dates</TableHead>
                      <TableHead className="text-right">Besoins bruts</TableHead>
                      <TableHead className="text-right">Réceptions programmées</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockPeriods.map((period) => (
                      <TableRow key={period.id}>
                        <TableCell className="font-medium">{period.name}</TableCell>
                        <TableCell>
                          {period.startDate.toLocaleDateString()} - {period.endDate.toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            min={0}
                            value={grossRequirements[period.id] || 0}
                            onChange={(e) => handleUpdateGrossRequirement(period.id, Number(e.target.value))}
                            className="w-24 ml-auto"
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            min={0}
                            value={scheduledReceipts[period.id] || 0}
                            onChange={(e) => handleUpdateScheduledReceipt(period.id, Number(e.target.value))}
                            className="w-24 ml-auto"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Résultats du calcul CBN */}
        {cbnResult && (
          <Tabs defaultValue="table" className="space-y-4">
            <TabsList>
              <TabsTrigger value="table">Tableau CBN</TabsTrigger>
              <TabsTrigger value="chart">Graphique</TabsTrigger>
            </TabsList>

            <TabsContent value="table">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>
                    Résultats du calcul CBN - {selectedArticle?.code} - {selectedArticle?.name}
                  </CardTitle>
                  <CardDescription>
                    Analyse des besoins nets et des ordres planifiés par période
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Période</TableHead>
                          <TableHead className="text-right">Besoins bruts</TableHead>
                          <TableHead className="text-right">Réceptions programmées</TableHead>
                          <TableHead className="text-right">Stock prévisionnel</TableHead>
                          <TableHead className="text-right">Besoins nets</TableHead>
                          <TableHead className="text-right">Ordres planifiés</TableHead>
                          <TableHead className="text-right">Lancements</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cbnResult.periods.map((period) => {
                          const periodData = mockPeriods.find(p => p.id === period.periodId);
                          return (
                            <TableRow key={period.periodId}>
                              <TableCell className="font-medium">{periodData?.name}</TableCell>
                              <TableCell className="text-right">{period.grossRequirements}</TableCell>
                              <TableCell className="text-right">{period.scheduledReceipts}</TableCell>
                              <TableCell className="text-right">
                                <span className={period.projectedInventory < selectedArticle!.stockSecurity ? "text-orange-500 font-medium" : ""}>
                                  {period.projectedInventory}
                                </span>
                              </TableCell>
                              <TableCell className="text-right">
                                {period.netRequirements > 0 ? (
                                  <span className="text-destructive font-medium">{period.netRequirements}</span>
                                ) : (
                                  0
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                {period.plannedOrders > 0 ? (
                                  <span className="text-blue-500 font-medium">{period.plannedOrders}</span>
                                ) : (
                                  0
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                {period.plannedOrderReleases > 0 ? (
                                  <span className="text-green-500 font-medium">{period.plannedOrderReleases}</span>
                                ) : (
                                  0
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Button variant="outline">Exporter</Button>
                  <Button>Créer les ordres</Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="chart">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>
                    Graphique CBN - {selectedArticle?.code} - {selectedArticle?.name}
                  </CardTitle>
                  <CardDescription>
                    Visualisation graphique des besoins et du stock prévisionnel
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={chartData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="grossRequirements" 
                          name="Besoins bruts" 
                          stroke="#f97316"
                          strokeWidth={2}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="netRequirements" 
                          name="Besoins nets" 
                          stroke="#e11d48"
                          strokeWidth={2}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="projectedInventory" 
                          name="Stock prévisionnel" 
                          stroke="#2563eb"
                          strokeWidth={2}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="plannedOrders" 
                          name="Ordres planifiés" 
                          stroke="#16a34a"
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </Layout>
  );
};

export default CBNPage;
