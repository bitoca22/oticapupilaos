import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Search,
  Users,
  Edit,
  History,
  Loader2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type Client = {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  dnp: string | null;
  prescription: string | null;
  created_at: string;
};

type SaleWithDetails = {
  id: string;
  sale_date: string;
  amount: number;
  payment_method: string;
  installment_type: string;
  installment_count: number | null;
  frame: { name: string } | null;
  lens: { product_code: string } | null;
};

const ClientsList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [historyClient, setHistoryClient] = useState<Client | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    phone: "",
    address: "",
    dnp: "",
    prescription: "",
  });

  // Fetch clients
  const { data: clients = [], isLoading: isLoadingClients } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as Client[];
    },
  });

  // Fetch purchase history for selected client
  const { data: purchaseHistory = [], isLoading: isLoadingHistory } = useQuery({
    queryKey: ["client-history", historyClient?.id],
    queryFn: async () => {
      if (!historyClient) return [];
      const { data, error } = await supabase
        .from("sales_glasses")
        .select(
          `
          id,
          sale_date,
          amount,
          payment_method,
          installment_type,
          installment_count,
          frame:inventory_frames(name),
          lens:inventory_lenses(product_code)
        `
        )
        .eq("client_id", historyClient.id)
        .order("sale_date", { ascending: false });
      if (error) throw error;
      return data as SaleWithDetails[];
    },
    enabled: !!historyClient,
  });

  // Update client mutation
  const updateMutation = useMutation({
    mutationFn: async (data: {
      id: string;
      name: string;
      phone: string | null;
      address: string | null;
      dnp: string | null;
      prescription: string | null;
    }) => {
      const { error } = await supabase
        .from("clients")
        .update({
          name: data.name,
          phone: data.phone,
          address: data.address,
          dnp: data.dnp,
          prescription: data.prescription,
        })
        .eq("id", data.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast.success("Cliente atualizado com sucesso!");
      setEditingClient(null);
    },
    onError: () => {
      toast.error("Erro ao atualizar cliente.");
    },
  });

  // Filter clients by search term
  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditClick = (client: Client) => {
    setEditingClient(client);
    setEditFormData({
      name: client.name,
      phone: client.phone || "",
      address: client.address || "",
      dnp: client.dnp || "",
      prescription: client.prescription || "",
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient || !editFormData.name.trim()) {
      toast.error("O nome é obrigatório.");
      return;
    }
    updateMutation.mutate({
      id: editingClient.id,
      name: editFormData.name.trim(),
      phone: editFormData.phone.trim() || null,
      address: editFormData.address.trim() || null,
      dnp: editFormData.dnp.trim() || null,
      prescription: editFormData.prescription.trim() || null,
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-primary py-6 px-4 shadow-soft">
        <div className="container mx-auto">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-primary-foreground hover:bg-primary-foreground/10"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-primary-foreground">
                Lista de Clientes
              </h1>
              <p className="text-primary-foreground/70 text-sm">
                Gerencie seus clientes
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="bg-card rounded-xl shadow-card border border-border p-6 animate-fade-in">
          {/* Search Bar */}
          <div className="flex items-center gap-3 pb-6 border-b border-border">
            <div className="p-2 rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou telefone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="mt-6">
            {isLoadingClients ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {searchTerm
                  ? "Nenhum cliente encontrado."
                  : "Nenhum cliente cadastrado."}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Endereço</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClients.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell className="font-medium">
                          {client.name}
                        </TableCell>
                        <TableCell>{client.phone || "-"}</TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {client.address || "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditClick(client)}
                              title="Editar"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setHistoryClient(client)}
                              title="Histórico de Compras"
                            >
                              <History className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Edit Dialog */}
      <Dialog open={!!editingClient} onOpenChange={() => setEditingClient(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome *</Label>
              <Input
                id="edit-name"
                value={editFormData.name}
                onChange={(e) =>
                  setEditFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Telefone</Label>
              <Input
                id="edit-phone"
                value={editFormData.phone}
                onChange={(e) =>
                  setEditFormData((prev) => ({ ...prev, phone: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-address">Endereço</Label>
              <Input
                id="edit-address"
                value={editFormData.address}
                onChange={(e) =>
                  setEditFormData((prev) => ({
                    ...prev,
                    address: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-dnp">DNP</Label>
              <Input
                id="edit-dnp"
                value={editFormData.dnp}
                onChange={(e) =>
                  setEditFormData((prev) => ({ ...prev, dnp: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-prescription">Receita</Label>
              <Textarea
                id="edit-prescription"
                value={editFormData.prescription}
                onChange={(e) =>
                  setEditFormData((prev) => ({
                    ...prev,
                    prescription: e.target.value,
                  }))
                }
                rows={3}
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setEditingClient(null)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={!!historyClient} onOpenChange={() => setHistoryClient(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Histórico de Compras - {historyClient?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {isLoadingHistory ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : purchaseHistory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma compra registrada para este cliente.
              </div>
            ) : (
              <div className="space-y-4">
                {purchaseHistory.map((sale) => (
                  <div
                    key={sale.id}
                    className="p-4 rounded-lg border border-border bg-muted/30"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(sale.sale_date), "dd 'de' MMMM 'de' yyyy", {
                          locale: ptBR,
                        })}
                      </span>
                      <span className="font-semibold text-primary">
                        {formatCurrency(sale.amount)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Armação: </span>
                        <span>{sale.frame?.name || "-"}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Lente: </span>
                        <span>{sale.lens?.product_code || "-"}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Pagamento: </span>
                        <span>{sale.payment_method}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Parcelas: </span>
                        <span>
                          {sale.installment_type === "Parcelado"
                            ? `${sale.installment_count}x`
                            : "À vista"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientsList;
