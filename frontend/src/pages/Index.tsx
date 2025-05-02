import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { BarChart3, Package, ShoppingCart, TrendingUp, Truck, Plus, Download, PieChart } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Pie,
  PieChart as RePieChart,
  Cell
} from "recharts";
import { articleService } from "@/services/api";
import { Article } from "@/lib/types";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

const COLORS = ["#2563eb", "#f97316", "#10b981"];

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<keyof Article | null>(null);
  const [sortAsc, setSortAsc] = useState(true);

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

  // KPIs
  const belowSafety = articles.filter(a => a.quantity < (a.safetyStock || 0)).length;
  const totalValue = articles.reduce((sum, a) => sum + ((a.quantity || 0) * (a.unitPrice || 0)), 0);
  const suppliers = Array.from(new Set(articles.map(a => a.Fournisseur).filter(Boolean))).length;
  const typeCounts = {
    raw: articles.filter(a => a.status === 'RAW_MATERIAL').length,
    component: articles.filter(a => a.type === 'component').length,
    finished: articles.filter(a => a.status === 'FINISHED').length
  };

  // Article type distribution for PieChart
  const typeData = [
    { name: "Matières premières", value: typeCounts.raw },
    { name: "Composants", value: typeCounts.component },
    { name: "Produits finis", value: typeCounts.finished }
  ];

  // Table filtering and sorting
  const filteredArticles = articles.filter(a =>
    (a.name?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (a.code_bare?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (a.Fournisseur?.toLowerCase() || '').includes(search.toLowerCase())
  );
  const sortedArticles = sortKey
    ? [...filteredArticles].sort((a, b) => {
        if (a[sortKey] === b[sortKey]) return 0;
        if (a[sortKey] == null) return 1;
        if (b[sortKey] == null) return -1;
        return (a[sortKey] > b[sortKey] ? 1 : -1) * (sortAsc ? 1 : -1);
      })
    : filteredArticles;

  // Export CSV
  const handleExportCSV = () => {
    const header = [
      "Nom", "Code", "Type", "Fournisseur", "Stock", "Stock sécurité", "Prix unitaire", "Valeur totale"
    ];
    const rows = articles.map(a => [
      a.name, a.code_bare, a.type, a.Fournisseur, a.quantity, a.safetyStock, a.unitPrice, (a.quantity * a.unitPrice).toFixed(2)
    ]);
    const csv = [header, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "articles.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

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
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">Tableau de bord</h1>
        <p className="text-muted-foreground">
          Vue d'ensemble de votre système de production
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardContent className="p-6 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-8 w-8 text-blue-500" />
              <span className="text-lg font-bold">{belowSafety}</span>
            </div>
            <div className="text-sm text-muted-foreground">Articles à commander</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-6 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Package className="h-8 w-8 text-green-500" />
              <span className="text-lg font-bold">{totalValue.toLocaleString()} €</span>
            </div>
            <div className="text-sm text-muted-foreground">Valeur totale du stock</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-6 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-8 w-8 text-orange-500" />
              <span className="text-lg font-bold">{suppliers}</span>
            </div>
            <div className="text-sm text-muted-foreground">Fournisseurs uniques</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-6 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <PieChart className="h-8 w-8 text-indigo-500" />
              <span className="text-lg font-bold">{articles.length}</span>
            </div>
            <div className="text-sm text-muted-foreground">Articles référencés</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchArticles}><span>Actualiser</span></Button>
          <Button variant="outline" onClick={handleExportCSV}><Download className="h-4 w-4 mr-2" /> Exporter CSV</Button>
        </div>
        <Button variant="default"><Plus className="h-4 w-4 mr-2" /> Nouvel article</Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="overview">Aperçu</TabsTrigger>
          <TabsTrigger value="analytics">Analyses</TabsTrigger>
          <TabsTrigger value="types">Types</TabsTrigger>
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
                      data={articles.map(article => ({
                        name: article.name,
                        stock: article.quantity || 0,
                        safetyStock: article.safetyStock || 0,
                        type: article.status === 'RAW_MATERIAL' ? 'Matière première' : 
                              article.status === 'FINISHED' ? 'Produit fini' : 'Composant'
                      }))}
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
                      data={articles.filter(article => article.isArticleFabrique).map(article => ({
                        product: article.name,
                        planned: article.lotSize,
                        actual: article.quantity
                      }))}
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
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Répartition des types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart width={400} height={400}>
                      <Pie
                        data={typeData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        {typeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          {/* Table of articles */}
          <div className="rounded-md border shadow-sm bg-white">
            <div className="flex items-center justify-between p-2">
              <Input
                placeholder="Rechercher un article..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-64"
              />
              <Button variant="outline" onClick={handleExportCSV}><Download className="h-4 w-4 mr-2" /> Exporter CSV</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr>
                    <th className="cursor-pointer" onClick={() => { setSortKey("name"); setSortAsc(!sortAsc); }}>Nom</th>
                    <th className="cursor-pointer" onClick={() => { setSortKey("code_bare"); setSortAsc(!sortAsc); }}>Code</th>
                    <th className="cursor-pointer" onClick={() => { setSortKey("type"); setSortAsc(!sortAsc); }}>Type</th>
                    <th>Fournisseur</th>
                    <th className="cursor-pointer" onClick={() => { setSortKey("quantity"); setSortAsc(!sortAsc); }}>Stock</th>
                    <th>Stock sécurité</th>
                    <th>Prix unitaire</th>
                    <th>Valeur totale</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedArticles.map(article => (
                    <tr key={article.articleId} className="border-b hover:bg-gray-50">
                      <td>{article.name}</td>
                      <td>{article.code_bare}</td>
                      <td>{article.type}</td>
                      <td>{article.Fournisseur}</td>
                      <td>{article.quantity}</td>
                      <td>{article.safetyStock}</td>
                      <td>{article.unitPrice} €</td>
                      <td>{(article.quantity * article.unitPrice).toFixed(2)} €</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="types" className="space-y-4">
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Répartition des types d'articles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart width={400} height={400}>
                    <Pie
                      data={typeData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      label
                    >
                      {typeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
