export interface Tenant {
    id: number;
    userId: number;
    phone: string;
    emergencyContact?: string;
    emergencyPhone?: string;
    employmentInfo?: string;
    createdAt?: string;
    updatedAt?: string;
    user: {
        name: string;
        email: string;
    };
    leases?: {
        id: number;
        startDate: string;
        endDate: string;
        status: string;
    }[];
}

export interface TenantFormData {
    name: string;
    email: string;
    phone: string;
    emergencyContact?: string;
    emergencyPhone?: string;
    employmentInfo?: string;
} 