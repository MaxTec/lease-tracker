"use client";

import { useState, useEffect } from "react";

interface Tenant {
  id: number;
  user: {
    name: string;
  };
}

export function useTenants() {
  const [tenants, setTenants] = useState<Tenant[]>([]);

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const response = await fetch("/api/tenants");
        if (!response.ok) throw new Error("Failed to fetch tenants");
        const data = await response.json();
        setTenants(data);
      } catch (error) {
        console.error("Error fetching tenants:", error);
      }
    };

    fetchTenants();
  }, []);

  return { tenants };
} 