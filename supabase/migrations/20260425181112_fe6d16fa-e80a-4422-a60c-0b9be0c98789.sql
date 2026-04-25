-- Roles enum + table
CREATE TYPE public.app_role AS ENUM ('admin', 'customer');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins view all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins view all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Auto-create profile + first-user-is-admin trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE user_count INT;
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'phone');
  SELECT COUNT(*) INTO user_count FROM auth.users;
  IF user_count = 1 THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'customer');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Menu items
CREATE TYPE public.menu_category AS ENUM ('nigerian', 'continental', 'fastfood');

CREATE TABLE public.menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  category menu_category NOT NULL,
  image_url TEXT,
  available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view available items" ON public.menu_items FOR SELECT USING (available = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage menu" ON public.menu_items FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Orders
CREATE TYPE public.payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
CREATE TYPE public.delivery_status AS ENUM ('pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled');

CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  delivery_city TEXT NOT NULL,
  delivery_notes TEXT,
  subtotal NUMERIC(10,2) NOT NULL,
  delivery_fee NUMERIC(10,2) NOT NULL DEFAULT 1500,
  total NUMERIC(10,2) NOT NULL,
  payment_status payment_status NOT NULL DEFAULT 'pending',
  delivery_status delivery_status NOT NULL DEFAULT 'pending',
  paystack_reference TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own orders" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users create orders" ON public.orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins view all orders" ON public.orders FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update orders" ON public.orders FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Order items
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE SET NULL,
  item_name TEXT NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own order items" ON public.order_items FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid()));
CREATE POLICY "Users create order items" ON public.order_items FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid()));
CREATE POLICY "Admins view all order items" ON public.order_items FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER touch_profiles BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER touch_menu BEFORE UPDATE ON public.menu_items FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER touch_orders BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();