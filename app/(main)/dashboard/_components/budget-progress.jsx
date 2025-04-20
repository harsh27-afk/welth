"use client";

import { useState, useEffect } from "react";
import useFetch from "@/hooks/use-fetch";
import { toast } from "sonner";
import { updateBudget } from "@/actions/budget";

export function BudgetProgress({ initialBudget, currentExpenses }) {
  const [isEditing, setIsEditing] = useState(false);
  const [newBudget, setNewBudget] = useState(
    initialBudget?.amount?.toString() || ""
  );

  const {
    loading: isLoading,
    fn: updateBudgetFn,
    data: updatedBudget,
    error,
  } = useFetch(updateBudget);

  const budgetPercentage = useMemo(() => {
    if (!initialBudget?.amount) return 0;
    return (currentExpenses / initialBudget.amount) * 100;
  }, [initialBudget, currentExpenses]);
  
  const handleUpdate = async () => {
    const parsedAmount = Number(newBudget);
  
    if (!parsedAmount || parsedAmount <= 0) {
      toast.error("Enter a valid positive number for budget.");
      return;
    }
  
    try {
      await updateBudgetFn(parsedAmount);
    } catch (err) {
      toast.error("Something went wrong while updating budget.");
    }
  };
  
  const resetBudgetInput = () => {
    setNewBudget(initialBudget?.amount?.toString() ?? "");
    setIsEditing(false);
  };
  
  useEffect(() => {
    if (updatedBudget?.success) {
      setIsEditing(false);
      toast.success("Budget updated!");
    }
  }, [updatedBudget]);
  
  useEffect(() => {
    if (error?.message) {
      toast.error(error.message || "Failed to update budget.");
    }
  }, [error]);
  

  return (
    <div>
      
    </div>
  );
}