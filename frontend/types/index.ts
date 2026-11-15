export type Role = 'user' | 'premium' | 'manager' | 'admin' | 'super_admin';

export interface User {
    _id: string;
    email: string;
    name: string;
    role: Role;
    isBanned: boolean;
    familyId?: string;
    height?: number;
    age?: number;
    gender?: string;
    targetWeight?: number;
}

export type TaskStatus = 'NEW' | 'IN_PROGRESS' | 'DONE';

export interface Task {
    _id: string;
    title: string;
    status: TaskStatus;
    date: string;
    notes: string;
    assignedTo: string;
    createdAt: string;
    isShared?: boolean;
}

export interface Transaction {
    _id: string;
    title: string;
    amount: number;
    type: 'income' | 'expense';
    category: string;
    createdAt: string;
    receiptUrl?: string;
    isShared?: boolean;
}

export interface PremiumRequest {
    _id: string;
    name: string;
    email: string;
    telegram: string;
    plan: string;
    status: string;
    sum: number;
    manager: string | null;
    createdAt: string;
}

export interface Summary {
    totalIncome: number;
    totalExpense: number;
    balance: number;
}

export interface Meta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}