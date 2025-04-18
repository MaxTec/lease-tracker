export interface PropertyUnit {
    id?: number;
    unitNumber: string;
    bedrooms: string;
    bathrooms: string;
    squareFeet: string;
    propertyId?: number;
}

export interface Property {
    id?: number;
    name: string;
    address: string;
    type: string;
    landlordId: number;
    units: PropertyUnit[];
    createdAt?: string;
    updatedAt?: string;
    landlord?: {
        id: number;
        user: {
            name: string;
            email?: string;
        };
    };
}

export interface PropertyFormData {
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    description?: string;
    landlordId: number;
} 