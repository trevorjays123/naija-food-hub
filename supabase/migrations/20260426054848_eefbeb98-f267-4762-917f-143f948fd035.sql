ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;

CREATE OR REPLACE FUNCTION public.set_delivered_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.delivery_status = 'delivered' AND (OLD.delivery_status IS DISTINCT FROM 'delivered') THEN
    NEW.delivered_at = now();
  ELSIF NEW.delivery_status <> 'delivered' AND OLD.delivery_status = 'delivered' THEN
    NEW.delivered_at = NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS orders_set_delivered_at ON public.orders;
CREATE TRIGGER orders_set_delivered_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.set_delivered_at();