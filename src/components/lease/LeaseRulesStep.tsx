"use client";

import { useFormContext } from "react-hook-form";
import { useEffect, useState } from "react";
import Checkbox from "@/components/ui/Checkbox";

interface Rule {
  id: number;
  title: string;
  description: string;
  category: string;
}

interface Clause {
  id: number;
  title: string;
  content: string;
  type: string;
}

export default function LeaseRulesStep() {
  const { register, watch } = useFormContext();
  const [rules, setRules] = useState<Rule[]>([]);
  const [clauses, setClauses] = useState<Clause[]>([]);

  useEffect(() => {
    const fetchRulesAndClauses = async () => {
      try {
        const [rulesRes, clausesRes] = await Promise.all([
          fetch('/api/lease-rules'),
          fetch('/api/lease-clauses')
        ]);
        
        const rulesData = await rulesRes.json();
        const clausesData = await clausesRes.json();
        
        setRules(rulesData);
        setClauses(clausesData);
      } catch (error) {
        console.error('Error fetching rules and clauses:', error);
      }
    };

    fetchRulesAndClauses();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Lease Rules</h3>
        <div className="space-y-4">
          {rules.map((rule) => (
            <div key={rule.id} className="flex items-start space-x-3">
              <Checkbox
                {...register(`selectedRules`)}
                value={rule.id}
                label={rule.title}
              />
              <p className="text-sm text-gray-500">{rule.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Lease Clauses</h3>
        <div className="space-y-4">
          {clauses.map((clause) => (
            <div key={clause.id} className="flex items-start space-x-3">
              <Checkbox
                {...register(`selectedClauses`)}
                value={clause.id}
                label={clause.title}
              />
              <p className="text-sm text-gray-500">{clause.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 