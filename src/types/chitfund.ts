export interface ChitFund {
  id: string;
  name: string;
  monthlyAmount: number;
  totalMonths: number;
  startMonth: number;
  startYear: number;
  endMonth: number;
  endYear: number;
  members: string[];
  chitHistory: ChitRecord[];
  createdAt: string;
}

export interface ChitRecord {
  monthIndex: number; // 0-based index from start
  takenBy: string;
  amount: number;
  date: string;
}