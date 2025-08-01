import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { ChitFund, ChitMember } from "@/types/chitfund";
import { useToast } from "@/hooks/use-toast";

interface CreateChitFundDialogProps {
  onCreateChitFund: (chitFund: ChitFund) => void;
}

export const CreateChitFundDialog = ({ onCreateChitFund }: CreateChitFundDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [members, setMembers] = useState<ChitMember[]>([{name: '', mobile: ''}]);
  const [monthlyAmount, setMonthlyAmount] = useState('');
  const [totalMonths, setTotalMonths] = useState('');
  const [startMonth, setStartMonth] = useState('');
  const [startYear, setStartYear] = useState('');
  const [interestPercentage, setInterestPercentage] = useState('');
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

  const addMember = () => {
    setMembers([...members, {name: '', mobile: ''}]);
  };

  const updateMember = (index: number, field: 'name' | 'mobile', value: string) => {
    const newMembers = [...members];
    newMembers[index] = { ...newMembers[index], [field]: value };
    setMembers(newMembers);
  };

  const removeMember = (index: number) => {
    if (members.length > 1) {
      setMembers(members.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !monthlyAmount || !totalMonths || !startMonth || !startYear || !interestPercentage) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const filteredMembers = members.filter(member => member.name.trim() !== '' && member.mobile.trim() !== '');
    if (filteredMembers.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one member with name and mobile",
        variant: "destructive"
      });
      return;
    }

    const startMonthNum = parseInt(startMonth);
    const startYearNum = parseInt(startYear);
    const totalMonthsNum = parseInt(totalMonths);
    
    const endDate = new Date(startYearNum, startMonthNum - 1 + totalMonthsNum);
    
    const newChitFund: ChitFund = {
      id: Date.now().toString(),
      name,
      monthlyAmount: parseInt(monthlyAmount),
      totalMonths: totalMonthsNum,
      startMonth: startMonthNum,
      startYear: startYearNum,
      endMonth: endDate.getMonth() + 1,
      endYear: endDate.getFullYear(),
      members: filteredMembers,
      chitHistory: [],
      monthlyRecords: [],
      interestPercentage: parseFloat(interestPercentage),
      createdAt: new Date().toISOString()
    };

    onCreateChitFund(newChitFund);
    
    // Reset form
    setName('');
    setMembers([{name: '', mobile: ''}]);
    setMonthlyAmount('');
    setTotalMonths('');
    setStartMonth('');
    setStartYear('');
    setInterestPercentage('');
    setOpen(false);
    
    toast({
      title: "Success",
      description: "Chit fund created successfully"
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Chit Fund</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Chit Fund Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Family Chit Fund"
              required
            />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="members">Members</Label>
              {members.map((member, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={member.name}
                    onChange={(e) => updateMember(index, 'name', e.target.value)}
                    placeholder={`Member ${index + 1} name`}
                    className="flex-1"
                  />
                  <Input
                    value={member.mobile}
                    onChange={(e) => updateMember(index, 'mobile', e.target.value)}
                    placeholder="Mobile number"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeMember(index)}
                    disabled={members.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addMember}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="monthlyAmount">Monthly Amount (₹)</Label>
                <Input
                  id="monthlyAmount"
                  type="number"
                  value={monthlyAmount}
                  onChange={(e) => setMonthlyAmount(e.target.value)}
                  placeholder="20000"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="interestPercentage">Interest Percentage (%)</Label>
                <Input
                  id="interestPercentage"
                  type="number"
                  step="0.1"
                  value={interestPercentage}
                  onChange={(e) => setInterestPercentage(e.target.value)}
                  placeholder="0.8"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="totalMonths">Total Months</Label>
              <Input
                id="totalMonths"
                type="number"
                value={totalMonths}
                onChange={(e) => setTotalMonths(e.target.value)}
                placeholder="25"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Month</Label>
              <Select value={startMonth} onValueChange={setStartMonth}>
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
              <Select value={startYear} onValueChange={setStartYear}>
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

          <Button type="submit" className="w-full">
            Create Chit Fund
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};