import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ApiClient from '@/lib/api-client';
import { toast } from 'sonner';

interface Machine {
  id: number;
  name: string;
  type: string;
  capacity: number;
}

const Machines: React.FC = () => {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMachine, setNewMachine] = useState<Partial<Machine>>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchMachines();
  }, []);

  const fetchMachines = async () => {
    setLoading(true);
    try {
      // Updated path to include the full API endpoint
      const data = await ApiClient.get<Machine[]>('/api/v1/machines');
      setMachines(data);
      setError(null);
    } catch (e) {
      setError('Erreur lors du chargement des machines');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMachine = async () => {
    try {
      // Updated path to include the full API endpoint
      await ApiClient.post<Machine>('/api/v1/machines', newMachine);
      setIsDialogOpen(false);
      setNewMachine({});
      fetchMachines();
    } catch (e) {
      setError('Erreur lors de la création de la machine');
    }
  };

  const handleDeleteMachine = async (id: number) => {
    try {
      await ApiClient.delete(`/api/v1/machines/${id}`);
      fetchMachines();
      setError(null);
      toast.success('Machine supprimée avec succès');
    } catch (e) {
      setError('Erreur lors de la suppression de la machine');
      toast.error('Erreur lors de la suppression de la machine');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestion des Machines</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Ajouter une machine</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nouvelle Machine</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nom</Label>
                <Input
                  id="name"
                  value={newMachine.name || ''}
                  onChange={(e) => setNewMachine({ ...newMachine, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Input
                  id="type"
                  value={newMachine.type || ''}
                  onChange={(e) => setNewMachine({ ...newMachine, type: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="capacity">Capacité</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={newMachine.capacity || ''}
                  onChange={(e) => setNewMachine({ ...newMachine, capacity: Number(e.target.value) })}
                />
              </div>
              <Button onClick={handleCreateMachine}>Créer</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div>Chargement...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div className="grid gap-4">
          {machines.length === 0 ? (
            <div className="text-center p-4">Aucune machine disponible</div>
          ) : (
            machines.map((machine) => (
              <div key={machine.id} className="p-4 border rounded-lg flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{machine.name}</h3>
                  <p className="text-sm text-muted-foreground">Type: {machine.type}</p>
                  <p className="text-sm text-muted-foreground">Capacité: {machine.capacity}</p>
                </div>
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteMachine(machine.id)}
                >
                  Supprimer
                </Button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

// Add default export
export default Machines;