export interface Landlord {
    id: number;
    userId: number;
    phone: string;
    address: string;
    companyName?: string;
    user: {
        name: string;
        email: string;
    };
}

export interface LandlordFormData {
    name: string;
    email: string;
    password?: string;
    phone: string;
    address: string;
    companyName?: string;
} 