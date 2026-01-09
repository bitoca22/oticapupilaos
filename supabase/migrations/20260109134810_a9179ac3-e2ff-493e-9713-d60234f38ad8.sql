-- Tabela de Clientes
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  dnp TEXT,
  prescription TEXT
);

-- Tabela de Armações (Inventory Frames)
CREATE TABLE public.inventory_frames (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  name TEXT NOT NULL,
  code TEXT
);

-- Tabela de Lentes (Inventory Lenses)
CREATE TABLE public.inventory_lenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  product_code TEXT NOT NULL,
  description TEXT
);

-- Tabela de Vendas de Óculos
CREATE TABLE public.sales_glasses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  frame_id UUID REFERENCES public.inventory_frames(id) ON DELETE SET NULL,
  lens_id UUID REFERENCES public.inventory_lenses(id) ON DELETE SET NULL,
  sale_date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount NUMERIC(10,2) NOT NULL,
  payment_method TEXT NOT NULL,
  installment_type TEXT NOT NULL DEFAULT 'À vista',
  installment_count INTEGER DEFAULT 1
);

-- Tabela de Vendas de Manutenção/Produtos
CREATE TABLE public.sales_maintenance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  type TEXT NOT NULL,
  item_detail TEXT NOT NULL,
  sale_date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount NUMERIC(10,2) NOT NULL
);

-- Habilitar RLS em todas as tabelas (acesso público para demo)
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_frames ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_lenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_glasses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_maintenance ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso público (para demo sem autenticação)
CREATE POLICY "Allow public read clients" ON public.clients FOR SELECT USING (true);
CREATE POLICY "Allow public insert clients" ON public.clients FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update clients" ON public.clients FOR UPDATE USING (true);
CREATE POLICY "Allow public delete clients" ON public.clients FOR DELETE USING (true);

CREATE POLICY "Allow public read frames" ON public.inventory_frames FOR SELECT USING (true);
CREATE POLICY "Allow public insert frames" ON public.inventory_frames FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read lenses" ON public.inventory_lenses FOR SELECT USING (true);
CREATE POLICY "Allow public insert lenses" ON public.inventory_lenses FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read sales_glasses" ON public.sales_glasses FOR SELECT USING (true);
CREATE POLICY "Allow public insert sales_glasses" ON public.sales_glasses FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read sales_maintenance" ON public.sales_maintenance FOR SELECT USING (true);
CREATE POLICY "Allow public insert sales_maintenance" ON public.sales_maintenance FOR INSERT WITH CHECK (true);

-- Inserir dados de exemplo para armações
INSERT INTO public.inventory_frames (name, code) VALUES
  ('Ray-Ban Aviator', 'RB-001'),
  ('Oakley Holbrook', 'OK-002'),
  ('Prada Classic', 'PR-003'),
  ('Gucci Square', 'GU-004'),
  ('Armani Sport', 'AR-005');

-- Inserir dados de exemplo para lentes
INSERT INTO public.inventory_lenses (product_code, description) VALUES
  ('LT-001', 'Lente Transitions Cinza'),
  ('LT-002', 'Lente Antirreflexo Premium'),
  ('LT-003', 'Lente Multifocal Digital'),
  ('LT-004', 'Lente Policarbonato'),
  ('LT-005', 'Lente Fotossensível Marrom');