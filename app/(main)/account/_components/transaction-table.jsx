"use client";

import { useState, useMemo } from "react";

export function TransactionTable({ transactions }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [recurringFilter, setRecurringFilter] = useState("");

  const result = useMemo(() => {
    return transactions.filter((transaction) => {
      const matchesSearch = !searchTerm
        || transaction.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = !typeFilter
        || transaction.type === typeFilter;

      const matchesRecurring = !recurringFilter
        || (recurringFilter === "recurring" ? transaction.isRecurring : !transaction.isRecurring);

      return matchesSearch && matchesType && matchesRecurring;
    });
  }, [transactions, searchTerm, typeFilter, recurringFilter]);

  return (
    <div className="">
      {/* Filters */}

      {/* Transactions Table */}

      {/* Pagination */}
    </div>
  );
}
