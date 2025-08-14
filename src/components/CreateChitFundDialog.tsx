import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus, Trash2 } from "lucide-react";
import { ChitFund, ChitMember, DisbursalConfig } from "@/types/chitfund";
import { useToast } from "@/hooks/use-toast";

interface CreateChitFundDialogProps {
  onCreateChitFund: (chitFund: ChitFund) => void;
}

export const CreateChitFundDialog = ({ onCreateChitFund }: CreateChitFundDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [monthlyAmount, setMonthlyAmount] = useState('');
  const [totalMonths, setTotalMonths] = useState('');
  const [startMonth, setStartMonth] = useState('');
  const [startYear, setStartYear] = useState('');
  const [monthlyIncrease, setMonthlyIncrease] = useState('');
  const [disbursalType, setDisbursalType] = useState<'manual' | 'auto'>('auto');
  const [firstMonthAmount, setFirstMonthAmount] = useState('');
  const [autoMonthlyIncrease, setAutoMonthlyIncrease] = useState('');
  const [manualAmounts, setManualAmounts] = useState<string[]>([]);
  const [members, setMembers] = useState<ChitMember[]>([{ name: '', mobile: '' }]);
  const { toast } = useToast();

  const addMember = () => {
    setMembers([...members, { name: '', mobile: '' }]);
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

  const generateManualAmounts = () => {
    const months = parseInt(totalMonths) || 0;
    if (months > 0) {
      setManualAmounts(new Array(months).fill(''));
    }
  };

  const handleSubmit = () => {
    if (!name || !monthlyAmount || !totalMonths || !startMonth || !startYear || !monthlyIncrease) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const validMembers = members.filter(member => member.name.trim() && member.mobile.trim());
    if (validMembers.length === 0) {
      toast({
        title: "Error", 
        description: "Please add at least one member",
        variant: "destructive"
      });
      return;
    }

    // Check for duplicate member names
    const memberNames = validMembers.map(m => m.name.trim().toLowerCase());
    const uniqueNames = new Set(memberNames);
    if (memberNames.length !== uniqueNames.size) {
      toast({
        title: "Error",
        description: "Duplicate member names are not allowed",
        variant: "destructive"
      });
      return;
    }

    // Validate disbursal configuration
    let disbursalConfig: DisbursalConfig;
    if (disbursalType === 'auto') {
      if (!firstMonthAmount || !autoMonthlyIncrease) {
        toast({
          title: "Error",
          description: "Please fill in first month amount and monthly increase for auto calculation",
          variant: "destructive"
        });
        return;
      }
      disbursalConfig = {
        type: 'auto',
        firstMonthAmount: parseInt(firstMonthAmount),
        monthlyIncrease: parseInt(autoMonthlyIncrease)
      };
    } else {
      const validAmounts = manualAmounts.filter(amount => amount.trim() && !isNaN(parseInt(amount)));
      if (validAmounts.length !== parseInt(totalMonths)) {
        toast({
          title: "Error",
          description: "Please enter disbursal amounts for all months",
          variant: "destructive"
        });
        return;
      }
      disbursalConfig = {
        type: 'manual',
        manualAmounts: manualAmounts.map(amount => parseInt(amount))
      };
    }

    const startDate = new Date(parseInt(startYear), parseInt(startMonth) - 1);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + parseInt(totalMonths) - 1);

    const chitFund: ChitFund = {
      id: Date.now().toString(),
      name: name.trim(),
      monthlyAmount: parseInt(monthlyAmount),
      totalMonths: parseInt(totalMonths),
      startMonth: parseInt(startMonth),
      startYear: parseInt(startYear),
      endMonth: endDate.getMonth() + 1,
      endYear: endDate.getFullYear(),
      members: validMembers,
      chitHistory: [],
      disbursalConfig,
      monthlyIncrease: parseInt(monthlyIncrease),
      createdAt: new Date().toISOString()
    };

    onCreateChitFund(chitFund);
    
    // Reset form
    setName('');
    setMonthlyAmount('');
    setTotalMonths('');
    setStartMonth('');
    setStartYear('');
    setMonthlyIncrease('');
    setDisbursalType('auto');
    setFirstMonthAmount('');
    setAutoMonthlyIncrease('');
    setManualAmounts([]);
    setMembers([{ name: '', mobile: '' }]);
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Chit Fund</DialogTitle>
          <DialogDescription>
            Set up a new chit fund with member details and disbursal configuration
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          {/* Basic Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Details</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Chit Fund Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Family Chit Fund"
                />
              </div>
              
              <div>
                <Label htmlFor="monthlyAmount">Base Monthly Contribution (₹)</Label>
                <Input
                  id="monthlyAmount"
                  type="number"
                  value={monthlyAmount}
                  onChange={(e) => setMonthlyAmount(e.target.value)}
                  placeholder="20000"
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div>
                <Label htmlFor="totalMonths">Total Months</Label>
                <Input
                  id="totalMonths"
                  type="number"
                  value={totalMonths}
                  onChange={(e) => {
                    setTotalMonths(e.target.value);
                    if (disbursalType === 'manual') {
                      generateManualAmounts();
                    }
                  }}
                  placeholder="25"
                />
              </div>
              
              <div>
                <Label htmlFor="startMonth">Start Month</Label>
                <Select value={startMonth} onValueChange={setStartMonth}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">January</SelectItem>
                    <SelectItem value="2">February</SelectItem>
                    <SelectItem value="3">March</SelectItem>
                    <SelectItem value="4">April</SelectItem>
                    <SelectItem value="5">May</SelectItem>
                    <SelectItem value="6">June</SelectItem>
                    <SelectItem value="7">July</SelectItem>
                    <SelectItem value="8">August</SelectItem>
                    <SelectItem value="9">September</SelectItem>
                    <SelectItem value="10">October</SelectItem>
                    <SelectItem value="11">November</SelectItem>
                    <SelectItem value="12">December</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="startYear">Start Year</Label>
                <Input
                  id="startYear"
                  type="number"
                  value={startYear}
                  onChange={(e) => setStartYear(e.target.value)}
                  placeholder="2025"
                />
              </div>

              <div>
                <Label htmlFor="monthlyIncrease">Monthly Increase (₹)</Label>
                <Input
                  id="monthlyIncrease"
                  type="number"
                  value={monthlyIncrease}
                  onChange={(e) => setMonthlyIncrease(e.target.value)}
                  placeholder="4000"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Added to contribution after taking chit
                </p>
              </div>
            </div>
          </div>

          {/* Disbursal Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Disbursal Configuration</h3>
            
            <RadioGroup 
              value={disbursalType} 
              onValueChange={(value: 'manual' | 'auto') => setDisbursalType(value)}
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="auto" id="auto" />
                <Label htmlFor="auto">Auto-calculate</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="manual" id="manual" />
                <Label htmlFor="manual">Manual input</Label>
              </div>
            </RadioGroup>

            {disbursalType === 'auto' ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstMonthAmount">1st Month Disbursal Amount (₹)</Label>
                  <Input
                    id="firstMonthAmount"
                    type="number"
                    value={firstMonthAmount}
                    onChange={(e) => setFirstMonthAmount(e.target.value)}
                    placeholder="485000"
                  />
                </div>
                <div>
                  <Label htmlFor="autoMonthlyIncrease">Monthly Increase in Disbursal (₹)</Label>
                  <Input
                    id="autoMonthlyIncrease"
                    type="number"
                    value={autoMonthlyIncrease}
                    onChange={(e) => setAutoMonthlyIncrease(e.target.value)}
                    placeholder="4000"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Disbursal Amounts for Each Month (₹)</Label>
                <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                  {manualAmounts.map((amount, index) => (
                    <div key={index}>
                      <Label className="text-xs">Month {index + 1}</Label>
                      <Input
                        type="number"
                        value={amount}
                        onChange={(e) => {
                          const newAmounts = [...manualAmounts];
                          newAmounts[index] = e.target.value;
                          setManualAmounts(newAmounts);
                        }}
                        placeholder="Amount"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Members */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Members</h3>
            
            <div className="max-h-60 overflow-y-auto space-y-3">
              {members.map((member, index) => (
                <div key={index} className="flex gap-4 items-end">
                  <div className="flex-1">
                    <Label htmlFor={`member-name-${index}`}>Name</Label>
                    <Input
                      id={`member-name-${index}`}
                      value={member.name}
                      onChange={(e) => updateMember(index, 'name', e.target.value)}
                      placeholder="Member name"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <Label htmlFor={`member-mobile-${index}`}>Mobile Number</Label>
                    <Input
                      id={`member-mobile-${index}`}
                      value={member.mobile}
                      onChange={(e) => updateMember(index, 'mobile', e.target.value)}
                      placeholder="9876543210"
                    />
                  </div>
                  
                  {members.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeMember(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            
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
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Create Chit Fund</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};