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
        refresh?: string;
        previous?: string;
        next?: string;
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
        // NEW KEYS
        filters: string;
        sortBy: string;
        priceRange: string;
        category: string;
        tags: string;
        promotion: string;
        availableOnly: string;
        applyFilters: string;
        clearFilters: string;
        allCategories: string;
        allTags: string;
        allPromotions: string;
        searchButton: string;
        resultsFound: string;
        showingResults: string;
        sortOptions: {
            priceLowHigh: string;
            priceHighLow: string;
            mostSold: string;
            mostViewed: string;
            newest: string;
            oldest: string;
        };
    };

    // Home Page (NEW)
    home: {
        promotionTitle: string;
        promotionProductsTitle: string;
        featuredTitle: string;
        seeAll: string;
    };

    // Product (NEW)
    product: {
        outOfStock: string;
        itemsSold: string;
        promo: string;
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

    // Profile
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

    // Admin Users
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
    productDetail: {
        stock: string;
        onlyLeftInStock: string;
        chooseColor: string;
        quantity: string;
        subtotal: string;
        addToCart: string;
        communityGallery: string;
        description: string;
        reviews: string;
        noReviewsYet: string;
        beFirstToReview: string;
        youMayAlsoLike: string;
        rating: string;
        reviewsCount: string;
    };

    cart: {
        title: string;
        itemsInCart: string;
        subtotal: string;
        checkout: string;
        viewFullCart: string;
        addToCart: string;
        removeFromCart: string;
        emptyCart: string;
        emptyMessage: string;
        clearCart: string;
    }

    adminReviews?: {
        title: string;
        description: string;
        fetchError: string;

        // Stats
        totalReviews: string;
        fiveStarReviews: string;
        withReplies: string;
        needsReply: string;

        // Filters
        searchPlaceholder: string;
        filterByRating: string;
        allRatings: string;
        filterByReply: string;
        allReplyStatus: string;
        hasReply: string;
        noReply: string;
        sortBy: string;
        sortByDate: string;
        sortByRating: string;

        // Table
        product: string;
        user: string;
        rating: string;
        comment: string;
        status: string;
        date: string;
        actions: string;
        noComment: string;
        verified: string;
        replied: string;
        pending: string;

        // Empty State
        noReviews: string;
        noReviewsDesc: string;

        // Reply Dialog
        reply: string;
        replyToReview: string;
        replyDescription: string;
        existingReplies: string;
        yourReply: string;
        replyPlaceholder: string;
        submitReply: string;
        replySuccess: string;
        replyError: string;

        // Delete Dialog
        deleteReviewTitle: string;
        deleteReviewDesc: string;
        deleteSuccess: string;
        deleteError: string;
    };

    // Admin Discussions
    adminDiscussions?: {
        title: string;
        description: string;
        fetchError: string;

        // Stats
        totalQuestions: string;
        withReplies: string;
        unanswered: string;
        totalLikes: string;

        // Filters
        searchPlaceholder: string;
        filterByReplies: string;
        allStatus: string;
        answered: string;
        sortBy: string;
        sortByDate: string;
        sortByLikes: string;

        // Table
        product: string;
        user: string;
        question: string;
        replies: string;
        likes: string;
        date: string;
        actions: string;
        view: string;

        // Empty State
        noDiscussions: string;
        noDiscussionsDesc: string;

        // Delete Dialog
        deleteTitle: string;
        deleteDesc: string;
        deleteSuccess: string;
        deleteError: string;
    };

    // Review (Public)
    review?: {
        title: string;
        writeReview: string;
        basedOn: string;
        reviews: string;
        filterByRating: string;
        allRatings: string;
        sortBy: string;
        newest: string;
        oldest: string;
        highestRating: string;
        lowestRating: string;
        verifiedPurchase: string;
        adminReply: string;
        ownerReply: string;
        noReviews: string;
        noReviewsDesc: string;
        loadMore: string;

        // Review Form
        rateProduct: string;
        yourReview: string;
        reviewPlaceholder: string;
        submitReview: string;
        submitting: string;
        minChars: string;
        maxChars: string;
        reviewSuccess: string;
        reviewError: string;

        // Pending Reviews
        pendingReviews: string;
        pendingReviewsDesc: string;
        reviewNow: string;
        noPendingReviews: string;
    };

    // Discussion (Public)
    discussion?: {
        title: string;
        askQuestion: string;
        questionPlaceholder: string;
        submitQuestion: string;
        submitting: string;
        sortBy: string;
        newest: string;
        mostLiked: string;
        reply: string;
        replies: string;
        showReplies: string;
        hideReplies: string;
        replyPlaceholder: string;
        submitReply: string;
        like: string;
        liked: string;
        adminBadge: string;
        ownerBadge: string;
        noDiscussions: string;
        noDiscussionsDesc: string;
        loadMore: string;
        questionSuccess: string;
        questionError: string;
        replySuccess: string;
        replyError: string;
        deleteSuccess: string;
        deleteError: string;
        loginToAsk: string;
        loginToReply: string;
        loginToLike: string;
    };
    notifications: {
        title: string;
        markAllRead: string;
        markAsRead: string;
        viewAll: string;
        empty: string;

        filterAll: string;
        filterUnread: string;
        filterRead: string;
        filterByType: string;
        allTypes: string;

        unreadNotifications: string;
        allCaughtUp: string;
        noNotifications: string;
        noUnread: string;
        noRead: string;
        loadMore: string;
        refreshed: string;

        deleted: string;
        deleteError: string;
        allMarkedAsRead: string;
        markAsReadError: string;
        markAllError: string;

        orderProcessing: string;
        orderShipped: string;
        orderDelivered: string;
        orderCompleted: string;
        orderCancelled: string;
        orderPaid: string;
        orderFailed: string;

        reviewReply: string;
        discussionReply: string;
        promotionStart: string;
        promotionEnd: string;
    };
}