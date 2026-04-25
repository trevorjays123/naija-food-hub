UPDATE public.menu_items SET image_url = CASE name
  WHEN 'Jollof Rice & Chicken' THEN 'https://kwmsyubpxxomqltlhvec.supabase.co/storage/v1/object/public/menu-images/jollof-chicken.jpg'
  WHEN 'Egusi Soup & Pounded Yam' THEN 'https://kwmsyubpxxomqltlhvec.supabase.co/storage/v1/object/public/menu-images/egusi-pounded-yam.jpg'
  WHEN 'Ofada Rice & Ayamase' THEN 'https://kwmsyubpxxomqltlhvec.supabase.co/storage/v1/object/public/menu-images/ofada-ayamase.jpg'
  WHEN 'Pepper Soup (Goat Meat)' THEN 'https://kwmsyubpxxomqltlhvec.supabase.co/storage/v1/object/public/menu-images/pepper-soup.jpg'
  WHEN 'Suya Platter' THEN 'https://kwmsyubpxxomqltlhvec.supabase.co/storage/v1/object/public/menu-images/suya-platter.jpg'
  WHEN 'Caesar Salad' THEN 'https://kwmsyubpxxomqltlhvec.supabase.co/storage/v1/object/public/menu-images/caesar-salad.jpg'
  WHEN 'Chicken Alfredo Pasta' THEN 'https://kwmsyubpxxomqltlhvec.supabase.co/storage/v1/object/public/menu-images/chicken-alfredo.jpg'
  WHEN 'Grilled Ribeye Steak' THEN 'https://kwmsyubpxxomqltlhvec.supabase.co/storage/v1/object/public/menu-images/ribeye-steak.jpg'
  WHEN 'Margherita Pizza' THEN 'https://kwmsyubpxxomqltlhvec.supabase.co/storage/v1/object/public/menu-images/margherita-pizza.jpg'
  WHEN 'Beef Hotdog Combo' THEN 'https://kwmsyubpxxomqltlhvec.supabase.co/storage/v1/object/public/menu-images/hotdog-combo.jpg'
  WHEN 'Classic Cheeseburger' THEN 'https://kwmsyubpxxomqltlhvec.supabase.co/storage/v1/object/public/menu-images/cheeseburger.jpg'
  WHEN 'Crispy Chicken Wings (8pc)' THEN 'https://kwmsyubpxxomqltlhvec.supabase.co/storage/v1/object/public/menu-images/chicken-wings.jpg'
  WHEN 'Loaded Fries' THEN 'https://kwmsyubpxxomqltlhvec.supabase.co/storage/v1/object/public/menu-images/loaded-fries.jpg'
  WHEN 'Shawarma Wrap' THEN 'https://kwmsyubpxxomqltlhvec.supabase.co/storage/v1/object/public/menu-images/shawarma-wrap.jpg'
  ELSE image_url
END
WHERE name IN ('Jollof Rice & Chicken','Egusi Soup & Pounded Yam','Ofada Rice & Ayamase','Pepper Soup (Goat Meat)','Suya Platter','Caesar Salad','Chicken Alfredo Pasta','Grilled Ribeye Steak','Margherita Pizza','Beef Hotdog Combo','Classic Cheeseburger','Crispy Chicken Wings (8pc)','Loaded Fries','Shawarma Wrap');