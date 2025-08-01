import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { ChitFund } from "@/types/chitfund";
import { useToast } from "@/hooks/use-toast";

interface CreateChitFundDialogProps {
  onCreateChitFund: (chitFund: ChitFund) => void;
}

export const CreateChitFundDialog = ({ onCreateChitFund }: CreateChitFundDialogProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    monthlyAmount: '',
    totalMonths: '',
    startMonth: '',
    startYear: new Date().getFullYear().toString(),
    members: ''
  });
  const { toast } = useToast();

  const months = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear + i);

  const calculateEndDate = (startMonth: number, startYear: number, totalMonths: number) => {
    const startDate = new Date(startYear, startMonth - 1);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + totalMonths - 1);
    return {
      endMonth: endDate.getMonth() + 1,
      endYear: endDate.getFullYear()
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const { name, monthlyAmount, totalMonths, startMonth, startYear, members } = formData;
    
    if (!name || !monthlyAmount || !totalMonths || !startMonth || !members.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    const membersList = members.split(',').map(m => m.trim()).filter(m => m);
    if (membersList.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one member",
        variant: "destructive"
      });
      return;
    }

    const startMonthNum = parseInt(startMonth);
    const startYearNum = parseInt(startYear);
    const totalMonthsNum = parseInt(totalMonths);
    const { endMonth, endYear } = calculateEndDate(startMonthNum, startYearNum, totalMonthsNum);

    const newChitFund: ChitFund = {
      id: Date.now().toString(),
      name,
      monthlyAmount: parseInt(monthlyAmount),
      totalMonths: totalMonthsNum,
      startMonth: startMonthNum,
      startYear: startYearNum,
      endMonth,
      endYear,
      members: membersList,
      chitHistory: [],
      createdAt: new Date().toISOString()
    };

    onCreateChitFund(newChitFund);
    
    // Reset form
    setFormData({
      name: '',
      monthlyAmount: '',
      totalMonths: '',
      startMonth: '',
      startYear: new Date().getFullYear().toString(),
      members: ''
    });
    
    setOpen(false);
    
    toast({
      title: "Success",
      description: "Chit fund created successfully!"
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create New Chit Fund
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Chit Fund</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Chit Fund Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Family Chit Fund"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="monthlyAmount">Monthly Amount (₹)</Label>
            <Input
              id="monthlyAmount"
              type="number"
              value={formData.monthlyAmount}
              onChange={(e) => setFormData({ ...formData, monthlyAmount: e.target.value })}
              placeholder="10000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="totalMonths">Total Months</Label>
            <Input
              id="totalMonths"
              type="number"
              value={formData.totalMonths}
              onChange={(e) => setFormData({ ...formData, totalMonths: e.target.value })}
              placeholder="12"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Month</Label>
              <Select value={formData.startMonth} onValueChange={(value) => setFormData({ ...formData, startMonth: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Start Year</Label>
              <Select value={formData.startYear} onValueChange={(value) => setFormData({ ...formData, startYear: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="members">Members (comma separated)</Label>
            <Textarea
              id="members"
              value={formData.members}
              onChange={(e) => setFormData({ ...formData, members: e.target.value })}
              placeholder="John, Mary, David, Sarah"
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full">
            Create Chit Fund
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};