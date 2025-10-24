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
        titleLogin: string;
        signUp: string;
        logout: string;
        titleRegister: string;
        forgotPassword: string;
        resetPassword: string;
        email: string;
        password: string;
        confirmPassword: string;
        firstName: string;
        lastName: string;
        username: string;
        login: {
            title: string;
            description: string;
            emailLabel: string;
            emailPlaceholder: string;
            passwordLabel: string;
            passwordPlaceholder: string;
            forgotPassword: string;
            signingIn: string;
            signInButton: string;
            noAccount: string;
            signUpLink: string;
            registrationSuccess: string;
            redirectMessage: string;
            loginSuccess: string;
            loginFailed: string;
        };
        register: {
            title: string;
            description: string;
            firstNameLabel: string;
            lastNameLabel: string;
            usernameLabel: string;
            emailLabel: string;
            phoneLabel: string;
            countryLabel: string;
            addressLabel: string;
            passwordLabel: string;
            confirmPasswordLabel: string;
            creatingAccount: string;
            createAccountButton: string;
            hasAccount: string;
            signInLink: string;
            passwordsDoNotMatch: string;
            accountCreated: string;
            registrationFailed: string;
            passwordRequirements: {
                title: string;
                length: string;
                uppercase: string;
                lowercase: string;
                number: string;
                special: string;
            };
            placeholders: {
                firstName: string;
                lastName: string;
                username: string;
                email: string;
                phone: string;
                country: string;
                address: string;
                password: string;
            };
        };
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

    profile: {
        title: string;
        description: string;
        tabs: {
            profile: {
                title: string;
                description: string;
            };
            password: {
                title: string;
                description: string;
            };
        };
        fields: {
            firstName: string;
            lastName: string;
            username: string;
            email: string;
            phone: string;
            country: string;
            address: string;
            currentPassword: string;
            newPassword: string;
            confirmNewPassword: string;
        };
        placeholders: {
            phone: string;
            country: string;
            address: string;
            currentPassword: string;
            newPassword: string;
            confirmNewPassword: string;
        };
        buttons: {
            changePhoto: string;
            uploadPhoto: string;
            cancel: string;
            remove: string;
            updateProfile: string;
            updating: string;
            updatePassword: string;
        };
        messages: {
            confirmDeleteImage: string;
            imageSelected: string;
            clickToSave: string;
            updateSuccess: string;
            updateError: string;
            deleteImageSuccess: string;
            deleteImageError: string;
            passwordsDoNotMatch: string;
            updatePasswordSuccess: string;
            updatePasswordError: string;
        };
        passwordRequirements: {
            title: string;
            length: string;
            uppercase: string;
            lowercase: string;
            number: string;
            special: string;
        };
        imageInfo: string;
    };

    adminUsers: {
        title: string;
        description: string;
        searchPlaceholder: string;
        searchButton: string;
        filterByRole: string;
        allRoles: string;
        addUser: string;
        tableHeaders: {
            user: string;
            email: string;
            role: string;
            status: string;
            created: string;
            actions: string;
        };
        noUsersFound: string;
        loading: string;
        active: string;
        suspended: string;
        confirmDelete: string;
        confirmDeleteDesc: string;
        deleteButton: string;
        deleting: string;
        changeRoleTitle: string;
        changeRoleDesc: string;
        selectRole: string;
        changeRoleButton: string;
        changing: string;
        suspendTitle: string;
        activateTitle: string;
        suspendDesc: string;
        activateDesc: string;
        reasonLabel: string;
        reasonPlaceholder: string;
        suspendButton: string;
        activateButton: string;
        processing: string;
        confirmForceLogout: string;
        successMessages: {
            deleted: string;
            roleChanged: string;
            suspended: string;
            activated: string;
            forceLogout: string;
        };
        pagination: {
            showing: string;
            of: string;
            users: string;
            previous: string;
            next: string;
        };
    };
}