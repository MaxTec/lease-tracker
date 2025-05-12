"use client";

import { useState, useCallback, useEffect } from "react";

interface Property {
  id: number;
  name: string;
}

interface Unit {
  id: number;
  unitNumber: string;
}

export interface UsePropertiesOptions {
  userRole?: string;
  userId?: string;
}

export function useProperties({ userRole, userId }: UsePropertiesOptions = {}) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [isLoadingUnits, setIsLoadingUnits] = useState<boolean>(true);
  const [isLoadingProperties, setIsLoadingProperties] = useState<boolean>(true);
  // Fetch properties on mount or when userRole/userId changes
  useEffect(() => {
    console.log("Fetching properties");
    const fetchProperties = async () => {
      try {
        let url = "/api/properties";
        if (userRole && userId) {
          url += `?userRole=${encodeURIComponent(userRole)}&userId=${encodeURIComponent(userId)}`;
        }
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch properties");
        const data = await response.json();
        console.log("Fetched properties:", data);
        setProperties(data);
        setIsLoadingProperties(false);
      } catch (error) {
        console.error("Error fetching properties:", error);
        setIsLoadingProperties(false);
      }
    };

    fetchProperties();
  }, [userRole, userId]);

  // Handle property selection and fetch units
  const handlePropertyChange = useCallback(async (propertyId: string) => {
    console.log("Handling property change:", propertyId);
    setIsLoadingUnits(true);
    if (!propertyId) {
      setUnits([]);
      return;
    }

    try {
      const response = await fetch(`/api/properties/${propertyId}`);
      if (!response.ok) throw new Error("Failed to fetch units");
      const propertyData = await response.json();
      setUnits(propertyData.units);
      setIsLoadingUnits(false);
    } catch (error) {
      console.error("Error fetching units:", error);
      setUnits([]);
      setIsLoadingUnits(false);
    }
  }, []);

  return {
    properties,
    setProperties,
    units,
    isLoadingUnits,
    isLoadingProperties,
    handlePropertyChange,
  };
}
