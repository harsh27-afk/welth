"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import aj from "@/lib/arcjet";
import { request } from "@arcjet/next";



const convertAmount = (obj) => ({
    ...obj,
    amount: obj.amount.toNumber(),
  });
  
  const validateRateLimit = async (userId) => {
    const req = await request();
    const decision = await aj.protect(req, { userId, requested: 1 });
  
    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        const { remaining, reset } = decision.reason;
        console.error("Rate limit exceeded", { remaining, reset });
        throw new Error("Too many requests. Please try again later.");
      }
      throw new Error("Request blocked by ArcJet.");
    }
  };
  
  const findUserAndAccount = async (userId, accountId) => {
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
    if (!user) throw new Error("User not found");
  
    const account = await db.account.findUnique({
      where: { id: accountId, userId: user.id },
    });
    if (!account) throw new Error("Account not found");
  
    return { user, account };
  };
  
  export async function createTransaction(data) {
    try {
      const { userId } = await auth();
      if (!userId) throw new Error("Unauthorized");
  
      await validateRateLimit(userId);
  
      const { user, account } = await findUserAndAccount(userId, data.accountId);
  
      const balanceImpact = data.type === "EXPENSE" ? -data.amount : data.amount;
      const updatedBalance = account.balance.toNumber() + balanceImpact;
  
      const transaction = await db.$transaction(async (tx) => {
        const newTx = await tx.transaction.create({
          data: {
            ...data,
            userId: user.id,
            nextRecurringDate: data.isRecurring && data.recurringInterval
              ? calculateNextRecurringDate(data.date, data.recurringInterval)
              : null,
          },
        });
  
        await tx.account.update({
          where: { id: data.accountId },
          data: { balance: updatedBalance },
        });
  
        return newTx;
      });
  
      revalidatePath("/dashboard");
      revalidatePath(`/account/${data.accountId}`);
  
      return { success: true, data: convertAmount(transaction) };
    } catch (err) {
      throw new Error(err.message || "Transaction failed.");
    }
  }
  