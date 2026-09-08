// =====================================================
// فطرنا شكراً — Global TypeScript Types
// =====================================================

export interface User {
    id: number;
    name: string;
    email: string;
    phone?: string;
    role: UserRole;
    is_active: boolean;
    avatar?: string;
    created_at: string;
    updated_at: string;
}

export type UserRole =
    | 'SUPER_ADMIN'
    | 'ADMIN'
    | 'PLATFORM_STAFF'
    | 'RESTAURANT_OWNER'
    | 'RESTAURANT_STAFF'
    | 'DELIVERY_DRIVER'
    | 'CUSTOMER';

export type RestaurantStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING';
export type CommissionType = 'PERCENTAGE' | 'FIXED' | 'SUBSCRIPTION' | 'HYBRID' | 'NONE';

export interface Restaurant {
    id: number;
    name: string;
    slug: string;
    logo?: string;
    cover_image?: string;
    description?: string;
    phone?: string;
    whatsapp?: string;
    email?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    status: RestaurantStatus;
    opening_time?: string;
    closing_time?: string;
    minimum_order_amount: number;
    delivery_fee: number;
    estimated_delivery_time?: number;
    student_discount_percentage: number;
    commission_type: CommissionType;
    commission_percentage: number;
    monthly_subscription_fee: number;
    billing_cycle?: string;
    payment_due_date?: string;
    is_open?: boolean;
    created_at: string;
    updated_at: string;
    categories?: Category[];
    offers?: Offer[];
}

export interface Category {
    id: number;
    restaurant_id: number;
    name: string;
    slug: string;
    description?: string;
    image?: string;
    sort_order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    menu_items?: MenuItem[];
}

export interface MenuItem {
    id: number;
    restaurant_id: number;
    category_id: number;
    name: string;
    description?: string;
    price: number;
    discount_price?: number;
    effective_price: number;
    image?: string;
    is_available: boolean;
    is_featured: boolean;
    preparation_time?: number;
    sort_order: number;
    created_at: string;
    updated_at: string;
    options?: MenuItemOption[];
    addons?: MenuItemAddon[];
    category?: Category;
}

export interface MenuItemOption {
    id: number;
    menu_item_id: number;
    name: string;
    is_required: boolean;
    max_selections: number;
    sort_order: number;
    values: MenuItemOptionValue[];
}

export interface MenuItemOptionValue {
    id: number;
    option_id: number;
    name: string;
    price: number;
    is_default: boolean;
    sort_order: number;
}

export interface MenuItemAddon {
    id: number;
    menu_item_id: number;
    name: string;
    price: number;
    is_available: boolean;
    sort_order: number;
}

export interface Offer {
    id: number;
    restaurant_id: number;
    title: string;
    description?: string;
    original_price: number;
    discount_price: number;
    discount_percentage: number;
    image?: string;
    is_active: boolean;
    start_date?: string;
    end_date?: string;
    created_at: string;
    updated_at: string;
    restaurant?: Restaurant;
}

export type OrderStatus =
    | 'PENDING'
    | 'CONFIRMED'
    | 'PREPARING'
    | 'READY_FOR_PICKUP'
    | 'ASSIGNED_TO_DRIVER'
    | 'OUT_FOR_DELIVERY'
    | 'DELIVERED'
    | 'CANCELLED'
    | 'REJECTED'
    | 'FAILED'
    | 'REFUNDED';

export type PaymentMethod = 'CASH_ON_DELIVERY' | 'CARD' | 'WALLET';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export interface Order {
    id: number;
    order_number: string;
    customer_id: number;
    restaurant_id: number;
    assigned_delivery_id?: number;
    status: OrderStatus;
    payment_status: PaymentStatus;
    payment_method: PaymentMethod;
    subtotal: number;
    discount_amount: number;
    student_discount_amount: number;
    delivery_fee: number;
    service_fee: number;
    total_amount: number;
    platform_commission_amount: number;
    address: string;
    latitude?: number;
    longitude?: number;
    customer_notes?: string;
    restaurant_notes?: string;
    delivered_at?: string;
    created_at: string;
    updated_at: string;
    customer?: Customer;
    restaurant?: Restaurant;
    items?: OrderItem[];
    deliveryDriver?: DeliveryDriver;
    statusHistories?: OrderStatusHistory[];
}

export interface OrderItem {
    id: number;
    order_id: number;
    menu_item_id: number;
    name: string;
    unit_price: number;
    quantity: number;
    total_price: number;
    selected_options?: Array<{ option_name: string; value_name: string; price: number }>;
    selected_addons?: Array<{ name: string; price: number }>;
    notes?: string;
}

export interface OrderStatusHistory {
    id: number;
    order_id: number;
    status: OrderStatus;
    notes?: string;
    changed_by_user_id?: number;
    created_at: string;
}

export interface Customer {
    id: number;
    user_id: number;
    name?: string;
    email?: string;
    phone?: string;
    is_student?: boolean;
    university_name?: string;
    university_id_number?: string;
    university_id_card_image?: string;
    student_status?: 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED' | string;
    student_verification_status?: 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED';
    student_verified_at?: string;
    rejection_reason?: string;
    created_at?: string;
    user?: User;
    addresses?: CustomerAddress[];
}

export interface CustomerAddress {
    id: number;
    customer_id: number;
    label: string;
    address: string;
    latitude?: number;
    longitude?: number;
    is_default: boolean;
}

export interface DeliveryDriver {
    id: number;
    user_id: number;
    restaurant_id: number;
    name: string;
    phone?: string;
    profile_image?: string;
    is_active: boolean;
    availability_status: 'AVAILABLE' | 'BUSY' | 'OFFLINE';
    created_at: string;
    user?: User;
    restaurant?: Restaurant;
}

export interface FinancialRecord {
    id: number;
    restaurant_id: number;
    order_id?: number;
    type: string;
    amount: number;
    status: 'PENDING' | 'COLLECTED' | 'CANCELLED';
    description?: string;
    created_at: string;
}

export interface Invoice {
    id: number;
    invoice_number: string;
    invoice_type?: string;
    restaurant_id: number;
    period_start?: string;
    period_end?: string;
    issue_date: string;
    due_date: string;
    subtotal: number;
    tax_amount: number;
    total_amount: number;
    paid_amount: number;
    status: 'DRAFT' | 'ISSUED' | 'PAID' | 'PARTIALLY_PAID' | 'OVERDUE' | 'CANCELLED';
    notes?: string;
    created_at: string;
    restaurant?: Restaurant;
    items?: InvoiceItem[];
}

export interface InvoiceItem {
    id: number;
    invoice_id: number;
    description: string;
    quantity: number;
    unit_price: number;
    total_price: number;
}

export interface Collection {
    id: number;
    restaurant_id: number;
    invoice_id?: number;
    amount: number;
    payment_method: string;
    reference_number?: string;
    notes?: string;
    collection_date: string;
    collected_by_user_id: number;
    created_at: string;
    restaurant?: Restaurant;
}

export interface Expense {
    id: number;
    expense_category_id: number;
    amount: number;
    description?: string;
    expense_date: string;
    receipt_file?: string;
    created_by: number;
    created_at: string;
    category?: ExpenseCategory;
}

export interface ExpenseCategory {
    id: number;
    name: string;
    description?: string;
}

export interface SystemSetting {
    id: number;
    key: string;
    value: string | null;
    type: 'string' | 'boolean' | 'integer' | 'json';
    group: string;
    label: string;
    description?: string;
}

export interface ActivityLog {
    id: number;
    user_id?: number;
    action: string;
    entity_type?: string;
    entity_id?: number;
    old_values?: Record<string, unknown>;
    new_values?: Record<string, unknown>;
    ip_address?: string;
    user_agent?: string;
    created_at: string;
    user?: User;
}

// =====================================================
// Cart Types (client-side state)
// =====================================================
export interface CartItem {
    menuItemId: number;
    name: string;
    unitPrice: number;
    quantity: number;
    image?: string;
    selectedOptions: Array<{ optionValueId: number; optionName: string; valueName: string; price: number }>;
    selectedAddons: Array<{ addonId: number; name: string; price: number }>;
    notes?: string;
}

export interface Cart {
    restaurantId: number | null;
    restaurantName: string;
    restaurantSlug: string;
    items: CartItem[];
}

export interface SharedProps extends Record<string, unknown> {
    auth: {
        user: User | null;
        role?: UserRole;
        permissions: string[];
    };
    flash: {
        success?: string;
        error?: string;
        warning?: string;
        info?: string;
    };
    app_name: string;
    app_slogan?: string;
    errors: Record<string, string>;
}

export type SharedInertiaProps = SharedProps;

// =====================================================
// Paginated Response
// =====================================================
export interface Paginated<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
}

export type PaginatedResponse<T> = Paginated<T>;

// =====================================================
// Dashboard Stats
// =====================================================
export interface AdminDashboardStats {
    total_restaurants: number;
    active_restaurants: number;
    suspended_restaurants: number;
    total_customers: number;
    total_orders: number;
    orders_today: number;
    revenue_today: number;
    revenue_this_month: number;
    platform_profit: number;
    total_expenses: number;
    outstanding_collections: number;
    overdue_invoices: number;
    revenue_chart: Array<{ date: string; revenue: number; orders: number }>;
    profit_chart: Array<{ month: string; revenue: number; expenses: number; profit: number }>;
}

export interface RestaurantDashboardStats {
    orders_today: number;
    pending_orders: number;
    preparing_orders: number;
    ready_orders: number;
    delivered_orders: number;
    cancelled_orders: number;
    revenue_today: number;
    revenue_week: number;
    revenue_month: number;
    top_selling_items: Array<{ name: string; quantity: number; revenue: number }>;
    active_drivers: number;
    recent_orders: Order[];
}

export interface DeliveryDashboardStats {
    assigned_orders: Order[];
    completed_today: number;
    active_order?: Order;
}
