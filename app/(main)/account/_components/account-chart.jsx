"use client";

import { useState, useMemo } from "react";

const DATE_RANGES = {
    "7D": { label: "Last 7 Days", days: 7 },
    "1M": { label: "Last Month", days: 30 },
    "3M": { label: "Last 3 Months", days: 90 },
    "6M": { label: "Last 6 Months", days: 180 },
    ALL: { label: "All Time", days: null },
  };

const AccountChart = () => {

    const [dateRange, setDateRange] = useState("1M");

    const filteredData = useMemo(() => {
        const now = new Date();
        const range = DATE_RANGES[dateRange];
        const startDate = range.days ? subDays(now, range.days) : new Date(0);
      
        // Step 1: Filter by date range
        const recentTransactions = transactions.filter((t) => {
          const txDate = new Date(t.date);
          return txDate >= startOfDay(startDate) && txDate <= endOfDay(now);
        });
      
        // Step 2: Prepare a Map for grouped data
        const groupedMap = new Map();
      
        for (const tx of recentTransactions) {
          const key = format(new Date(tx.date), "yyyy-MM-dd");
      
          if (!groupedMap.has(key)) {
            groupedMap.set(key, {
              date: format(new Date(tx.date), "MMM dd"),
              income: 0,
              expense: 0,
            });
          }
      
          const entry = groupedMap.get(key);
          if (tx.type === "INCOME") {
            entry.income += tx.amount;
          } else {
            entry.expense += tx.amount;
          }
        }
      
        // Step 3: Convert Map to sorted array
        return Array.from(groupedMap.values()).sort((a, b) => {
          return new Date(a.date) - new Date(b.date);
        });
      }, [transactions, dateRange]);
      

  return (
    <div>AccountChart</div>
  )
}

export default AccountChart;