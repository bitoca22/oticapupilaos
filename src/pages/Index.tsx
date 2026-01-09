import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Glasses, UserPlus, ShoppingCart, Wrench, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Index = () => {
  const navigate = useNavigate();
  const [isSalesDialogOpen, setIsSalesDialogOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="gradient-primary py-8 px-4 shadow-soft">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Glasses className="h-10 w-10 text-primary-foreground" />
            <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground tracking-tight">
              OS Digital
            </h1>
          </div>
          <p className="text-primary-foreground/80 text-lg font-light">
            Sistema de Gestão para Óticas
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl w-full animate-fade-in">
          {/* Sales Button */}
          <button
            onClick={() => setIsSalesDialogOpen(true)}
            className="group relative overflow-hidden bg-card rounded-xl p-8 shadow-card hover:shadow-soft transition-all duration-300 border border-border hover:border-primary/30"
          >
            <div className="absolute inset-0 gradient-primary opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
            <div className="relative flex flex-col items-center gap-4">
              <div className="p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
                <ShoppingCart className="h-10 w-10 text-primary" />
              </div>
              <div className="text-center">
                <h2 className="text-xl font-semibold text-foreground mb-1">
                  Vendas
                </h2>
                <p className="text-muted-foreground text-sm">
                  Óculos, Manutenção e Produtos
                </p>
              </div>
            </div>
          </button>

          {/* Client Registration Button */}
          <button
            onClick={() => navigate("/register")}
            className="group relative overflow-hidden bg-card rounded-xl p-8 shadow-card hover:shadow-soft transition-all duration-300 border border-border hover:border-accent/30"
          >
            <div className="absolute inset-0 bg-accent opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
            <div className="relative flex flex-col items-center gap-4">
              <div className="p-4 rounded-full bg-accent/10 group-hover:bg-accent/20 transition-colors duration-300">
                <UserPlus className="h-10 w-10 text-accent" />
              </div>
              <div className="text-center">
                <h2 className="text-xl font-semibold text-foreground mb-1">
                  Cadastro de Cliente
                </h2>
                <p className="text-muted-foreground text-sm">
                  Registrar novo cliente
                </p>
              </div>
            </div>
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-muted-foreground text-sm border-t border-border">
        <p>© 2024 OS Digital - Sistema de Gestão para Óticas</p>
      </footer>

      {/* Sales Type Dialog */}
      <Dialog open={isSalesDialogOpen} onOpenChange={setIsSalesDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">
              Selecione o Tipo de Venda
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4 py-4">
            <Button
              variant="outline"
              className="h-auto py-6 flex flex-col items-center gap-3 hover:bg-primary/5 hover:border-primary/30"
              onClick={() => {
                setIsSalesDialogOpen(false);
                navigate("/sales/glasses");
              }}
            >
              <Glasses className="h-8 w-8 text-primary" />
              <span className="text-base font-medium">Venda de Óculos</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-6 flex flex-col items-center gap-3 hover:bg-accent/5 hover:border-accent/30"
              onClick={() => {
                setIsSalesDialogOpen(false);
                navigate("/sales/misc");
              }}
            >
              <div className="flex gap-2">
                <Wrench className="h-8 w-8 text-accent" />
                <Package className="h-8 w-8 text-accent" />
              </div>
              <span className="text-base font-medium">
                Manutenção / Produtos
              </span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
