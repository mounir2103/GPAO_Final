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
import { Article, ArticleStatus, ArticleType, ArticleDTO } from "@/lib/types";
import { toast } from "sonner";

const articleSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  articleDescription: z.string().min(1, 'La description est requise'),
  type: z.enum(['raw', 'component', 'finished']),
  unit: z.string().min(1, 'L\'unité est requise'),
  unitPrice: z.number().min(0, 'Le prix doit être positif'),
  safetyStock: z.number().min(0, 'Le stock de sécurité doit être positif'),
  fournisseur: z.string().min(1, 'Le fournisseur est requis'),
  delaidoptention: z.number().min(0, 'Le délai d\'approvisionnement doit être positif'),
  isArticleFabrique: z.boolean().optional(),
  isArticleAchte: z.boolean().optional(),
  tva: z.number().optional(),
  lotSize: z.number().optional(),
  codeBare: z.string().optional(),
  status: z.enum(['RAW_MATERIAL', 'FINISHED']).default('RAW_MATERIAL')
});

interface ArticleFormProps {
  article?: Article;
  onSubmit: (data: ArticleDTO) => void;
  onCancel: () => void;
}

export function ArticleForm({ article, onSubmit, onCancel }: ArticleFormProps) {
  const form = useForm<z.infer<typeof articleSchema>>({
    resolver: zodResolver(articleSchema),
    defaultValues: article
      ? {
          name: article.name || "",
          articleDescription: article.articleDescription || "",
          type: article.type || "raw",
          unit: article.unit || "pcs",
          unitPrice: article.unitPrice || 0,
          safetyStock: article.safetyStock || article.stockSecurity || 0,
          fournisseur: article.fournisseur || "",
          delaidoptention: article.delaidoptention || 0,
          isArticleFabrique: article.isArticleFabrique || false,
          isArticleAchte: article.isArticleAchte || false,
          tva: article.tva || 0,
          lotSize: article.lotSize || 0,
          codeBare: article.codeBare || "",
          status: article.status || "RAW_MATERIAL"
        }
      : {
          name: "",
          articleDescription: "",
          type: "raw",
          unit: "pcs",
          unitPrice: 0,
          safetyStock: 10,
          fournisseur: "",
          delaidoptention: 7,
          isArticleFabrique: false,
          isArticleAchte: false,
          tva: 0,
          lotSize: 0,
          codeBare: "",
          status: "RAW_MATERIAL"
        },
  });

  const handleSubmit = async (data: z.infer<typeof articleSchema>) => {
    try {
      const articleData: ArticleDTO = {
        articleName: data.name,
        articleDescription: data.articleDescription,
        type: data.type,
        unit: data.unit,
        unitPrice: data.unitPrice,
        safetyStock: data.safetyStock,
        fournisseur: data.fournisseur,
        delaidoptention: data.delaidoptention,
        isArticleFabrique: data.isArticleFabrique,
        isArticleAchte: data.isArticleAchte,
        tva: data.tva,
        lotSize: data.lotSize,
        codeBare: data.codeBare,
        status: data.status
      };

      await onSubmit(articleData);
      toast.success(article ? "Article modifié avec succès" : "Article ajouté avec succès");
    } catch (error) {
      toast.error("Une erreur est survenue");
      console.error('Error submitting form:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
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
                    <SelectItem value="component">Produit semi-fini</SelectItem>
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
                    step="0.01"
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
            name="codeBare"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Code-barres</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isArticleFabrique"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fabriqué</FormLabel>
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isArticleAchte"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Acheté</FormLabel>
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
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
                    <SelectItem value="RAW_MATERIAL">Matière première</SelectItem>
                    <SelectItem value="FINISHED">Produit fini</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
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
