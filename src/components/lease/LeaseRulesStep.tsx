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
  const {
    rules,
    isLoading: rulesLoading,
    error: rulesError,
    mutate: mutateRules,
  } = useRules();
  const {
    clauses,
    isLoading: clausesLoading,
    error: clausesError,
    mutate: mutateClauses,
  } = useClauses();

  const [localRules, setLocalRules] = useState<Rule[]>([]);
  const [localClauses, setLocalClauses] = useState<Clause[]>([]);

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
  }, [rules]);

  useEffect(() => {
    if (clauses) {
      console.log("Clauses loaded:", clauses);
      setLocalClauses(clauses);
    }
  }, [clauses]);

  const handleDragEnd = async (
    event: DragEndEvent,
    type: "rules" | "clauses"
  ) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const items = type === "rules" ? localRules : localClauses;
    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);

    const newItems = arrayMove(items, oldIndex, newIndex);

    if (type === "rules") {
      setLocalRules(newItems);
      await fetch("/api/rules", {
        method: "PUT",
        body: JSON.stringify({ rules: newItems }),
      });
    } else {
      setLocalClauses(newItems);
      await fetch("/api/clauses", {
        method: "PUT",
        body: JSON.stringify({ clauses: newItems }),
      });
    }
  };

  const handleAddRule = async (data: RuleFormData) => {
    try {
      const response = await fetch("/api/rules", {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to add rule");

      const rule = await response.json();
      setLocalRules([...localRules, rule]);
      toast.success("Rule added successfully");
      mutateRules();
      setIsRuleModalOpen(false);
    } catch (error) {
      toast.error("Failed to add rule");
    }
  };

  const handleAddClause = async (data: ClauseFormData) => {
    try {
      const response = await fetch("/api/clauses", {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to add clause");

      const clause = await response.json();
      setLocalClauses([...localClauses, clause]);
      toast.success("Clause added successfully");
      mutateClauses();
      setIsClauseModalOpen(false);
    } catch (error) {
      toast.error("Failed to add clause");
    }
  };

  if (rulesLoading || clausesLoading) {
    return <div className="text-center">Loading...</div>;
  }

  if (rulesError || clausesError) {
    return <div className="text-red-500">Error loading data</div>;
  }
  return (
    <div className="space-y-8">
      <Divider
        title="Lease Rules"
        lineStyle="solid"
        actions={
          <Button onClick={() => setIsRuleModalOpen(true)} square>
            <div className="flex items-center space-x-2">
              <FaPlus />
            </div>
          </Button>
        }
      >
        <div className="w-full space-y-4">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={(event) => handleDragEnd(event, "rules")}
          >
            {localRules.map((rule) => (
              <SortableItem key={rule.id} id={rule.id}>
                <div className="flex flex-col items-start space-x-3 p-2.5 bg-white rounded-lg shadow-sm border border-gray-200">
                  <Checkbox
                    {...register(`selectedRules`)}
                    value={rule.id}
                    onChange={(e) => {
                      const values = new Set(watch("selectedRules") || []);
                      if (e.target.checked) {
                        values.add(rule.id);
                      } else {
                        values.delete(rule.id);
                      }
                      return setValue("selectedRules", Array.from(values));
                    }}
                    label={rule.title}
                  />
                  <p className="text-sm text-gray-500">{rule.description}</p>
                </div>
              </SortableItem>
            ))}
          </DndContext>
        </div>
      </Divider>

      <Divider
        title="Lease Clauses"
        lineStyle="dashed"
        actions={
          <Button onClick={() => setIsClauseModalOpen(true)}>
            <div className="flex items-center space-x-2">
              <FaPlus />
            </div>
          </Button>
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
              {localClauses.map((clause) => (
                <SortableItem key={clause.id} id={clause.id}>
                  <div className="flex flex-col items-start space-y-1 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                    <Checkbox
                      {...register(`selectedClauses`)}
                      value={clause.id}
                      onChange={(e) => {
                        const values = new Set(watch("selectedClauses") || []);
                        if (e.target.checked) {
                          values.add(clause.id);
                        } else {
                          values.delete(clause.id);
                        }
                        return setValue("selectedClauses", Array.from(values));
                      }}
                      label={clause.title}
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
