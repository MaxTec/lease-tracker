"use client";

import { useFormContext } from "react-hook-form";
import Checkbox from "@/components/ui/Checkbox";
import { useRules } from "@/hooks/useRules";
import { useClauses } from "@/hooks/useClauses";
import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableItem } from "./SortableItem";
import Button from "@/components/ui/Button";
import { toast } from "sonner";
import Modal from "@/components/ui/Modal";
import Divider from "@/components/ui/Divider";
import { FaPlus } from "react-icons/fa";
import RuleForm from "./RuleForm";
import ClauseForm from "./ClauseForm";
import type { RuleFormData, ClauseFormData } from "@/lib/validations/lease";
import { getOrdinal } from "@/utils/numberUtils";

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
  const { register, watch, setValue } = useFormContext();
  const { rules, isLoading: rulesLoading, error: rulesError } = useRules();
  const {
    clauses,
    isLoading: clausesLoading,
    error: clausesError,
  } = useClauses();

  const [localRules, setLocalRules] = useState<Rule[]>([]);
  const [localClauses, setLocalClauses] = useState<Clause[]>([]);
  const [areRulesSelected, setAreRulesSelected] = useState(false);
  const [areClausesSelected, setAreClausesSelected] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [isClauseModalOpen, setIsClauseModalOpen] = useState(false);

  useEffect(() => {
    if (rules) {
      console.log("Rules loaded:", rules);
      setLocalRules(rules);
    }
  }, [rules, setValue]);

  useEffect(() => {
    if (clauses) {
      console.log("Clauses loaded:", clauses);
      setLocalClauses(clauses);
    }
  }, [clauses, setValue]);

  const handleDragEnd = async (
    event: DragEndEvent,
    type: "rules" | "clauses"
  ) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const items: (Rule | Clause)[] =
      type === "rules" ? localRules : localClauses;
    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);

    const newItems = arrayMove(items, oldIndex, newIndex);

    if (type === "rules") {
      setLocalRules(newItems as Rule[]);
    } else {
      setLocalClauses(newItems as Clause[]);
    }
  };

  const handleAddRule = async (data: RuleFormData) => {
    try {
      const response = await fetch("/api/rules", {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to add rule");

      const rule: Rule = await response.json();
      setLocalRules((prev) => [...prev, rule]);
      toast.success("Rule added successfully");
      setIsRuleModalOpen(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      toast.error("Failed to add rule: " + errorMessage);
    }
  };

  const handleAddClause = async (data: ClauseFormData) => {
    try {
      const response = await fetch("/api/clauses", {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to add clause");

      const clause: Clause = await response.json();
      setLocalClauses((prev) => [...prev, clause]);
      toast.success("Clause added successfully");
      setIsClauseModalOpen(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      toast.error("Failed to add clause: " + errorMessage);
    }
  };

  const handleToggleAllRules = () => {
    const newState = !areRulesSelected;
    setAreRulesSelected(newState);

    // Get current values as numbers
    const currentValues = (watch("selectedRules") || []).map(Number);

    // If we're selecting all, add any missing rule IDs
    if (newState) {
      const allRuleIds = localRules.map((rule) => Number(rule.id));
      const uniqueIds = Array.from(new Set([...currentValues, ...allRuleIds]));
      console.log("uniqueIds", uniqueIds);
      setValue("selectedRules", uniqueIds.map(String), {
        shouldValidate: true,
      });
    } else {
      // If we're deselecting all, set to empty array
      setValue("selectedRules", [], { shouldValidate: true });
    }
  };

  const handleToggleAllClauses = () => {
    const newState = !areClausesSelected;
    setAreClausesSelected(newState);

    // Get current values as numbers
    const currentValues = (watch("selectedClauses") || []).map(Number);

    // If we're selecting all, add any missing clause IDs
    if (newState) {
      const allClauseIds = localClauses.map((clause) => Number(clause.id));
      const uniqueIds = Array.from(
        new Set([...currentValues, ...allClauseIds])
      );
      setValue("selectedClauses", uniqueIds.map(String), {
        shouldValidate: true,
      });
    } else {
      // If we're deselecting all, set to empty array
      setValue("selectedClauses", [], { shouldValidate: true });
    }
  };

  const handleRuleChange = (ruleId: number, checked: boolean) => {
    const currentValues = (watch("selectedRules") || []).map(Number);
    const newValues = checked
      ? [...currentValues, ruleId]
      : currentValues.filter((id: number) => id !== ruleId);

    setValue("selectedRules", newValues.map(Number), { shouldValidate: true });
    setAreRulesSelected(newValues.length === localRules.length);
  };

  const handleClauseChange = (clauseId: number, checked: boolean) => {
    const currentValues = (watch("selectedClauses") || []).map(Number);
    const newValues = checked
      ? [...currentValues, clauseId]
      : currentValues.filter((id: number) => id !== clauseId);

    setValue("selectedClauses", newValues.map(Number), {
      shouldValidate: true,
    });
    setAreClausesSelected(newValues.length === localClauses.length);
  };

  if (rulesLoading || clausesLoading) {
    return <div className="text-center">Loading...</div>;
  }

  if (rulesError || clausesError) {
    return <div className="text-red-500">Error loading data</div>;
  }
  // console.log("localRules", localRules);
  // console.log("localClauses", localClauses);
  // TODO: After adding a new rule or clause, it must be added as checked in the form
  return (
    <div className="space-y-8">
      <Divider
        title="Lease Rules"
        lineStyle="solid"
        actions={
          <div className="flex items-center space-x-2">
            <Button onClick={handleToggleAllRules} variant="outline" size="sm">
              {areRulesSelected ? "Unselect All" : "Select All"}
            </Button>
            <Button onClick={() => setIsRuleModalOpen(true)} square>
              <div className="flex items-center space-x-2">
                <FaPlus />
              </div>
            </Button>
          </div>
        }
      >
        <div className="w-full space-y-4">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={(event) => handleDragEnd(event, "rules")}
          >
            {localRules.map((rule) => {
              return (
                <SortableItem key={rule.id} id={rule.id}>
                  <div className="flex flex-col items-start space-x-3 p-2.5 bg-white rounded-lg shadow-sm border border-gray-200">
                    <Checkbox
                      key={rule.id}
                      {...register("selectedRules", {
                        onChange: (e) => {
                          handleRuleChange(Number(rule.id), e.target.checked);
                        },
                      })}
                      value={rule.id}
                      checked={(watch("selectedRules") || [])
                        .map(Number)
                        .includes(rule.id)}
                      label={rule.title}
                    />
                    <p className="text-sm text-gray-500">{rule.description}</p>
                  </div>
                </SortableItem>
              );
            })}
          </DndContext>
        </div>
      </Divider>

      <Divider
        title="Lease Clauses"
        lineStyle="dashed"
        actions={
          <div className="flex items-center space-x-2">
            <Button
              onClick={handleToggleAllClauses}
              variant="outline"
              size="sm"
            >
              {areClausesSelected ? "Unselect All" : "Select All"}
            </Button>
            <Button onClick={() => setIsClauseModalOpen(true)} square>
              <div className="flex items-center space-x-2">
                <FaPlus />
              </div>
            </Button>
          </div>
        }
      >
        <div className="w-full space-y-4">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={(event) => handleDragEnd(event, "clauses")}
          >
            <SortableContext
              items={localClauses}
              strategy={verticalListSortingStrategy}
            >
              {localClauses.map((clause, index) => (
                <SortableItem key={clause.id} id={clause.id}>
                  <div className="flex flex-col items-start space-y-1 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                    <Checkbox
                      {...register("selectedClauses", {
                        onChange: (e) => {
                          handleClauseChange(
                            Number(clause.id),
                            e.target.checked
                          );
                        },
                      })}
                      value={clause.id}
                      checked={(watch("selectedClauses") || [])
                        .map(Number)
                        .includes(clause.id)}
                      label={`${getOrdinal(index + 1, {
                        language: "es",
                      }).toUpperCase()}`}
                    />
                    <p className="text-sm text-gray-500">{clause.content}</p>
                  </div>
                </SortableItem>
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </Divider>

      <Modal
        isOpen={isRuleModalOpen}
        onClose={() => setIsRuleModalOpen(false)}
        title="Add New Rule"
      >
        <RuleForm
          onSubmit={handleAddRule}
          onCancel={() => setIsRuleModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isClauseModalOpen}
        onClose={() => setIsClauseModalOpen(false)}
        title="Add New Clause"
      >
        <ClauseForm
          onSubmit={handleAddClause}
          onCancel={() => setIsClauseModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
