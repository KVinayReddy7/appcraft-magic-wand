import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ArrowLeft, Download, Upload, Trash2, Settings } from "lucide-react";
import { ChitFund } from "@/types/chitfund";
import { useToast } from "@/hooks/use-toast";

interface SettingsPageProps {
  chitFunds: ChitFund[];
  onDeleteChitFund: (id: string) => void;
  onImportData: (data: ChitFund[]) => void;
  onBack: () => void;
}

export const SettingsPage = ({ chitFunds, onDeleteChitFund, onImportData, onBack }: SettingsPageProps) => {
  const [adminPassword, setAdminPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [selectedChitForDelete, setSelectedChitForDelete] = useState<string>('');
  const { toast } = useToast();

  // Simple password (you can enhance this)
  const defaultPassword = 'admin123';

  const exportAllData = () => {
    const dataStr = JSON.stringify(chitFunds, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chitfund_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: "Data exported successfully"
    });
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        if (Array.isArray(importedData)) {
          onImportData(importedData);
          toast({
            title: "Success",
            description: "Data imported successfully"
          });
        } else {
          throw new Error('Invalid data format');
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to import data. Please check the file format.",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
  };

  const handleDeleteChit = () => {
    if (deletePassword === defaultPassword && selectedChitForDelete) {
      onDeleteChitFund(selectedChitForDelete);
      setDeletePassword('');
      setSelectedChitForDelete('');
      toast({
        title: "Success",
        description: "Chit fund deleted successfully"
      });
    } else {
      toast({
        title: "Error",
        description: "Invalid password",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      {/* Backup & Restore */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Backup & Restore
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={exportAllData} className="gap-2">
              <Download className="h-4 w-4" />
              Export All Data
            </Button>
            <div>
              <Input
                type="file"
                accept=".json"
                onChange={importData}
                className="hidden"
                id="import-file"
              />
              <Label htmlFor="import-file">
                <Button variant="outline" className="gap-2" asChild>
                  <span>
                    <Upload className="h-4 w-4" />
                    Import Data
                  </span>
                </Button>
              </Label>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Export your data for backup or import previously saved data to restore your chit funds.
          </p>
        </CardContent>
      </Card>

      {/* Chit Fund Management */}
      <Card>
        <CardHeader>
          <CardTitle>Manage Chit Funds</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {chitFunds.length === 0 ? (
              <p className="text-muted-foreground">No chit funds created yet.</p>
            ) : (
              chitFunds.map((chit) => (
                <div key={chit.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">{chit.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {chit.members.length} members • ₹{chit.monthlyAmount.toLocaleString()}/month
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => setSelectedChitForDelete(chit.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Chit Fund</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the chit fund "{chit.name}" and all its data.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <div className="py-4">
                        <Label htmlFor="delete-password">Enter admin password:</Label>
                        <Input
                          id="delete-password"
                          type="password"
                          value={deletePassword}
                          onChange={(e) => setDeletePassword(e.target.value)}
                          placeholder="Enter password"
                        />
                      </div>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => {
                          setDeletePassword('');
                          setSelectedChitForDelete('');
                        }}>
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteChit}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Admin Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Admin Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              <strong>Total Chit Funds:</strong> {chitFunds.length}
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Default Admin Password:</strong> admin123 (Change this in production)
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>App Version:</strong> 1.0.0
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};