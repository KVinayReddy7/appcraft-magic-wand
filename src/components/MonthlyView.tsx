import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Download, Phone } from "lucide-react";
import { ChitFund, MonthlyRecord, MonthlyPayment } from "@/types/chitfund";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';

interface MonthlyViewProps {
  chitFund: ChitFund;
  onUpdateChitFund: (chitFund: ChitFund) => void;
  onBack: () => void;
}

export const MonthlyView = ({ chitFund, onUpdateChitFund, onBack }: MonthlyViewProps) => {
  const [selectedMonth, setSelectedMonth] = useState<number>(0);
  const { toast } = useToast();

  const getMonthName = (monthIndex: number) => {
    const startDate = new Date(chitFund.startYear, chitFund.startMonth - 1);
    const monthDate = new Date(startDate);
    monthDate.setMonth(monthDate.getMonth() + monthIndex);
    return monthDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  };

  const calculateChitAmount = (monthIndex: number) => {
    if (chitFund.disbursalConfig.type === 'manual') {
      return chitFund.disbursalConfig.manualAmounts?.[monthIndex] || 0;
    } else {
      const firstAmount = chitFund.disbursalConfig.firstMonthAmount || 0;
      const increase = chitFund.disbursalConfig.monthlyIncrease || 0;
      return firstAmount + (increase * monthIndex);
    }
  };

  const calculateMemberContribution = (memberName: string, monthIndex: number) => {
    // Check if member has taken chit in any previous month
    const hasTakenChit = chitFund.monthlyRecords?.some(record => 
      record.monthIndex < monthIndex && record.chitTakenBy === memberName
    );
    
    return hasTakenChit ? 
      chitFund.monthlyAmount + chitFund.monthlyIncrease : 
      chitFund.monthlyAmount;
  };

  const getMonthlyRecord = (monthIndex: number): MonthlyRecord => {
    // Find existing record or create new one
    const existingRecord = chitFund.monthlyRecords?.find(r => r.monthIndex === monthIndex);
    if (existingRecord) return existingRecord;

    // Create default payments for all members
    const defaultPayments: MonthlyPayment[] = chitFund.members.map(member => ({
      memberName: member.name,
      amount: calculateMemberContribution(member.name, monthIndex),
      paid: false,
      remarks: ''
    }));

    return {
      monthIndex,
      chitAmount: calculateChitAmount(monthIndex),
      payments: defaultPayments,
      createdAt: new Date().toISOString()
    };
  };

  const updateMonthlyRecord = (updatedRecord: MonthlyRecord) => {
    const updatedChitFund = {
      ...chitFund,
      monthlyRecords: chitFund.monthlyRecords ? 
        chitFund.monthlyRecords.map(record => 
          record.monthIndex === updatedRecord.monthIndex ? updatedRecord : record
        ).concat(chitFund.monthlyRecords.find(r => r.monthIndex === updatedRecord.monthIndex) ? [] : [updatedRecord])
        : [updatedRecord]
    };
    onUpdateChitFund(updatedChitFund);
  };

  const updatePayment = (memberName: string, field: keyof MonthlyPayment, value: any) => {
    const currentRecord = getMonthlyRecord(selectedMonth);
    const updatedPayments = currentRecord.payments.map(payment =>
      payment.memberName === memberName 
        ? { 
            ...payment, 
            [field]: value,
            ...(field === 'paid' && value ? { paidDate: new Date().toISOString() } : {})
          }
        : payment
    );
    
    updateMonthlyRecord({
      ...currentRecord,
      payments: updatedPayments
    });
  };

  const markChitTaken = (memberName: string) => {
    const currentRecord = getMonthlyRecord(selectedMonth);
    updateMonthlyRecord({
      ...currentRecord,
      chitTakenBy: memberName
    });

    toast({
      title: "Success",
      description: `Chit marked as taken by ${memberName} for ${getMonthName(selectedMonth)}`
    });
  };

  const exportToExcel = () => {
    const worksheetData = [];
    
    // Add header
    worksheetData.push([
      'Month', 'Member Name', 'Mobile', 'Amount', 'Paid', 'Payment Method', 'Paid Date', 'Remarks', 'Chit Taken By', 'Chit Amount'
    ]);

    // Add data for each month
    for (let monthIndex = 0; monthIndex < chitFund.totalMonths; monthIndex++) {
      const record = getMonthlyRecord(monthIndex);
      const monthName = getMonthName(monthIndex);
      
      record.payments.forEach(payment => {
        const member = chitFund.members.find(m => m.name === payment.memberName);
        worksheetData.push([
          monthName,
          payment.memberName,
          member?.mobile || '',
          payment.amount,
          payment.paid ? 'Yes' : 'No',
          payment.paymentMethod || '',
          payment.paidDate ? new Date(payment.paidDate).toLocaleDateString('en-IN') : '',
          payment.remarks || '',
          record.chitTakenBy || '',
          record.chitAmount
        ]);
      });
    }

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, chitFund.name);
    XLSX.writeFile(workbook, `${chitFund.name}_ChitFund_Report.xlsx`);

    toast({
      title: "Success",
      description: "Excel file exported successfully"
    });
  };

  const currentRecord = getMonthlyRecord(selectedMonth);
  const availableMonths = Array.from({ length: chitFund.totalMonths }, (_, i) => i);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">{chitFund.name} - Monthly View</h1>
        </div>
        <Button onClick={exportToExcel} className="gap-2">
          <Download className="h-4 w-4" />
          Export to Excel
        </Button>
      </div>

      {/* Month Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Month</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {availableMonths.map((monthIndex) => (
              <Button
                key={monthIndex}
                variant={selectedMonth === monthIndex ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedMonth(monthIndex)}
              >
                {getMonthName(monthIndex).split(' ')[0]}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Month Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{getMonthName(selectedMonth)} Details</span>
            <div className="flex gap-4 text-sm">
              <Badge variant="secondary">
                Chit Amount: ₹{currentRecord.chitAmount.toLocaleString()}
              </Badge>
              {currentRecord.chitTakenBy && (
                <Badge variant="default">
                  Taken by: {currentRecord.chitTakenBy}
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Remarks</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentRecord.payments.map((payment) => {
                const member = chitFund.members.find(m => m.name === payment.memberName);
                return (
                  <TableRow key={payment.memberName}>
                    <TableCell className="font-medium">{payment.memberName}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3" />
                        {member?.mobile}
                      </div>
                    </TableCell>
                    <TableCell>₹{payment.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Checkbox
                        checked={payment.paid}
                        onCheckedChange={(checked) => 
                          updatePayment(payment.memberName, 'paid', checked)
                        }
                      />
                      {payment.paid && payment.paidDate && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(payment.paidDate).toLocaleDateString('en-IN')}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={payment.paymentMethod || ''}
                        onValueChange={(value) => 
                          updatePayment(payment.memberName, 'paymentMethod', value)
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="upi">UPI</SelectItem>
                          <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                          <SelectItem value="cheque">Cheque</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Textarea
                        value={payment.remarks || ''}
                        onChange={(e) => 
                          updatePayment(payment.memberName, 'remarks', e.target.value)
                        }
                        placeholder="Add remarks..."
                        className="min-h-[60px] w-40"
                      />
                    </TableCell>
                    <TableCell>
                      {!currentRecord.chitTakenBy && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => markChitTaken(payment.memberName)}
                        >
                          Mark Chit Taken
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};