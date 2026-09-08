import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MenuItem, MenuItemOptionValue, MenuItemAddon, Restaurant } from '../Types';

export interface CartItem {
    id: string; // unique item instance id: `${menuItem.id}-${optionsHash}`
    menuItem: MenuItem;
    quantity: number;
    selectedOptions: {
        optionName: string;
        valueName: string;
        price: number;
    }[];
    selectedAddons: MenuItemAddon[];
    notes?: string;
    unitPrice: number;
    totalPrice: number;
}

interface CartState {
    restaurant: Restaurant | null;
    items: CartItem[];
    studentDiscountApplied: boolean;
    studentDiscountPercentage: number;
    isCartOpen: boolean;
    
    // Actions
    addItem: (
        item: MenuItem,
        restaurant: Restaurant,
        quantity?: number,
        selectedOptions?: { optionName: string; valueName: string; price: number }[],
        selectedAddons?: MenuItemAddon[],
        notes?: string
    ) => boolean; // returns false if conflict with existing restaurant
    
    removeItem: (itemId: string) => void;
    updateQuantity: (itemId: string, quantity: number) => void;
    clearCart: () => void;
    
    setStudentDiscount: (percentage: number) => void;
    setIsCartOpen: (open: boolean) => void;
    openCart: () => void;
    closeCart: () => void;
    
    // Calculations
    getSubtotal: () => number;
    getStudentDiscountAmount: () => number;
    getDeliveryFee: () => number;
    getTotal: () => number;
    getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            restaurant: null,
            items: [],
            studentDiscountApplied: false,
            studentDiscountPercentage: 0,
            isCartOpen: false,

            setIsCartOpen: (isCartOpen: boolean) => set({ isCartOpen }),
            openCart: () => set({ isCartOpen: true }),
            closeCart: () => set({ isCartOpen: false }),

            addItem: (
                item: MenuItem,
                restaurant: Restaurant,
                quantity = 1,
                selectedOptions = [],
                selectedAddons = [],
                notes = ''
            ) => {
                const currentRestaurant = get().restaurant;

                // Single restaurant policy
                if (currentRestaurant && currentRestaurant.id !== restaurant.id) {
                    return false; // Signals caller to confirm reset
                }

                const optionsPrice = selectedOptions.reduce((acc, opt) => acc + (Number(opt.price) || 0), 0);
                const addonsPrice = selectedAddons.reduce((acc, add) => acc + (Number(add.price) || 0), 0);
                const basePrice = Number(item.effective_price ?? item.discount_price ?? item.price);
                const unitPrice = basePrice + optionsPrice + addonsPrice;

                // Create a deterministic key for the specific configuration
                const optionsKey = selectedOptions
                    .map((o) => `${o.optionName}:${o.valueName}`)
                    .sort()
                    .join('|');
                const addonsKey = selectedAddons
                    .map((a) => a.id)
                    .sort()
                    .join('|');
                const itemKey = `${item.id}_${optionsKey}_${addonsKey}_${notes.trim()}`;

                const existingIndex = get().items.findIndex((i) => i.id === itemKey);

                if (existingIndex > -1) {
                    const updatedItems = [...get().items];
                    const existingItem = updatedItems[existingIndex];
                    const newQty = existingItem.quantity + quantity;
                    updatedItems[existingIndex] = {
                        ...existingItem,
                        quantity: newQty,
                        totalPrice: unitPrice * newQty,
                    };
                    set({
                        restaurant,
                        items: updatedItems,
                        studentDiscountPercentage: Number(restaurant.student_discount_percentage) || 0,
                    });
                } else {
                    const newItem: CartItem = {
                        id: itemKey,
                        menuItem: item,
                        quantity,
                        selectedOptions,
                        selectedAddons,
                        notes,
                        unitPrice,
                        totalPrice: unitPrice * quantity,
                    };
                    set({
                        restaurant,
                        items: [...get().items, newItem],
                        studentDiscountPercentage: Number(restaurant.student_discount_percentage) || 0,
                    });
                }

                return true;
            },

            removeItem: (itemId: string) => {
                const updatedItems = get().items.filter((i) => i.id !== itemId);
                set({
                    items: updatedItems,
                    restaurant: updatedItems.length === 0 ? null : get().restaurant,
                });
            },

            updateQuantity: (itemId: string, quantity: number) => {
                if (quantity <= 0) {
                    get().removeItem(itemId);
                    return;
                }
                const updatedItems = get().items.map((item) => {
                    if (item.id === itemId) {
                        return {
                            ...item,
                            quantity,
                            totalPrice: item.unitPrice * quantity,
                        };
                    }
                    return item;
                });
                set({ items: updatedItems });
            },

            clearCart: () => {
                set({
                    restaurant: null,
                    items: [],
                    studentDiscountApplied: false,
                    studentDiscountPercentage: 0,
                });
            },

            setStudentDiscount: (percentage: number) => {
                set({
                    studentDiscountApplied: percentage > 0,
                    studentDiscountPercentage: percentage,
                });
            },

            getSubtotal: () => {
                return get().items.reduce((sum, item) => sum + item.totalPrice, 0);
            },

            getStudentDiscountAmount: () => {
                const { studentDiscountApplied, studentDiscountPercentage } = get();
                if (!studentDiscountApplied || studentDiscountPercentage <= 0) return 0;
                const subtotal = get().getSubtotal();
                return Number(((subtotal * studentDiscountPercentage) / 100).toFixed(2));
            },

            getDeliveryFee: () => {
                const { restaurant, items } = get();
                if (items.length === 0 || !restaurant) return 0;
                return Number(restaurant.delivery_fee) || 0;
            },

            getTotal: () => {
                const subtotal = get().getSubtotal();
                const discount = get().getStudentDiscountAmount();
                const delivery = get().getDeliveryFee();
                return Math.max(0, subtotal - discount + delivery);
            },

            getItemCount: () => {
                return get().items.reduce((count, item) => count + item.quantity, 0);
            },
        }),
        {
            name: 'fatrna-cart-storage',
        }
    )
);
