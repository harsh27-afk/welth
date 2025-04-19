"use client";

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
        <div className="">
         
          {/* Filters */}
          
    
          {/* Transactions Table */}
          
    
          {/* Pagination */}
        
        </div>
      );


};