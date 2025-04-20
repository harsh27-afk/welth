"use client";

import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


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
        const range = DATE_RANGES[dateRange];
        const now = new Date();
        const startDate = range.days
          ? startOfDay(subDays(now, range.days))
          : startOfDay(new Date(0));
    
        // Filter transactions within date range
        const filtered = transactions.filter(
          (t) => new Date(t.date) >= startDate && new Date(t.date) <= endOfDay(now)
        );
    
        // Group transactions by date
        const grouped = filtered.reduce((acc, transaction) => {
          const date = format(new Date(transaction.date), "MMM dd");
          if (!acc[date]) {
            acc[date] = { date, income: 0, expense: 0 };
          }
          if (transaction.type === "INCOME") {
            acc[date].income += transaction.amount;
          } else {
            acc[date].expense += transaction.amount;
          }
          return acc;
        }, {});
    
        // Convert to array and sort by date
        return Object.values(grouped).sort(
          (a, b) => new Date(a.date) - new Date(b.date)
        );
      }, [transactions, dateRange]);

      // Calculate totals for the selected period
  const totals = useMemo(() => {
    return filteredData.reduce(
      (acc, day) => ({
        income: acc.income + day.income,
        expense: acc.expense + day.expense,
      }),
      { income: 0, expense: 0 }
    );
  }, [filteredData]);
      

  return (
    <Card>
  <CardHeader className="flex items-center justify-between pb-6">
    <CardTitle className="text-base font-medium">Transaction Overview</CardTitle>
    <Select value={dateRange} onValueChange={setDateRange}>
      <SelectTrigger className="w-36">
        <SelectValue placeholder="Select range" />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(DATE_RANGES).map(([key, { label }]) => (
          <SelectItem key={key} value={key}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </CardHeader>

  <CardContent>
    {/* Summary Block */}
    <div className="grid grid-cols-3 gap-4 text-center mb-6 text-sm">
      {[
        {
          label: "Total Income",
          value: totals.income,
          color: "text-green-500",
        },
        {
          label: "Total Expenses",
          value: totals.expense,
          color: "text-red-500",
        },
        {
          label: "Net",
          value: totals.income - totals.expense,
          color:
            totals.income - totals.expense >= 0
              ? "text-green-500"
              : "text-red-500",
        },
      ].map(({ label, value, color }) => (
        <div key={label}>
          <p className="text-muted-foreground">{label}</p>
          <p className={`text-lg font-semibold ${color}`}>
            ${value.toFixed(2)}
          </p>
        </div>
      ))}
    </div>

    {/* Chart Block */}
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={filteredData}
          margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="4 2" vertical={false} />
          <XAxis
            dataKey="date"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => `$${val}`}
          />
          <Tooltip
            formatter={(value) => [`$${value}`, undefined]}
            contentStyle={{
              backgroundColor: "hsl(var(--popover))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "var(--radius)",
            }}
          />
          <Legend />
          <Bar dataKey="income" name="Income" fill="#16a34a" radius={[4, 4, 0, 0]} />
          <Bar dataKey="expense" name="Expense" fill="#dc2626" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </CardContent>
</Card>

  )
}

export default AccountChart;