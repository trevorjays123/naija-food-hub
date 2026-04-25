import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  Settings, 
  LogOut, 
  Plus, 
  Edit, 
  Trash2,
  ChevronLeft,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Truck,
  Utensils
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  delivery_address: string;
  delivery_city: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  payment_status: string;
  delivery_status: string;
  paystack_reference: string | null;
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
  category: string;
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
  
  // Menu item form
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [menuForm, setMenuForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "nigerian",
    image_url: "",
    available: true,
  });

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

  const fetchData = async () => {
    setLoading(true);
    
    // Fetch orders
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
    
    // Fetch menu items
    const { data: menuData } = await supabase
      .from('menu_items')
      .select('*')
      .order('category');
    
    if (menuData) setMenuItems(menuData);
    
    setLoading(false);
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ delivery_status: newStatus })
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
      category: menuForm.category,
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
        .insert(itemData);
      
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
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-brand-accent" />
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 mx-auto text-brand-primary/20 mb-4" />
                <h3 className="font-display text-xl font-semibold">No orders yet</h3>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-mono font-semibold">#{order.id.slice(0, 8).toUpperCase()}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              order.payment_status === 'paid' ? 'bg-green-100 text-green-700' :
                              order.payment_status === 'pending' ? 'bg-amber-100 text-amber-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {order.payment_status}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{order.customer_name}</p>
                          <p className="text-sm text-muted-foreground">{order.customer_phone}</p>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-display text-xl font-bold text-brand-accent">₦{order.total.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      
                      <Separator className="my-4" />
                      
                      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Status:</span>
                          <Select 
                            value={order.delivery_status} 
                            onValueChange={(value) => handleUpdateOrderStatus(order.id, value)}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {statusOptions.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="text-sm text-muted-foreground">
                          {order.order_items.length} item{order.order_items.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
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
                          onValueChange={(v) => setMenuForm({...menuForm, category: v})}
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
                      <Label>Image URL (optional)</Label>
                      <Input 
                        value={menuForm.image_url} 
                        onChange={(e) => setMenuForm({...menuForm, image_url: e.target.value})}
                        placeholder="https://..."
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
    </div>
  );
}
