"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useRouter, useSearchParams } from "next/navigation";
import useFetch from "@/hooks/use-fetch";
import { toast } from "sonner";




import { createTransaction, updateTransaction } from "@/actions/transaction";
import { transactionSchema } from "@/app/lib/schema";


export function AddTransactionForm({ accounts, categories, editMode = false, initialData = null }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const isEdit = editMode && initialData;

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues: isEdit ? {
      ...initialData,
      amount: initialData.amount.toString(),
      date: new Date(initialData.date),
    } : {
      type: "EXPENSE",
      amount: "",
      description: "",
      accountId: accounts.find((acc) => acc.isDefault)?.id,
      date: new Date(),
      isRecurring: false,
    },
  });

  const {
    loading: isProcessing,
    fn: processTransaction,
    data: result,
  } = useFetch(isEdit ? updateTransaction : createTransaction);

  const onSubmit = (data) => {
    const payload = { ...data, amount: parseFloat(data.amount) };
    isEdit ? processTransaction(editId, payload) : processTransaction(payload);
  };

  const handleScanComplete = ({ amount, date, description, category }) => {
    setValue("amount", amount.toString());
    setValue("date", new Date(date));
    if (description) setValue("description", description);
    if (category) setValue("category", category);
    toast.success("Receipt scanned successfully");
  };

  useEffect(() => {
    if (result?.success && !isProcessing) {
      toast.success(`${editMode ? "Updated" : "Created"} transaction successfully`);
      reset();
      router.push(`/account/${result.data.accountId}`);
    }
  }, [result, isProcessing]);

  const type = watch("type");
  const isRecurring = watch("isRecurring");
  const transactionDate = watch("date");
  const filteredCategories = categories.filter((cat) => cat.type === type);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
     
    </form>
  );
}