export type Role = 'user' | 'premium' | 'manager' | 'admin' | 'super_admin';

export interface User {
    _id: string;
    id?: string;
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

export interface Workout {
    _id: string;
    title: string;
    weight: number;
    reps: number;
    sets: number;
    date: string;
    createdAt: string;
}

export interface EquipmentItem {
    _id: string;
    name: string;
    category: 'car' | 'home' | 'other';
    lastServiceDate?: string;
    nextServiceDate?: string;
    mileageOrNote?: string;
    comment?: string;
    photoUrl?: string;
}

export interface DailyStats {
    record: {
        date: string;
        consumedCalories: number;
        steps: number;
        weight: number;
        water: number;
    };
    userParams: {
        height: number;
        age: number;
        gender: string;
        targetWeight: number;
    };
    stats: {
        currentWeight: number;
        bmr: number;
        burnedFromSteps: number;
        dynamicCalorieGoal: number;
        caloriesLeft: number;
        water: number;
    };
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