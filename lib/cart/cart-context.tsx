"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  type ReactNode,
} from "react";

export type CartItem = {
  platilloId: string;
  nombre: string;
  precio: number;
  cantidad: number;
  descripcion?: string;
  imagenUrl?: string;
};

export type SucursalInfo = {
  id: string;
  nombre: string;
};

type CartContextType = {
  items: CartItem[];
  sucursal: SucursalInfo | null;
  totalItems: number;
  subtotal: number;
  total: number;
  agregarPlatillo: (platillo: Omit<CartItem, "cantidad">, sucursal?: SucursalInfo) => void;
  incrementarCantidad: (platilloId: string) => void;
  disminuirCantidad: (platilloId: string) => void;
  actualizarCantidad: (platilloId: string, cantidad: number) => void;
  eliminarPlatillo: (platilloId: string) => void;
  vaciarCarrito: () => void;
  setSucursal: (sucursal: SucursalInfo) => void;
};

const CartContext = createContext<CartContextType | null>(null);

const STORAGE_KEY = "noodlevolt_cart";
const DEFAULT_SUCURSAL: SucursalInfo = {
  id: "sucursal-san-salvador",
  nombre: "San Salvador – Centro",
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [sucursal, setSucursalState] = useState<SucursalInfo | null>(DEFAULT_SUCURSAL);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hidratación desde localStorage en el cliente
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed.items)) {
          setItems(parsed.items);
        }
        if (parsed.sucursal) {
          setSucursalState(parsed.sucursal);
        }
      }
    } catch (e) {
      console.error("Error al cargar carrito desde localStorage:", e);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Persistencia automática a localStorage
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ items, sucursal }),
      );
    } catch (e) {
      console.error("Error al persistir carrito:", e);
    }
  }, [items, sucursal, isHydrated]);

  const agregarPlatillo = (
    platillo: Omit<CartItem, "cantidad">,
    nuevaSucursal?: SucursalInfo,
  ) => {
    if (nuevaSucursal) {
      setSucursalState(nuevaSucursal);
    }

    setItems((prev) => {
      const existente = prev.find((i) => i.platilloId === platillo.platilloId);
      if (existente) {
        return prev.map((i) =>
          i.platilloId === platillo.platilloId
            ? { ...i, cantidad: Math.min(20, i.cantidad + 1) }
            : i,
        );
      }
      return [...prev, { ...platillo, cantidad: 1 }];
    });
  };

  const incrementarCantidad = (platilloId: string) => {
    setItems((prev) =>
      prev.map((i) =>
        i.platilloId === platilloId
          ? { ...i, cantidad: Math.min(20, i.cantidad + 1) }
          : i,
      ),
    );
  };

  const disminuirCantidad = (platilloId: string) => {
    setItems((prev) =>
      prev
        .map((i) =>
          i.platilloId === platilloId ? { ...i, cantidad: i.cantidad - 1 } : i,
        )
        .filter((i) => i.cantidad > 0),
    );
  };

  const actualizarCantidad = (platilloId: string, cantidad: number) => {
    if (cantidad <= 0) {
      eliminarPlatillo(platilloId);
      return;
    }
    const valorSeguro = Math.min(20, Math.max(1, cantidad));
    setItems((prev) =>
      prev.map((i) =>
        i.platilloId === platilloId ? { ...i, cantidad: valorSeguro } : i,
      ),
    );
  };

  const eliminarPlatillo = (platilloId: string) => {
    setItems((prev) => prev.filter((i) => i.platilloId !== platilloId));
  };

  const vaciarCarrito = () => {
    setItems([]);
  };

  const setSucursal = (nuevaSucursal: SucursalInfo) => {
    setSucursalState(nuevaSucursal);
  };

  const totalItems = useMemo(
    () => items.reduce((acc, curr) => acc + curr.cantidad, 0),
    [items],
  );

  const subtotal = useMemo(
    () => items.reduce((acc, curr) => acc + curr.precio * curr.cantidad, 0),
    [items],
  );

  // En pedidos para llevar no hay propina obligatoria, el total equivale al subtotal
  const total = subtotal;

  const value = {
    items,
    sucursal,
    totalItems,
    subtotal,
    total,
    agregarPlatillo,
    incrementarCantidad,
    disminuirCantidad,
    actualizarCantidad,
    eliminarPlatillo,
    vaciarCarrito,
    setSucursal,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart debe ser utilizado dentro de un CartProvider");
  }
  return context;
}

