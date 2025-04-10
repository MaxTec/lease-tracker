"use client";

import { useState, useEffect } from "react";

interface Tenant {
  id: number;
  user: {
    name: string;
  };
}

export function useTenants() {
  const [tenants, setTenants] = useState<Tenant[]>([]); // Renamed state to avoid conflicts
  const [isLoadingTenants, setIsLoadingTenants] = useState<boolean>(true); // Renamed loading state

  useEffect(() => {
    const fetchTenants = async () => {
      setIsLoadingTenants(true); // Set loading to true before fetching
      try {
        const response = await fetch("/api/tenants");
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
  }, []);

  return { tenants, setTenants, isLoadingTenants }; // Return renamed state and loading
}