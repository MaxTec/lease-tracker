"use client";

import { useState, useEffect } from "react";

interface Tenant {
  id: number;
  user: {
    name: string;
  };
}

interface UseTenantsOptions {
  excludeActiveLease?: boolean;
}

export function useTenants(options: UseTenantsOptions = {}) {
  const [tenants, setTenants] = useState<Tenant[]>([]); // Renamed state to avoid conflicts
  const [isLoadingTenants, setIsLoadingTenants] = useState<boolean>(true); // Renamed loading state

  useEffect(() => {
    const fetchTenants = async () => {
      setIsLoadingTenants(true); // Set loading to true before fetching
      try {
        let url = "/api/tenants";
        const params = [];
        if (options.excludeActiveLease) {
          params.push("excludeActiveLease=true");
        }
        if (params.length > 0) {
          url += `?${params.join("&")}`;
        }
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch tenants");
        const data = await response.json();
        setTenants(data);
      } catch (error) {
        console.error("Error fetching tenants:", error);
      } finally {
        setIsLoadingTenants(false); // Set loading to false after fetching
      }
    };

    fetchTenants();
  }, [options.excludeActiveLease]);

  return { tenants, setTenants, isLoadingTenants }; // Return renamed state and loading
}