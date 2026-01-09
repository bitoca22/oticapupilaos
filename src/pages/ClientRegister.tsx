import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, UserPlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const ClientRegister = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    dnp: "",
    prescription: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Por favor, preencha o nome do cliente.");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.from("clients").insert({
        name: formData.name.trim(),
        phone: formData.phone.trim() || null,
        address: formData.address.trim() || null,
        dnp: formData.dnp.trim() || null,
        prescription: formData.prescription.trim() || null,
      });

      if (error) throw error;

      toast.success("Cliente cadastrado com sucesso!");
      setFormData({
        name: "",
        phone: "",
        address: "",
        dnp: "",
        prescription: "",
      });
    } catch (error) {
      console.error("Error inserting client:", error);
      toast.error("Erro ao cadastrar cliente. Tente novamente.");
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
                Cadastro de Cliente
              </h1>
              <p className="text-primary-foreground/70 text-sm">
                Preencha os dados do novo cliente
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
              <UserPlus className="h-5 w-5 text-accent" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">
              Dados do Cliente
            </h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                name="name"
                placeholder="Nome completo do cliente"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                name="phone"
                placeholder="(00) 00000-0000"
                value={formData.phone}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                name="address"
                placeholder="Endereço completo"
                value={formData.address}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dnp">DNP (Distância Naso-Pupilar)</Label>
              <Input
                id="dnp"
                name="dnp"
                placeholder="Ex: 32mm / 31mm"
                value={formData.dnp}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prescription">Receita</Label>
              <Textarea
                id="prescription"
                name="prescription"
                placeholder="Informações da receita médica..."
                rows={4}
                value={formData.prescription}
                onChange={handleInputChange}
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
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Finalizar Cadastro"
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default ClientRegister;
