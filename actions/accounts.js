"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

const serializeDecimal = (obj) => {
  const serialized = { ...obj };
  if (obj.balance) {
    serialized.balance = obj.balance.toNumber();
  }
  if (obj.amount) {
    serialized.amount = obj.amount.toNumber();
  }
  return serialized;
};


export async function getAccountWithTransactions(accountId) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  const account = await db.account.findUnique({
    where: {
      id: accountId,
      userId: user.id,
    },
    include: {
      transactions: {
        orderBy: { date: "desc" },
      },
      _count: {
        select: { transactions: true },
      },
    },
  });

  if (!account) return null;

  return {
    ...serializeDecimal(account),
    transactions: account.transactions.map(serializeDecimal),
  };
}

export async function updateDefaultAccount(accountId) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // First, unset any existing default account
    await db.account.updateMany({
      where: {
        userId: user.id,
        isDefault: true,
      },
      data: { isDefault: false },
    });

    // Then set the new default account
    const account = await db.account.update({
      where: {
        id: accountId,
        userId: user.id,
      },
      data: { isDefault: true },
    });

    revalidatePath("/dashboard");
    return { success: true, data: serializeTransaction(account) };
  } catch (error) {
    return { success: false, error: error.message };
  }

}

export async function bulkDeleteTransactions(transactionIds) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    // Fetch and calculate balance changes in one go
    const transactions = await db.transaction.findMany({
      where: {
        userId: user.id,
        id: { in: transactionIds },
      },
      select: {
        id: true,
        type: true,
        amount: true,
        accountId: true,
      },
    });

    const balanceMap = new Map();

    for (const txn of transactions) {
      const change = txn.type === "EXPENSE" ? txn.amount : -txn.amount;
      balanceMap.set(
        txn.accountId,
        (balanceMap.get(txn.accountId) || 0) + change
      );
    }

    await db.$transaction(async (tx) => {
      // Delete all matching transactions
      await tx.transaction.deleteMany({
        where: {
          userId: user.id,
          id: { in: transactionIds },
        },
      });

      // Update all affected account balances
      const updates = Array.from(balanceMap.entries()).map(
        async ([accountId, balanceChange]) => {
          return tx.account.update({
            where: { id: accountId },
            data: {
              balance: { increment: balanceChange },
            },
          });
        }
      );

      await Promise.all(updates);
    });

    revalidatePath("/dashboard");
    revalidatePath("/account/[id]");

    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
