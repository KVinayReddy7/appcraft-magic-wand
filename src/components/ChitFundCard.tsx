import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Users, IndianRupee, Clock } from "lucide-react";
import { ChitFund } from "@/types/chitfund";

interface ChitFundCardProps {
  chitFund: ChitFund;
  onSelect: (chitFund: ChitFund) => void;
}

export const ChitFundCard = ({ chitFund, onSelect }: ChitFundCardProps) => {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const startDate = new Date(chitFund.startYear, chitFund.startMonth - 1);
  const isActive = currentYear >= chitFund.startYear && 
    (currentYear > chitFund.startYear || currentMonth >= chitFund.startMonth) &&
    currentYear <= chitFund.endYear &&
    (currentYear < chitFund.endYear || currentMonth <= chitFund.endMonth);

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{chitFund.name}</CardTitle>
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <IndianRupee className="h-4 w-4" />
          <span>₹{chitFund.monthlyAmount.toLocaleString()}/month</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{chitFund.totalMonths} months</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarDays className="h-4 w-4" />
          <span>
            {startDate.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })} - 
            {new Date(chitFund.endYear, chitFund.endMonth - 1).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
          </span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{chitFund.members.length} members</span>
        </div>
        
        <Button 
          onClick={() => onSelect(chitFund)} 
          className="w-full mt-4"
        >
          Manage Chit Fund
        </Button>
      </CardContent>
    </Card>
  );
};