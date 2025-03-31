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

export function useProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);

  // Fetch properties on mount
  useState(() => {
    const fetchProperties = async () => {
      try {
        const response = await fetch("/api/properties");
        if (!response.ok) throw new Error("Failed to fetch properties");
        const data = await response.json();
        setProperties(data);
      } catch (error) {
        console.error("Error fetching properties:", error);
      }
    };

    fetchProperties();
  }, []);

  // Handle property selection and fetch units
  const handlePropertyChange = useCallback(async (propertyId: string) => {
    if (!propertyId) {
      setUnits([]);
      return;
    }

    try {
      const response = await fetch(`/api/properties/${propertyId}`);
      if (!response.ok) throw new Error("Failed to fetch units");
      const propertyData = await response.json();
      setUnits(propertyData.units);
    } catch (error) {
      console.error("Error fetching units:", error);
      setUnits([]);
    }
  }, []);

  return {
    properties,
    units,
    handlePropertyChange,
  };
}
