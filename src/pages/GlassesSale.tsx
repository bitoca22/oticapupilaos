import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Glasses, Loader2, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface Client {
  id: string;
  name: string;
}

interface Frame {
  id: string;
  name: string;
  code: string;
}

interface Lens {
  id: string;
  product_code: string;
  description: string;
}

const GlassesSale = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [frames, setFrames] = useState<Frame[]>([]);
  const [lenses, setLenses] = useState<Lens[]>([]);

  const [formData, setFormData] = useState({
    clientId: "",
    frameId: "",
    lensId: "",
    saleDate: new Date(),
    amount: "",
    paymentMethod: "",
    installmentType: "À vista",
    installmentCount: "1",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [clientsRes, framesRes, lensesRes] = await Promise.all([
        supabase.from("clients").select("id, name").order("name"),
        supabase.from("inventory_frames").select("id, name, code").order("name"),
        supabase.from("inventory_lenses").select("id, product_code, description").order("product_code"),
      ]);

      if (clientsRes.error) throw clientsRes.error;
      if (framesRes.error) throw framesRes.error;
      if (lensesRes.error) throw lensesRes.error;

      setClients(clientsRes.data || []);
      setFrames(framesRes.data || []);
      setLenses(lensesRes.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Erro ao carregar dados. Tente novamente.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.clientId || !formData.frameId || !formData.lensId || !formData.amount || !formData.paymentMethod) {
      toast.error("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.from("sales_glasses").insert({
        client_id: formData.clientId,
        frame_id: formData.frameId,
        lens_id: formData.lensId,
        sale_date: format(formData.saleDate, "yyyy-MM-dd"),
        amount: parseFloat(formData.amount),
        payment_method: formData.paymentMethod,
        installment_type: formData.installmentType,
        installment_count: parseInt(formData.installmentCount),
      });

      if (error) throw error;

      toast.success("Venda registrada com sucesso!");
      navigate("/");
    } catch (error) {
      console.error("Error inserting sale:", error);
      toast.error("Erro ao registrar venda. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
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
                Venda de Óculos
              </h1>
              <p className="text-primary-foreground/70 text-sm">
                Registrar nova venda de óculos
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Form */}
      <main className="container mx-auto px-4 py-8 max-w-xl">
        <form
          onSubmit={handleSubmit}
          className="bg-card rounded-xl shadow-card border border-border p-6 space-y-6 animate-fade-in"
        >
          <div className="flex items-center gap-3 pb-4 border-b border-border">
            <div className="p-2 rounded-lg bg-primary/10">
              <Glasses className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">
              Dados da Venda
            </h2>
          </div>

          <div className="space-y-4">
            {/* Client */}
            <div className="space-y-2">
              <Label>Cliente *</Label>
              <Select
                value={formData.clientId}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, clientId: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Frame */}
            <div className="space-y-2">
              <Label>Armação *</Label>
              <Select
                value={formData.frameId}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, frameId: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a armação" />
                </SelectTrigger>
                <SelectContent>
                  {frames.map((frame) => (
                    <SelectItem key={frame.id} value={frame.id}>
                      {frame.name} ({frame.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Lens */}
            <div className="space-y-2">
              <Label>Lente *</Label>
              <Select
                value={formData.lensId}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, lensId: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a lente" />
                </SelectTrigger>
                <SelectContent>
                  {lenses.map((lens) => (
                    <SelectItem key={lens.id} value={lens.id}>
                      {lens.product_code} - {lens.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label>Data da Venda *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.saleDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.saleDate ? (
                      format(formData.saleDate, "dd 'de' MMMM 'de' yyyy", {
                        locale: ptBR,
                      })
                    ) : (
                      <span>Selecione a data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.saleDate}
                    onSelect={(date) =>
                      date && setFormData((prev) => ({ ...prev, saleDate: date }))
                    }
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Valor (R$) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                value={formData.amount}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, amount: e.target.value }))
                }
              />
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <Label>Forma de Pagamento *</Label>
              <Select
                value={formData.paymentMethod}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, paymentMethod: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Crédito">Crédito</SelectItem>
                  <SelectItem value="Débito">Débito</SelectItem>
                  <SelectItem value="Pix">Pix</SelectItem>
                  <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Installment Type */}
            <div className="space-y-3">
              <Label>Parcelamento</Label>
              <RadioGroup
                value={formData.installmentType}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    installmentType: value,
                    installmentCount: value === "À vista" ? "1" : prev.installmentCount,
                  }))
                }
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="À vista" id="avista" />
                  <Label htmlFor="avista" className="font-normal cursor-pointer">
                    À vista
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Parcelado" id="parcelado" />
                  <Label htmlFor="parcelado" className="font-normal cursor-pointer">
                    Parcelado
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Installment Count */}
            {formData.installmentType === "Parcelado" && (
              <div className="space-y-2 animate-fade-in">
                <Label>Número de Parcelas</Label>
                <Select
                  value={formData.installmentCount}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, installmentCount: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2x</SelectItem>
                    <SelectItem value="3">3x</SelectItem>
                    <SelectItem value="4">4x</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => navigate("/")}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary hover:bg-primary/90"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                "Finalizar Venda"
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default GlassesSale;
