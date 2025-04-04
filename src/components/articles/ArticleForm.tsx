
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Article, ArticleStatus, ArticleType } from "@/lib/types";
import { toast } from "sonner";

const articleSchema = z.object({
  code_bare: z.string().min(2, "Le code doit contenir au moins 2 caractères"),
  articleName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  type: z.enum(["raw", "component", "finished"]),
  unit: z.string().min(1, "L'unité est requise"),
  safetyStock: z.number().min(0, "Le stock de sécurité doit être positif"),
  delaidoptention: z.number().min(0, "Le délai d'obtention doit être positif"),
  lotSize: z.number().min(1, "La taille de lot doit être au moins 1"),
  unitPrice: z.number().min(0, "Le prix doit être positif"),
  articleDescription: z.string().optional(),
  tva: z.number().min(0).max(100).optional(),
  fournisseur: z.string().optional(),
  status: z.enum(["active", "inactive", "discontinued", "pending"]).optional(),
  articleFabrique: z.boolean().optional(),
  articleAchte: z.boolean().optional(),
});

interface ArticleFormProps {
  article?: Article;
  onSubmit: (data: Article) => void;
  onCancel: () => void;
}

export function ArticleForm({ article, onSubmit, onCancel }: ArticleFormProps) {
  const form = useForm<z.infer<typeof articleSchema>>({
    resolver: zodResolver(articleSchema),
    defaultValues: article
      ? {
          code_bare: article.code_bare || article.code || "",
          articleName: article.articleName || article.name || "",
          type: article.type || "raw" as ArticleType,
          unit: article.unit || "pcs",
          safetyStock: article.safetyStock || article.stockSecurity || 0,
          delaidoptention: article.delaidoptention || article.leadTime || 0,
          lotSize: article.lotSize || 1,
          unitPrice: article.unitPrice || article.price || 0,
          articleDescription: article.articleDescription || "",
          tva: article.tva || article.TVA || 20,
          fournisseur: article.fournisseur || "",
          status: article.status || "active",
          articleFabrique: article.articleFabrique || article.isArticleFabrique || false,
          articleAchte: article.articleAchte || article.isArticleAchete || true,
        }
      : {
          code_bare: "",
          articleName: "",
          type: "raw" as ArticleType,
          unit: "pcs",
          safetyStock: 10,
          delaidoptention: 7,
          lotSize: 1,
          unitPrice: 0,
          articleDescription: "",
          tva: 20,
          fournisseur: "",
          status: "active" as ArticleStatus,
          articleFabrique: false,
          articleAchte: true,
        },
  });

  const handleSubmit = (values: z.infer<typeof articleSchema>) => {
    try {
      // Assurons-nous que tous les champs requis pour Article sont présents
      const articleData: Article = {
        id: article?.id || `${Date.now()}`, // Génère un ID temporaire si nouvel article
        code_bare: values.code_bare,
        articleName: values.articleName,
        articleDescription: values.articleDescription,
        unitPrice: values.unitPrice,
        tva: values.tva || 20,
        fournisseur: values.fournisseur,
        delaidoptention: values.delaidoptention,
        safetyStock: values.safetyStock,
        status: values.status || "active",
        articleFabrique: values.articleFabrique || false,
        articleAchte: values.articleAchte || true,
        // Compatibilité avec le code existant
        code: values.code_bare,
        name: values.articleName,
        type: values.type,
        unit: values.unit,
        stockSecurity: values.safetyStock,
        leadTime: values.delaidoptention,
        lotSize: values.lotSize,
        price: values.unitPrice,
        TVA: values.tva,
        isArticleFabrique: values.articleFabrique,
        isArticleAchete: values.articleAchte,
      };
      
      onSubmit(articleData);
      toast.success(article ? "Article modifié avec succès" : "Article ajouté avec succès");
    } catch (error) {
      toast.error("Une erreur est survenue");
      console.error(error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="code_bare"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Code</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="articleName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="articleDescription"
            render={({ field }) => (
              <FormItem className="col-span-1 md:col-span-2">
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Type d'article" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="raw">Matière première</SelectItem>
                    <SelectItem value="component">Composant</SelectItem>
                    <SelectItem value="finished">Produit fini</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unité</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Unité" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="pcs">Pièce</SelectItem>
                    <SelectItem value="kg">Kilogramme</SelectItem>
                    <SelectItem value="m">Mètre</SelectItem>
                    <SelectItem value="l">Litre</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="safetyStock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock de sécurité</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="delaidoptention"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Délai d'obtention (jours)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lotSize"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Taille de lot</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="unitPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prix unitaire (€)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    step="0.01"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tva"
            render={({ field }) => (
              <FormItem>
                <FormLabel>TVA (%)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fournisseur"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fournisseur</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Statut</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="active">Actif</SelectItem>
                    <SelectItem value="inactive">Inactif</SelectItem>
                    <SelectItem value="discontinued">Abandonné</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="articleFabrique"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Article fabriqué</FormLabel>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="articleAchte"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Article acheté</FormLabel>
                </div>
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
          <Button type="submit">
            {article ? "Mettre à jour l'article" : "Ajouter l'article"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
