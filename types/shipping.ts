// types/shipping.ts

export interface ShippingZone {
    id: string;
    name: string;
    countries: string[];
    baseRate: number;
    perKgRate: number;
    minDays: number;
    maxDays: number;
}

export interface BiteshipRate {
    courier: {
        code: string;
        name: string;
        logo_url: string | null;
    };
    service: {
        code: string;
        name: string;
        description: string;
    };
    price: number;
    min_day: number;
    max_day: number;
}

export interface BiteshipRatesResponse {
    data: BiteshipRate[];
}

export interface InternationalShippingCalculation {
    zone: {
        id: string;
        name: string;
        minDays: number;
        maxDays: number;
    };
    cost: number;
    breakdown: {
        baseRate: number;
        weightCharge: number;
        totalWeight: number; // in kg
    };
}