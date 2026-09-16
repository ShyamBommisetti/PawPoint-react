import { NavLink, useNavigate } from "react-router-dom";
import { PawPrint, ShoppingCart, Package, Store, LogOut } from "lucide-react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function AppHeader() {
  const { user, logout, cartCount } = useStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    cn(
      "flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-colors",
      isActive
        ? "bg-primary text-primary-foreground"
        : "text-foreground/80 hover:bg-secondary",
    );

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4">
        <NavLink to="/store" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <PawPrint className="h-5 w-5" />
          </span>
          <span className="font-display text-xl font-semibold tracking-tight">PawPoint</span>
        </NavLink>

        <nav className="ml-auto flex items-center gap-1 sm:gap-2">
          <NavLink to="/store" className={linkCls}>
            <Store className="h-4 w-4" />
            <span className="hidden sm:inline">Store</span>
          </NavLink>
          <NavLink to="/inventory" className={linkCls}>
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">Inventory</span>
          </NavLink>
          <NavLink to="/cart" className={({ isActive }) => cn(linkCls({ isActive }), "relative")}>
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden sm:inline">Cart</span>
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-xs font-bold text-accent-foreground">
                {cartCount}
              </span>
            )}
          </NavLink>
          <div className="mx-1 hidden h-6 w-px bg-border sm:block" />
          <span className="hidden max-w-40 truncate text-xs text-muted-foreground md:inline">
            {user?.identifier}
          </span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-destructive/10 hover:text-destructive"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </nav>
      </div>
    </header>
  );
}
