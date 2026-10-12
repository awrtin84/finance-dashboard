export type TxType = "income" | "expense";

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Category {
  id: number;
  name: string;
  type: TxType;
  color: string;
}

export interface Transaction {
  id: number;
  type: TxType;
  amount: number;
  note: string;
  date: string;
  category_id: number;
  category_name: string;
  category_color: string;
}

export interface TransactionList {
  items: Transaction[];
  total: number;
  income: number;
  expense: number;
}

export interface TxPayload {
  type: TxType;
  amount: number;
  category_id: number;
  date: string;
  note: string;
}

export interface BudgetRow {
  category_id: number;
  category_name: string;
  category_color: string;
  amount: number | null;
  spent: number;
}

export interface RecurringRule {
  id: number;
  type: TxType;
  amount: number;
  note: string;
  day_of_month: number;
  category_id: number;
  category_name: string;
  category_color: string;
  active: boolean;
}

export interface Summary {
  income: number;
  expense: number;
  balance: number;
  by_category: { category_id: number; name: string; color: string; total: number }[];
  daily: { day: number; income: number; expense: number }[];
  trend: { jy: number; jm: number; income: number; expense: number }[];
}
