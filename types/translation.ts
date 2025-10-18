// types/translation.ts
export type Locale = "id" | "en";

export interface Translation {
    // Common
    common: {
        loading: string;
        error: string;
        success: string;
        minutesAgo: string;
        hoursAgo: string;
        daysAgo: string;
        yes: string;
        no: string;
        cancel: string;
        confirm: string;
        save: string;
        delete: string;
        edit: string;
        view: string;
    };

    // Navigation
    nav: {
        home: string;
        products: string;
        newProducts: string;
        specialPromo: string;
        about: string;
        contact: string;
    };

    // Search
    search: {
        placeholder: string;
        typeToSearch: string;
        noResults: string;
        pages: string;
        products: string;
    };

    // Auth
    auth: {
        login: string;
        signUp: string;
        logout: string;
        register: string;
        forgotPassword: string;
        resetPassword: string;
        email: string;
        password: string;
        confirmPassword: string;
        firstName: string;
        lastName: string;
        username: string;
    };

    // User Menu
    user: {
        profile: string;
        myOrders: string;
        wishlist: string;
        settings: string;
        adminDashboard: string;
        logout: string;
    };

    // Cart
    cart: {
        title: string;
        itemsInCart: string;
        subtotal: string;
        checkout: string;
        viewFullCart: string;
        addToCart: string;
        removeFromCart: string;
        emptyCart: string;
    };

    // Notifications
    notifications: {
        title: string;
        markAllRead: string;
        viewAll: string;
        orderProcessing: string;
        orderShipped: string;
        orderDelivered: string;
    };

    // Products
    products: {
        title: string;
        category: string;
        price: string;
        addToCart: string;
        outOfStock: string;
        inStock: string;
        lowStock: string;
    };

    // Footer
    footer: {
        subscribe: string;
        subscribeDesc: string;
        subscribeButton: string;
        followUs: string;
        shop: string;
        customerService: string;
        about: string;
        officialStores: string;
        paymentMethods: string;
        copyright: string;
    };
}