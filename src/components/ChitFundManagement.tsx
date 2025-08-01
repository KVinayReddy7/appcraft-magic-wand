import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, IndianRupee, Calendar, Users, CalendarDays, Percent } from "lucide-react";
import { ChitFund, ChitRecord } from "@/types/chitfund";
import { useToast } from "@/hooks/use-toast";
import { MonthlyView } from './MonthlyView';

interface ChitFundManagementProps {
  chitFund: ChitFund;
  onUpdateChitFund: (chitFund: ChitFund) => void;
  onBack: () => void;
}

export const ChitFundManagement = ({ chitFund, onUpdateChitFund, onBack }: ChitFundManagementProps) => {
  const [selectedMember, setSelectedMember] = useState<string>('');
  const [showMonthlyView, setShowMonthlyView] = useState(false);
  const { toast } = useToast();

  if (showMonthlyView) {
    return (
      <MonthlyView
        chitFund={chitFund}
        onUpdateChitFund={onUpdateChitFund}
        onBack={() => setShowMonthlyView(false)}
      />
    );
  }

  const getMonthName = (monthIndex: number) => {
    const startDate = new Date(chitFund.startYear, chitFund.startMonth - 1);
    const monthDate = new Date(startDate);
    monthDate.setMonth(monthDate.getMonth() + monthIndex);
    return monthDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  };

  const getAvailableMonths = () => {
    const months = [];
    for (let i = 0; i < chitFund.totalMonths; i++) {
      const isAlreadyTaken = chitFund.chitHistory.some(record => record.monthIndex === i);
      if (!isAlreadyTaken) {
        months.push(i);
      }
    }
    return months;
  };

  const calculateChitAmount = (monthIndex: number) => {
    const totalAmount = chitFund.monthlyAmount * chitFund.members.length;
    const interestMultiplier = 1 + (chitFund.interestPercentage / 100) * monthIndex;
    return Math.round(totalAmount * interestMultiplier);
  };

  const markChitTaken = (monthIndex: number) => {
    if (!selectedMember) {
      toast({
        title: "Error",
        description: "Please select a member first",
        variant: "destructive"
      });
      return;
    }

    const newRecord: ChitRecord = {
      monthIndex,
      takenBy: selectedMember,
      amount: calculateChitAmount(monthIndex),
      date: new Date().toISOString()
    };

    const updatedChitFund = {
      ...chitFund,
      chitHistory: [...chitFund.chitHistory, newRecord].sort((a, b) => a.monthIndex - b.monthIndex)
    };

    onUpdateChitFund(updatedChitFund);
    setSelectedMember('');
    
    toast({
      title: "Success",
      description: `Chit marked as taken by ${selectedMember} for ${getMonthName(monthIndex)}`
    });
  };

  const totalAmount = chitFund.monthlyAmount * chitFund.members.length;
  const availableMonths = getAvailableMonths();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">{chitFund.name}</h1>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Monthly Amount</p>
                <p className="text-lg font-semibold">₹{chitFund.monthlyAmount.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Base Chit Amount</p>
                <p className="text-lg font-semibold">₹{totalAmount.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Percent className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Interest Rate</p>
                <p className="text-lg font-semibold">{chitFund.interestPercentage}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="text-lg font-semibold">{chitFund.totalMonths} months</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button onClick={() => setShowMonthlyView(true)} className="gap-2">
          <CalendarDays className="h-4 w-4" />
          Monthly View & Payments
        </Button>
      </div>

      {/* Members List */}
      <Card>
        <CardHeader>
          <CardTitle>Members ({chitFund.members.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {chitFund.members.map((member, index) => (
              <div key={index} className="flex flex-col p-2 border rounded-lg">
                <div className="font-medium">{member.name}</div>
                <div className="text-sm text-muted-foreground">{member.mobile}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Mark Chit Taken */}
      {availableMonths.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Mark Chit as Taken</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Member</label>
                <Select value={selectedMember} onValueChange={setSelectedMember}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose member" />
                  </SelectTrigger>
                  <SelectContent>
                    {chitFund.members.map((member) => (
                      <SelectItem key={member.name} value={member.name}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Available Months</label>
                <div className="flex flex-wrap gap-2">
                  {availableMonths.slice(0, 3).map((monthIndex) => (
                    <Button
                      key={monthIndex}
                      size="sm"
                      variant="outline"
                      onClick={() => markChitTaken(monthIndex)}
                      disabled={!selectedMember}
                    >
                      {getMonthName(monthIndex)}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chit History */}
      <Card>
        <CardHeader>
          <CardTitle>Chit History</CardTitle>
        </CardHeader>
        <CardContent>
          {chitFund.chitHistory.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No chits taken yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead>Taken By</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {chitFund.chitHistory.map((record) => (
                  <TableRow key={record.monthIndex}>
                    <TableCell>{getMonthName(record.monthIndex)}</TableCell>
                    <TableCell>{record.takenBy}</TableCell>
                    <TableCell>₹{record.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      {new Date(record.date).toLocaleDateString('en-IN')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};