export interface ChitMember {
  name: string;
  mobile: string;
}

export interface DisbursalConfig {
  type: 'manual' | 'auto';
  firstMonthAmount?: number;
  monthlyIncrease?: number;
  manualAmounts?: number[];
}

export interface ChitFund {
  id: string;
  name: string;
  monthlyAmount: number;
  totalMonths: number;
  startMonth: number;
  startYear: number;
  endMonth: number;
  endYear: number;
  members: ChitMember[];
  chitHistory: ChitRecord[];
  monthlyRecords?: MonthlyRecord[];
  disbursalConfig: DisbursalConfig;
  monthlyIncrease: number; // Amount added to contribution after taking chit
  createdAt: string;
}

export interface ChitRecord {
  monthIndex: number; // 0-based index from start
  takenBy: string;
  amount: number;
  date: string;
}

export interface MonthlyPayment {
  memberName: string;
  amount: number;
  paid: boolean;
  paymentMethod?: 'cash' | 'upi' | 'bank_transfer' | 'cheque';
  remarks?: string;
  paidDate?: string;
}

export interface MonthlyRecord {
  monthIndex: number;
  chitTakenBy?: string;
  chitAmount: number;
  payments: MonthlyPayment[];
  createdAt: string;
}