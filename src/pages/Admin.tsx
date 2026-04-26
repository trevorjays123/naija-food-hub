import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Package, 
  LogOut, 
  Plus, 
  Edit, 
  Trash2,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Truck,
  Utensils,
  MapPin,
  Phone,
  Upload,
  X,
  ImageIcon,
  Mail,
  ChevronDown,
  ChevronUp,
  Search,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  delivery_address: string;
  delivery_city: string;
  delivery_notes: string | null;
  subtotal: number;
  delivery_fee: number;
  total: number;
  payment_status: string;
  delivery_status: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  paystack_reference: string | null;
  delivered_at: string | null;
  created_at: string;
  order_items: {
    item_name: string;
    quantity: number;
    unit_price: number;
  }[];
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'nigerian' | 'continental' | 'fastfood';
  image_url: string | null;
  available: boolean;
}

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "preparing", label: "Preparing" },
  { value: "out_for_delivery", label: "Out for Delivery" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

export default function AdminPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [activeTab, setActiveTab] = useState("orders");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [orderSearch, setOrderSearch] = useState("");
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [menuForm, setMenuForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "nigerian" as MenuItem['category'],
    image_url: "",
    available: true,
  });
  const [uploading, setUploading] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [galleryImages, setGalleryImages] = useState<{ path: string; url: string; name: string }[]>([]);

  const loadGallery = async () => {
    setGalleryLoading(true);
    const folders = ["", "nigerian", "continental", "fastfood"];
    const all: { path: string; url: string; name: string; created: string }[] = [];
    for (const folder of folders) {
      const { data, error } = await supabase.storage
        .from("menu-images")
        .list(folder, { limit: 200, sortBy: { column: "created_at", order: "desc" } });
      if (error) continue;
      for (const f of data || []) {
        // Skip subfolder placeholders (no metadata)
        if (!f.name || !f.metadata) continue;
        const path = folder ? `${folder}/${f.name}` : f.name;
        const { data: { publicUrl } } = supabase.storage.from("menu-images").getPublicUrl(path);
        all.push({ path, url: publicUrl, name: f.name, created: f.created_at || "" });
      }
    }
    all.sort((a, b) => (b.created || "").localeCompare(a.created || ""));
    setGalleryImages(all);
    setGalleryLoading(false);
  };

  const openGallery = () => {
    setGalleryOpen(true);
    loadGallery();
  };

  const selectGalleryImage = async (url: string) => {
    if (editingItem) {
      const { error } = await supabase
        .from("menu_items")
        .update({ image_url: url })
        .eq("id", editingItem.id);
      if (error) {
        toast({ title: "Update failed", description: error.message, variant: "destructive" });
        return;
      }
      fetchData();
    }
    setMenuForm((f) => ({ ...f, image_url: url }));
    setGalleryOpen(false);
    toast({ title: "Image selected" });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please select an image file.", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 5MB.", variant: "destructive" });
      return;
    }
    setUploading(true);
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const path = `${menuForm.category}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from('menu-images')
      .upload(path, file, { cacheControl: '3600', upsert: false, contentType: file.type });

    if (uploadError) {
      setUploading(false);
      toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from('menu-images').getPublicUrl(path);

    // If editing an existing item, persist immediately so image_url is updated even before Save
    if (editingItem) {
      const { error: updateError } = await supabase
        .from('menu_items')
        .update({ image_url: publicUrl })
        .eq('id', editingItem.id);
      if (updateError) {
        setUploading(false);
        toast({ title: "Update failed", description: updateError.message, variant: "destructive" });
        return;
      }
      fetchData();
    }

    setMenuForm((f) => ({ ...f, image_url: publicUrl }));
    setUploading(false);
    toast({ title: "Image uploaded" });
    e.target.value = "";
  };

  const handleImageDelete = async () => {
    if (!menuForm.image_url) return;
    if (!confirm("Remove this image?")) return;
    setUploading(true);

    // Try to remove from storage if the URL belongs to our bucket
    const marker = "/storage/v1/object/public/menu-images/";
    const idx = menuForm.image_url.indexOf(marker);
    if (idx !== -1) {
      const path = decodeURIComponent(menuForm.image_url.slice(idx + marker.length));
      const { error: removeError } = await supabase.storage.from('menu-images').remove([path]);
      if (removeError) {
        // Non-fatal: continue clearing image_url even if file is already gone
        console.warn("Storage remove failed:", removeError.message);
      }
    }

    if (editingItem) {
      const { error: updateError } = await supabase
        .from('menu_items')
        .update({ image_url: null })
        .eq('id', editingItem.id);
      if (updateError) {
        setUploading(false);
        toast({ title: "Update failed", description: updateError.message, variant: "destructive" });
        return;
      }
      fetchData();
    }

    setMenuForm((f) => ({ ...f, image_url: "" }));
    setUploading(false);
    toast({ title: "Image removed" });
  };

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);
      
      if (!roles?.some(r => r.role === 'admin')) {
        navigate("/");
        toast({
          title: "Access denied",
          description: "You don't have permission to access this page.",
          variant: "destructive",
        });
        return;
      }
      
      setIsAdmin(true);
      fetchData();
    };
    
    checkAdmin();
  }, [navigate, toast]);

  // Realtime updates for incoming orders + status changes
  useEffect(() => {
    if (!isAdmin) return;
    const channel = supabase
      .channel('admin-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchData();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin]);

  const toggleExpand = (id: string) => {
    setExpandedOrders((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const fetchData = async () => {
    setLoading(true);
    
    const { data: ordersData } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          item_name,
          quantity,
          unit_price
        )
      `)
      .order('created_at', { ascending: false });
    
    if (ordersData) setOrders(ordersData as Order[]);
    
    const { data: menuData } = await supabase
      .from('menu_items')
      .select('*')
      .order('category');
    
    if (menuData) setMenuItems(menuData as MenuItem[]);
    
    setLoading(false);
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ delivery_status: newStatus as Order['delivery_status'] })
      .eq('id', orderId);
    
    if (error) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Order status updated" });
      fetchData();
    }
  };

  const handleSaveMenuItem = async () => {
    const itemData = {
      name: menuForm.name,
      description: menuForm.description,
      price: parseFloat(menuForm.price),
      category: menuForm.category as MenuItem['category'],
      image_url: menuForm.image_url || null,
      available: menuForm.available,
    };

    if (editingItem) {
      const { error } = await supabase
        .from('menu_items')
        .update(itemData)
        .eq('id', editingItem.id);
      
      if (error) {
        toast({ title: "Update failed", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Menu item updated" });
      }
    } else {
      const { error } = await supabase
        .from('menu_items')
        .insert([itemData]);
      
      if (error) {
        toast({ title: "Create failed", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Menu item created" });
      }
    }
    
    setEditingItem(null);
    setMenuForm({ name: "", description: "", price: "", category: "nigerian", image_url: "", available: true });
    fetchData();
  };

  const handleDeleteMenuItem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    
    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', id);
    
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Menu item deleted" });
      fetchData();
    }
  };

  const openEditDialog = (item: MenuItem) => {
    setEditingItem(item);
    setMenuForm({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      image_url: item.image_url || "",
      available: item.available,
    });
  };

  if (!isAdmin && loading) {
    return (
      <div className="min-h-screen bg-brand-secondary flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-secondary">
      <div className="bg-brand-primary text-brand-secondary py-4 px-6">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-accent flex items-center justify-center">
                <span className="text-brand-primary font-display font-bold">TK</span>
              </div>
              <span className="font-display font-semibold">Taste Kitchen</span>
            </Link>
            <span className="text-brand-secondary/50">|</span>
            <span className="text-brand-accent font-semibold">Admin Dashboard</span>
          </div>
          <Button variant="ghost" className="text-brand-secondary hover:text-brand-secondary hover:bg-brand-secondary/10" onClick={() => supabase.auth.signOut().then(() => navigate("/"))}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
      
      <div className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-8">
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="menu" className="flex items-center gap-2">
              <Utensils className="w-4 h-4" />
              Menu Items
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="orders">
            <OrdersPanel
              orders={orders}
              loading={loading}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              paymentFilter={paymentFilter}
              setPaymentFilter={setPaymentFilter}
              orderSearch={orderSearch}
              setOrderSearch={setOrderSearch}
              expandedOrders={expandedOrders}
              toggleExpand={toggleExpand}
              onUpdateStatus={handleUpdateOrderStatus}
              onRefresh={fetchData}
            />
          </TabsContent>
          
          <TabsContent value="menu">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display text-2xl font-bold">Menu Items</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-brand-accent text-brand-primary hover:bg-brand-accent/90">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>{editingItem ? 'Edit Menu Item' : 'Add Menu Item'}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input 
                        value={menuForm.name} 
                        onChange={(e) => setMenuForm({...menuForm, name: e.target.value})}
                        placeholder="Jollof Rice"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Input 
                        value={menuForm.description} 
                        onChange={(e) => setMenuForm({...menuForm, description: e.target.value})}
                        placeholder="Brief description..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Price (₦)</Label>
                        <Input 
                          type="number"
                          value={menuForm.price} 
                          onChange={(e) => setMenuForm({...menuForm, price: e.target.value})}
                          placeholder="4500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Category</Label>
                        <Select 
                          value={menuForm.category} 
                          onValueChange={(v) => setMenuForm({...menuForm, category: v as 'nigerian' | 'continental' | 'fastfood'})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="nigerian">Nigerian</SelectItem>
                            <SelectItem value="continental">Continental</SelectItem>
                            <SelectItem value="fastfood">Fast Food</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Item Image</Label>
                      {menuForm.image_url && (
                        <div className="relative w-full h-40 rounded-lg overflow-hidden bg-brand-primary/5 group">
                          <img src={menuForm.image_url} alt="Preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={handleImageDelete}
                            disabled={uploading}
                            aria-label="Remove image"
                            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-md hover:opacity-90 disabled:opacity-50"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <label className="flex-1">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageUpload}
                            disabled={uploading}
                          />
                          <div className={`flex items-center justify-center gap-2 px-4 py-2 border border-dashed rounded-md cursor-pointer hover:bg-brand-primary/5 transition ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                            {uploading ? (
                              <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>
                            ) : (
                              <><Upload className="w-4 h-4" /> {menuForm.image_url ? 'Replace Image' : 'Upload Image'}</>
                            )}
                          </div>
                        </label>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={openGallery}
                          disabled={uploading}
                          className="gap-2"
                        >
                          <ImageIcon className="w-4 h-4" />
                          Gallery
                        </Button>
                      </div>
                      <Input
                        value={menuForm.image_url}
                        onChange={(e) => setMenuForm({ ...menuForm, image_url: e.target.value })}
                        placeholder="Or paste image URL..."
                        className="text-xs"
                      />
                    </div>
                    <Button 
                      className="w-full bg-brand-accent text-brand-primary hover:bg-brand-accent/90"
                      onClick={handleSaveMenuItem}
                      disabled={!menuForm.name || !menuForm.price}
                    >
                      {editingItem ? 'Update Item' : 'Add Item'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            {menuItems.length === 0 ? (
              <div className="text-center py-12">
                <Utensils className="w-16 h-16 mx-auto text-brand-primary/20 mb-4" />
                <h3 className="font-display text-xl font-semibold">No menu items</h3>
                <p className="text-muted-foreground">Add your first menu item to get started.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {menuItems.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="w-20 h-20 bg-brand-primary/5 rounded-lg flex-shrink-0 flex items-center justify-center">
                          {item.image_url ? (
                            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            <Utensils className="w-8 h-8 text-brand-primary/30" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-display font-semibold truncate">{item.name}</h3>
                            <span className={`px-2 py-0.5 rounded-full text-xs ${item.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {item.available ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground capitalize">{item.category}</p>
                          <p className="text-brand-accent font-bold mt-1">₦{item.price.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => openEditDialog(item)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteMenuItem(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={galleryOpen} onOpenChange={setGalleryOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Image Gallery</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto py-4">
            {galleryLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-brand-accent" />
              </div>
            ) : galleryImages.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>No images in storage yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {galleryImages.map((img) => {
                  const selected = menuForm.image_url === img.url;
                  return (
                    <button
                      key={img.path}
                      type="button"
                      onClick={() => selectGalleryImage(img.url)}
                      className={`group relative aspect-square rounded-lg overflow-hidden border-2 transition ${selected ? 'border-brand-accent ring-2 ring-brand-accent/40' : 'border-transparent hover:border-brand-accent/60'}`}
                    >
                      <img src={img.url} alt={img.name} className="w-full h-full object-cover" loading="lazy" />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                        <p className="text-[10px] text-white truncate">{img.path}</p>
                      </div>
                      {selected && (
                        <div className="absolute top-1 right-1 w-6 h-6 rounded-full bg-brand-accent text-brand-primary flex items-center justify-center">
                          <CheckCircle className="w-4 h-4" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const statusBadgeStyles: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  preparing: "bg-purple-100 text-purple-700",
  out_for_delivery: "bg-indigo-100 text-indigo-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const statusIcons: Record<string, JSX.Element> = {
  pending: <Clock className="w-3.5 h-3.5" />,
  confirmed: <CheckCircle className="w-3.5 h-3.5" />,
  preparing: <Utensils className="w-3.5 h-3.5" />,
  out_for_delivery: <Truck className="w-3.5 h-3.5" />,
  delivered: <CheckCircle className="w-3.5 h-3.5" />,
  cancelled: <XCircle className="w-3.5 h-3.5" />,
};

interface OrdersPanelProps {
  orders: Order[];
  loading: boolean;
  statusFilter: string;
  setStatusFilter: (v: string) => void;
  paymentFilter: string;
  setPaymentFilter: (v: string) => void;
  orderSearch: string;
  setOrderSearch: (v: string) => void;
  expandedOrders: Set<string>;
  toggleExpand: (id: string) => void;
  onUpdateStatus: (id: string, status: string) => void;
  onRefresh: () => void;
}

function OrdersPanel({
  orders,
  loading,
  statusFilter,
  setStatusFilter,
  paymentFilter,
  setPaymentFilter,
  orderSearch,
  setOrderSearch,
  expandedOrders,
  toggleExpand,
  onUpdateStatus,
  onRefresh,
}: OrdersPanelProps) {
  const stats = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return {
      total: orders.length,
      active: orders.filter(o => !['delivered', 'cancelled'].includes(o.delivery_status)).length,
      delivered: orders.filter(o => o.delivery_status === 'delivered').length,
      todayRevenue: orders
        .filter(o => o.payment_status === 'paid' && new Date(o.created_at) >= today)
        .reduce((sum, o) => sum + Number(o.total), 0),
    };
  }, [orders]);

  const filtered = useMemo(() => {
    const q = orderSearch.trim().toLowerCase();
    return orders.filter(o => {
      if (statusFilter !== 'all' && o.delivery_status !== statusFilter) return false;
      if (paymentFilter !== 'all' && o.payment_status !== paymentFilter) return false;
      if (q) {
        const hay = `${o.id} ${o.customer_name} ${o.customer_phone} ${o.customer_email}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [orders, statusFilter, paymentFilter, orderSearch]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-brand-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4">
          <p className="text-xs uppercase text-muted-foreground">Total Orders</p>
          <p className="font-display text-2xl font-bold">{stats.total}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs uppercase text-muted-foreground">Active</p>
          <p className="font-display text-2xl font-bold text-amber-600">{stats.active}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs uppercase text-muted-foreground">Delivered</p>
          <p className="font-display text-2xl font-bold text-green-600">{stats.delivered}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs uppercase text-muted-foreground">Today's Revenue</p>
          <p className="font-display text-2xl font-bold text-brand-accent">₦{stats.todayRevenue.toLocaleString()}</p>
        </CardContent></Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={orderSearch}
            onChange={(e) => setOrderSearch(e.target.value)}
            placeholder="Search by order #, name, phone or email"
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-[200px]"><SelectValue placeholder="Delivery status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {statusOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={paymentFilter} onValueChange={setPaymentFilter}>
          <SelectTrigger className="w-full md:w-[160px]"><SelectValue placeholder="Payment" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All payments</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={onRefresh} aria-label="Refresh">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-16 h-16 mx-auto text-brand-primary/20 mb-4" />
          <h3 className="font-display text-xl font-semibold">No orders match your filters</h3>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => {
            const expanded = expandedOrders.has(order.id);
            const created = new Date(order.created_at);
            return (
              <Card key={order.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="font-mono font-semibold">#{order.id.slice(0, 8).toUpperCase()}</span>
                        <Badge className={`${statusBadgeStyles[order.delivery_status]} gap-1 capitalize`}>
                          {statusIcons[order.delivery_status]}
                          {order.delivery_status.replace(/_/g, ' ')}
                        </Badge>
                        <Badge className={
                          order.payment_status === 'paid' ? 'bg-green-100 text-green-700' :
                          order.payment_status === 'pending' ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }>
                          {order.payment_status}
                        </Badge>
                        {order.delivered_at && (
                          <Badge className="bg-emerald-100 text-emerald-700 gap-1">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Delivered {new Date(order.delivered_at).toLocaleString()}
                          </Badge>
                        )}
                      </div>
                      <p className="font-medium">{order.customer_name}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {order.customer_phone}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {order.delivery_address}, {order.delivery_city}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-xl font-bold text-brand-accent">₦{Number(order.total).toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{created.toLocaleDateString()} · {created.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      <p className="text-xs text-muted-foreground mt-1">{order.order_items?.length ?? 0} item{(order.order_items?.length ?? 0) !== 1 ? 's' : ''}</p>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Update status:</span>
                      <Select value={order.delivery_status} onValueChange={(v) => onUpdateStatus(order.id, v)}>
                        <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {statusOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => toggleExpand(order.id)} className="gap-1">
                      {expanded ? <>Hide details <ChevronUp className="w-4 h-4" /></> : <>View details <ChevronDown className="w-4 h-4" /></>}
                    </Button>
                  </div>

                  {expanded && (
                    <div className="mt-4 pt-4 border-t space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-semibold mb-1">Contact</p>
                          <p className="text-muted-foreground flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {order.customer_email}</p>
                          <p className="text-muted-foreground flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {order.customer_phone}</p>
                        </div>
                        <div>
                          <p className="font-semibold mb-1">Delivery</p>
                          <p className="text-muted-foreground">{order.delivery_address}</p>
                          <p className="text-muted-foreground">{order.delivery_city}</p>
                          {order.delivery_notes && <p className="text-muted-foreground italic mt-1">"{order.delivery_notes}"</p>}
                        </div>
                      </div>

                      <div>
                        <p className="font-semibold mb-2 text-sm">Items</p>
                        <div className="space-y-1.5">
                          {order.order_items?.map((it, i) => (
                            <div key={i} className="flex justify-between text-sm">
                              <span>{it.quantity}× {it.item_name}</span>
                              <span className="font-medium">₦{(Number(it.unit_price) * it.quantity).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                        <Separator className="my-3" />
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>₦{Number(order.subtotal).toLocaleString()}</span></div>
                          <div className="flex justify-between text-muted-foreground"><span>Delivery fee</span><span>₦{Number(order.delivery_fee).toLocaleString()}</span></div>
                          <div className="flex justify-between font-semibold"><span>Total</span><span className="text-brand-accent">₦{Number(order.total).toLocaleString()}</span></div>
                        </div>
                      </div>

                      {order.paystack_reference && (
                        <p className="text-xs text-muted-foreground">Paystack ref: <span className="font-mono">{order.paystack_reference}</span></p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

