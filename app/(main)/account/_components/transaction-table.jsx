"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Trash } from "lucide-react";
import { BarLoader } from "react-spinners";

export function TransactionTable({ transactions }){

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [recurringFilter, setRecurringFilter] = useState("");
  const [sortConfig, setSortConfig] = useState({
    field: "date",
    direction: "desc",
  });

  
   // Memoized filtered and sorted transactions
   const filteredAndSortedTransactions = useMemo(() => {
    let result = [...transactions];

  // Apply search filter
  if (searchTerm) {
    const searchLower = searchTerm.toLowerCase();
    result = result.filter((transaction) =>
      transaction.description?.toLowerCase().includes(searchLower)
    );
  }

  // Apply type filter
  if (typeFilter) {
    result = result.filter((transaction) => transaction.type === typeFilter);
  }

  // Apply recurring filter
  if (recurringFilter) {
    result = result.filter((transaction) => {
      if (recurringFilter === "recurring") return transaction.isRecurring;
      return !transaction.isRecurring;
    });

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;

      switch (sortConfig.field) {
        case "date":
          comparison = new Date(a.date) - new Date(b.date);
          break;
        case "amount":
          comparison = a.amount - b.amount;
          break;
        case "category":
          comparison = a.category.localeCompare(b.category);
          break;
        default:
          comparison = 0;
      }

      return sortConfig.direction === "asc" ? comparison : -comparison;
    });

    return result;
  }},[transactions, searchTerm, typeFilter, recurringFilter, sortConfig])


  return (
    <div className="space-y-6">
      {/* Loader */}
      {deleteLoading && (
        <BarLoader className="mt-2" width={"100%"} color="#9333ea" />
      )}
  
      {/* Filters & Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-1 gap-2 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-8"
            />
          </div>
  
          <Select
            value={typeFilter}
            onValueChange={(value) => {
              setTypeFilter(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="INCOME">Income</SelectItem>
              <SelectItem value="EXPENSE">Expense</SelectItem>
            </SelectContent>
          </Select>
  
          <Select
            value={recurringFilter}
            onValueChange={(value) => {
              setRecurringFilter(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Transactions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recurring">Recurring Only</SelectItem>
              <SelectItem value="non-recurring">Non-recurring Only</SelectItem>
            </SelectContent>
          </Select>
  
          {(searchTerm || typeFilter || recurringFilter) && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClearFilters}
              title="Clear filters"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
  
        {selectedIds.length > 0 && (
          <Button
            variant="destructive"
            size="sm"
            onClick={handleBulkDelete}
            className="whitespace-nowrap"
          >
            <Trash className="h-4 w-4 mr-1" />
            Delete Selected ({selectedIds.length})
          </Button>
        )}
      </div>
  
      
     
    </div>
  );
  


};