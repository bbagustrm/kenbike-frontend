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
        refresh?: string;
        previous?: string;
        next?: string;
        back?: string;
        close?: string;
        search?: string;
        filter?: string;
        sort?: string;
        all?: string;
        none?: string;
        select?: string;
        selected?: string;
        clear?: string;
        apply?: string;
        reset?: string;
        submit?: string;
        continue?: string;
        done?: string;
        processing?: string;
        pleaseWait?: string;
        tryAgain?: string;
        learnMore?: string;
        seeAll?: string;
        showMore?: string;
        showLess?: string;
        noData?: string;
        notFound?: string;
        required?: string;
        optional?: string;
        item?: string;
        items?: string;
        connecting?: string;
        saving?: string;
        removing?: string;
        updating?: string;
    };

    // Navigation
    nav: {
        home: string;
        products: string;
        newProducts: string;
        specialPromo: string;
        about: string;
        contact: string;
        categories?: string;
        allProducts?: string;
        viewAllProducts?: string;
        searchPlaceholder?: string;
        account?: string;
        language?: string;
        dashboard?: string;
        profile?: string;
        orders?: string;
        notifications?: string;
        logout?: string;
    };

    // Search
    search: {
        placeholder: string;
        typeToSearch: string;
        noResults: string;
        pages: string;
        products: string;
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
        allProducts?: string;
        product?: string;
        productPlural?: string;
        noProductsFound?: string;
        tryAdjustingFilters?: string;
        sortedBy?: string;
        promo?: string;
        sortOptions: {
            priceLowHigh: string;
            priceHighLow: string;
            mostSold: string;
            mostViewed: string;
            newest: string;
            oldest: string;
        };
        searching?: string;
        startTyping?: string;
        viewAllResults?: string;
        promotions?: string;
    };

    // Home Page
    home: {
        promotionTitle: string;
        promotionProductsTitle: string;
        featuredTitle: string;
        seeAll: string;
        hotDeals?: string;
        hotDealsDescription?: string;
        shopByCategory?: string;
        shopByCategoryDescription?: string;
        handpickedForYou?: string;
        noPromotionsAvailable?: string;
        noFeaturedProducts?: string;
    };

    // Product (card)
    product: {
        outOfStock: string;
        itemsSold: string;
        promo: string;
    };

    // Auth
    auth: {
        titleLogin: string;
        signUp: string;
        signIn?: string;
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
        orContinueWith?: string;
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
        verification?: {
            title: string;
            description: string;
            otpLabel: string;
            otpPlaceholder: string;
            verifying: string;
            verifyButton: string;
            resendCode: string;
            resendIn: string;
            verificationSuccess: string;
            verificationFailed: string;
            codeResent: string;
            invalidRequest?: string;
            noEmailProvided?: string;
            goToRegister?: string;
            weSentCodeTo?: string;
            codeExpiresIn?: string;
            didntReceiveCode?: string;
            sending?: string;
            redirectingToLogin?: string;
            enterCompleteCode?: string;
            emailNotFound?: string;
            invalidOrExpiredOtp?: string;
            newOtpSent?: string;
            failedToResend?: string;
        };
        google?: {
            continueWith: string;
            signUpWith: string;
            connecting: string;
        };
        completeProfile?: {
            title: string;
            welcome: string;
            signedInWithGoogle: string;
            contactInfo: string;
            contactInfoDesc: string;
            shippingAddress: string;
            shippingAddressDesc: string;
            phoneNumber: string;
            phonePlaceholder: string;
            phoneHelp: string;
            step: string;
            of: string;
            back: string;
            continue: string;
            completeProfile: string;
            saving: string;
            profileCompleted: string;
            enterPhoneNumber: string;
            phoneMinLength: string;
            selectProvinceAndLocation: string;
            enterCity: string;
            enterPostalCode: string;
            enterFullAddress: string;
            addressMinLength: string;
            failedToComplete: string;
        };
    };

    // User Menu
    user: {
        profile: string;
        myOrders: string;
        wishlist: string;
        settings: string;
        adminDashboard: string;
        ownerDashboard?: string;
        logout: string;
        dashboard?: string;
        orders?: string;
        notifications?: string;
        users?: string;
        products?: string;
        analytics?: string;
        promotions?: string;
    };

    // Products (listing)
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
        description?: string;
        returns?: string;
        privacyPolicy?: string;
        termsOfService?: string;
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
        sections?: {
            personalInfo: string;
            contactInfo: string;
            locationInfo: string;
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

    // Product Detail
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
        qna?: string;
        preOrder?: string;
        validUntil?: string;
        selectVariantFirst?: string;
        productNotFound?: string;
        productNotFoundDesc?: string;
        breadcrumb?: {
            home: string;
            product: string;
        };
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
        emptyMessage: string;
        clearCart: string;
        continueShopping?: string;
        cartEmpty?: string;
        addProductsToCheckout?: string;
        shopNow?: string;
        itemInCart?: string;
        itemsInCartPlural?: string;
        loginToCheckout?: string;
        outOfStock?: string;
        unavailable?: string;
        onlyLeftInStock?: string;
        removeItem?: string;
        unavailableItemsWarning?: string;
    };

    // Checkout
    checkout?: {
        title: string;
        description: string;
        shippingAddress: string;
        shippingAddressDesc: string;
        shippingMethod: string;
        shippingMethodDesc: string;
        paymentMethod: string;
        paymentMethodDesc: string;
        orderSummary: string;
        items: string;
        subtotal: string;
        discount: string;
        shipping: string;
        tax: string;
        total: string;
        taxIncluded: string;
        notSelected: string;
        continueToPayment: string;
        creatingOrder: string;
        pleaseCompleteAddress: string;
        pleaseSelectShipping: string;
        pleaseFixErrors: string;
        missingInfo: string;
        addressIncomplete: {
            title: string;
            description: string;
            completeButton: string;
        };
        recipient: string;
        phoneNumber: string;
        address: string;
        domestic: string;
        international: string;
        notSet: string;
        edit: string;
        shippingCalculator: {
            calculating: string;
            calculatingBest: string;
            optionsAvailable: string;
            completeAddress: string;
            noOptions: string;
            refresh: string;
        };
        paymentInfo: {
            autoSelected: string;
            midtrans: string;
            paypal: string;
        };
    };

    // Orders
    orders?: {
        title: string;
        description: string;
        order: string;
        orderNumber: string;
        orderDate: string;
        placedOn: string;
        status: string;
        total: string;
        items: string;
        viewDetails: string;
        noOrders: string;
        noOrdersDesc: string;
        startShopping: string;
        backToOrders: string;
        filter: {
            all: string;
            pending: string;
            paid: string;
            processing: string;
            shipped: string;
            delivered: string;
            completed: string;
            cancelled: string;
            failed: string;
            searchPlaceholder: string;
            typeMinChars: string;
        };
        sort: {
            newestFirst: string;
            highestAmount: string;
        };
        detail: {
            orderItems: string;
            shippingAddress: string;
            shippingMethod: string;
            paymentInfo: string;
            orderSummary: string;
            timeline: string;
            timelineDesc: string;
            deliveryNotes: string;
            type: string;
            method: string;
            courier: string;
            service: string;
            trackingNumber: string;
            paymentMethod: string;
            paymentId: string;
            paidAt: string;
            subtotal: string;
            discount: string;
            shipping: string;
            tax: string;
            total: string;
            exchangeRate: string;
        };
        timeline: {
            orderPlaced: string;
            paymentConfirmed: string;
            processing: string;
            shipped: string;
            delivered: string;
            completed: string;
            currentStatus: string;
            cancelledOn: string;
        };
        actions: {
            cancelOrder: string;
            confirmReceipt: string;
            contactSupport: string;
            keepOrder: string;
            backToOrders: string;
            notYet: string;
            yesReceived: string;
            cancelTitle: string;
            cancelDesc: string;
            cancelReason: string;
            cancelReasonPlaceholder: string;
            cancelling: string;
            confirmReceiptTitle: string;
            confirmReceiptDesc: string;
            confirming: string;
            contactSupportBeforeConfirm: string;
            orderCancelled: string;
            provideCancelReason: string;
        };
        notFound: {
            title: string;
            description: string;
            viewAllOrders: string;
        };
        payment: {
            completePayment: string;
            completePaymentDesc: string;
            totalAmount: string;
            refreshStatus: string;
            checkingStatus: string;
            statusAutoUpdate: string;
            processingPayment: string;
            processingPaymentDesc: string;
            paymentCancelled: string;
            paymentSuccess: string;
            paymentConfirmed: string;
        };
        review: {
            writeReviews: string;
            writeReviewsDesc: string;
            clickToWriteReview: string;
            writeReview: string;
            reviewSubmitted: string;
        };
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

    // Admin Reviews
    adminReviews?: {
        title: string;
        description: string;
        fetchError: string;
        totalReviews: string;
        fiveStarReviews: string;
        withReplies: string;
        needsReply: string;
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
        noReviews: string;
        noReviewsDesc: string;
        reply: string;
        replyToReview: string;
        replyDescription: string;
        existingReplies: string;
        yourReply: string;
        replyPlaceholder: string;
        submitReply: string;
        replySuccess: string;
        replyError: string;
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
        totalQuestions: string;
        withReplies: string;
        unanswered: string;
        totalLikes: string;
        searchPlaceholder: string;
        filterByReplies: string;
        allStatus: string;
        answered: string;
        sortBy: string;
        sortByDate: string;
        sortByLikes: string;
        product: string;
        user: string;
        question: string;
        replies: string;
        likes: string;
        date: string;
        actions: string;
        view: string;
        noDiscussions: string;
        noDiscussionsDesc: string;
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
        rateProduct: string;
        yourReview: string;
        reviewPlaceholder: string;
        submitReview: string;
        submitting: string;
        minChars: string;
        maxChars: string;
        reviewSuccess: string;
        reviewError: string;
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

    // Notifications
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
        types?: {
            orderPaid: string;
            orderProcessing: string;
            orderShipped: string;
            orderDelivered: string;
            orderCompleted: string;
            orderCancelled: string;
            reviewReply: string;
            discussionReply: string;
            promotion: string;
        };
    };

    // About Page
    about?: {
        title: string;
        shopByCategory: string;
        shopByCategoryDescription: string;
    };

    // Error Pages
    errors?: {
        pageNotFound: string;
        pageNotFoundDesc: string;
        unauthorized: string;
        unauthorizedDesc: string;
        serverError: string;
        serverErrorDesc: string;
        networkError: string;
        networkErrorDesc: string;
        backToHome: string;
    };

    // Payment Callback
    paymentCallback?: {
        processingTitle: string;
        pleaseWait: string;
        verifyingTitle: string;
        checkingStatus: string;
        waitingConfirmation: string;
        verificationPaused: string;
        attemptProgress: string;
        dontClosePage: string;
        successTitle: string;
        successMessage: string;
        paymentCompleted: string;
        redirecting: string;
        failedTitle: string;
        failedMessage: string;
        paymentFailed: string;
        processingFailed: string;
        paypalFailed: string;
        cancelledMessage: string;
        paymentCancelled: string;
        expiredTitle: string;
        expiredMessage: string;
        paymentExpired: string;
        pendingTitle: string;
        pendingMessage: string;
        unableToVerify: string;
        unknownStatus: string;
        viewOrder: string;
        tryAgain: string;
        backToCart: string;
        checkAgain: string;
    };

    // Location Form
    locationForm?: {
        shippingRegion: string;
        selectShippingRegion: string;
        domestic: string;
        international: string;
        country: string;
        province: string;
        selectProvince: string;
        cityDistrictPostal: string;
        searchCityOrDistrict: string;
        typeCityOrDistrict: string;
        typeAtLeast3Chars: string;
        noResultsFound: string;
        searching: string;
        selectedLocation: string;
        stateProvince: string;
        city: string;
        postalCode: string;
        fullAddress: string;
        addressPlaceholder: string;
        selectCountry: string;
    };
}