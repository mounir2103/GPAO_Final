
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Article, PlanningPeriod } from '@/lib/types';
import { Calendar } from 'lucide-react';

// Schéma de validation pour le formulaire CBN
const cbnFormSchema = z.object({
  articleId: z.string().min(1, 'Veuillez sélectionner un article'),
  initialStock: z.number().min(0, 'Le stock initial doit être positif ou nul'),
  stockSecurity: z.number().min(0, 'Le stock de sécurité doit être positif ou nul'),
  leadTime: z.number().min(0, 'Le délai d\'obtention doit être positif ou nul'),
  lotSize: z.number().min(1, 'La taille de lot doit être au moins 1'),
  periods: z.array(
    z.object({
      periodId: z.number(),
      grossRequirements: z.number().min(0, 'Les besoins bruts doivent être positifs ou nuls'),
      scheduledReceipts: z.number().min(0, 'Les réceptions planifiées doivent être positives ou nulles'),
    })
  ).optional(),
});

type CBNFormValues = z.infer<typeof cbnFormSchema>;

interface CBNFormProps {
  articles: Article[];
  periods: PlanningPeriod[];
  onCalculate: (values: CBNFormValues) => void;
  isLoading?: boolean;
}

export function CBNForm({ articles, periods, onCalculate, isLoading = false }: CBNFormProps) {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const form = useForm<CBNFormValues>({
    resolver: zodResolver(cbnFormSchema),
    defaultValues: {
      articleId: '',
      initialStock: 0,
      stockSecurity: 0,
      leadTime: 0,
      lotSize: 1,
      periods: periods.map(period => ({
        periodId: period.id,
        grossRequirements: 0,
        scheduledReceipts: 0,
      })),
    },
  });

  const handleArticleChange = (articleId: string) => {
    const article = articles.find(a => a.id === articleId);
    setSelectedArticle(article || null);
    
    if (article) {
      form.setValue('stockSecurity', article.stockSecurity);
      form.setValue('leadTime', article.leadTime);
      form.setValue('lotSize', article.lotSize);
    }
  };

  const onSubmit = (values: CBNFormValues) => {
    onCalculate(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card className="mb-8 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Configuration du Calcul des Besoins Nets
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="articleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Article</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleArticleChange(value);
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un article" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {articles.map((article) => (
                          <SelectItem key={article.id} value={article.id}>
                            {article.code} - {article.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="initialStock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock initial</FormLabel>
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
                name="stockSecurity"
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
                name="leadTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Délai d&apos;obtention (jours)</FormLabel>
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
            </div>

            {periods.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">Besoins par période</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="py-2 px-4 border font-medium text-left">Période</th>
                        <th className="py-2 px-4 border font-medium text-right">Besoins Bruts</th>
                        <th className="py-2 px-4 border font-medium text-right">Réceptions Planifiées</th>
                      </tr>
                    </thead>
                    <tbody>
                      {periods.map((period, index) => (
                        <tr key={period.id} className={index % 2 === 0 ? 'bg-muted/30' : ''}>
                          <td className="py-2 px-4 border">{period.name}</td>
                          <td className="py-2 px-4 border">
                            <Input
                              type="number"
                              className="text-right"
                              {...form.register(`periods.${index}.grossRequirements`, {
                                valueAsNumber: true,
                              })}
                            />
                            <input 
                              type="hidden" 
                              {...form.register(`periods.${index}.periodId`)} 
                              value={period.id} 
                            />
                          </td>
                          <td className="py-2 px-4 border">
                            <Input
                              type="number"
                              className="text-right"
                              {...form.register(`periods.${index}.scheduledReceipts`, {
                                valueAsNumber: true,
                              })}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex justify-end mt-6">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Calcul en cours...' : 'Calculer le CBN'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}
