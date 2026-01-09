import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Wrench, Package, Loader2, CalendarIcon } from "lucide-react";
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

const maintenanceItems = [
  "Plaquetas",
  "Parafuso",
  "Mola",
  "Charneira",
  "Solda",
];

const productItems = ["Xerox", "Pano Mágico", "Limpa lentes"];

const MiscSale = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    type: "Manutenção",
    itemDetail: "",
    saleDate: new Date(),
    amount: "",
  });

  const currentItems =
    formData.type === "Manutenção" ? maintenanceItems : productItems;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.itemDetail || !formData.amount) {
      toast.error("Por favor, preencha todos os campos.");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.from("sales_maintenance").insert({
        type: formData.type,
        item_detail: formData.itemDetail,
        sale_date: format(formData.saleDate, "yyyy-MM-dd"),
        amount: parseFloat(formData.amount),
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
                Manutenção / Produtos
              </h1>
              <p className="text-primary-foreground/70 text-sm">
                Registrar venda de serviços ou produtos
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
            <div className="p-2 rounded-lg bg-accent/10">
              {formData.type === "Manutenção" ? (
                <Wrench className="h-5 w-5 text-accent" />
              ) : (
                <Package className="h-5 w-5 text-accent" />
              )}
            </div>
            <h2 className="text-lg font-semibold text-foreground">
              Dados da Venda
            </h2>
          </div>

          <div className="space-y-4">
            {/* Type */}
            <div className="space-y-3">
              <Label>Tipo *</Label>
              <RadioGroup
                value={formData.type}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    type: value,
                    itemDetail: "",
                  }))
                }
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Manutenção" id="manutencao" />
                  <Label htmlFor="manutencao" className="font-normal cursor-pointer">
                    Manutenção
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Produtos" id="produtos" />
                  <Label htmlFor="produtos" className="font-normal cursor-pointer">
                    Produtos
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Item */}
            <div className="space-y-2">
              <Label>Item *</Label>
              <Select
                value={formData.itemDetail}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, itemDetail: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o item" />
                </SelectTrigger>
                <SelectContent>
                  {currentItems.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label>Data *</Label>
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
              disabled={isLoading || !formData.itemDetail || !formData.amount}
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

export default MiscSale;
