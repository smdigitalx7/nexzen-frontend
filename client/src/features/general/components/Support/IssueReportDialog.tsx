import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/common/components/ui/dialog";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import { Textarea } from "@/common/components/ui/textarea";
import { Button } from "@/common/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/ui/select";
import { Loader2, Upload, CheckCircle2, AlertCircle, FileIcon, Bug } from "lucide-react";
import { useAuthStore } from "@/core/auth/authStore";
import { toast } from "@/common/hooks/use-toast";

interface IssueReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const IssueReportDialog: React.FC<IssueReportDialogProps> = ({ isOpen, onClose }) => {
  const { user } = useAuthStore();
  
  const [formData, setFormData] = useState({
    userName: '',
    email: '',
    systemName: '',
    title: '',
    description: '',
    priority: 'Medium',
  });
  
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // Auto-fill user info when dialog opens or user changes
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        userName: user.full_name || '',
        email: user.email || '',
      }));
    }
  }, [user, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      // Basic size validation (e.g., 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 10MB",
          variant: "destructive"
        });
        return;
      }
      setFile(selectedFile);
    }
  };

  const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let fileData = '';
      let fileName = '';

      if (file) {
        fileData = await toBase64(file);
        fileName = file.name;
      }

      const payload = {
        timestamp: new Date().toISOString(),
        userName: formData.userName,
        email: formData.email,
        systemName: formData.systemName,
        issueTitle: formData.title,
        issueDescription: formData.description,
        priority: formData.priority,
        fileData,
        fileName
      };

      // The URL provided by the user in their manual edit
      const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzMsDBw6lenLu1dNzTa8eQVXo0KZr0CjFh7NrZHcBt6ETVC4NHHl-eGkd81Y1GZhy4/exec';

      // We use 'no-cors' for Google Apps Script if we don't need to read the response.
      // If we need the JSON response, the backend script must handle OPTIONS and CORS correctly.
      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      toast({
        title: "Issue Reported",
        description: "Your issue has been logged successfully. We will investigate it.",
        variant: "success"
      });
      
      // Reset form and close
      setFormData(prev => ({ ...prev, systemName: '', title: '', description: '', priority: 'Medium' }));
      setFile(null);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Submission Failed",
        description: "There was an error reporting the issue. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="p-4 bg-red-50/50 border-b border-red-100 dark:bg-red-950/20 dark:border-red-900/50">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 p-2 rounded-full dark:bg-red-900/50">
              <Bug className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-slate-800 dark:text-slate-200">Report an Issue</DialogTitle>
              <DialogDescription className="text-slate-500 dark:text-slate-400 text-xs mt-1">
                Found a bug? Help us squash it by filling out the details below.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column: Details */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="userName" className="text-xs font-semibold text-slate-700">Reporter</Label>
                  <Input
                    id="userName"
                    value={formData.userName}
                    disabled
                    className="h-9 bg-slate-50 border-slate-200 text-slate-600 font-medium text-xs"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority" className="text-xs font-semibold text-slate-700">Priority Level</Label>
                  <Select 
                    value={formData.priority} 
                    onValueChange={(v) => handleSelectChange('priority', v)}
                  >
                    <SelectTrigger id="priority" className="h-9 border-slate-200 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="systemName" className="text-xs font-semibold text-slate-700">Module / System Name</Label>
                <Select 
                  value={formData.systemName} 
                  onValueChange={(v) => handleSelectChange('systemName', v)}
                  required
                >
                  <SelectTrigger id="systemName" className="h-9 border-slate-200 text-xs">
                    <SelectValue placeholder="Select relevant system" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ERP Core">ERP Core</SelectItem>
                    <SelectItem value="Inventory Management">Inventory Management</SelectItem>
                    <SelectItem value="Payroll System">Payroll System</SelectItem>
                    <SelectItem value="Student Portal">Student Portal</SelectItem>
                    <SelectItem value="Financial Reports">Financial Reports</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title" className="text-xs font-semibold text-slate-700">Short Summary</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="e.g., Cannot download PDF reports"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="h-9 border-slate-200 focus:ring-primary/20 text-xs"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-700">Supporting Attachment</Label>
                <div className="flex items-center justify-center w-full">
                  <label 
                    htmlFor="file-upload" 
                    className={`flex flex-row items-center justify-center w-full h-16 border-2 border-dashed rounded-lg cursor-pointer transition-colors gap-3 px-4
                      ${file ? 'border-primary/50 bg-primary/5' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}`}
                  >
                    {file ? (
                      <>
                        <FileIcon className="w-5 h-5 text-primary shrink-0" />
                        <div className="flex-1 min-w-0 text-left">
                          <p className="text-xs font-medium text-primary truncate">{file.name}</p>
                          <p className="text-[10px] text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                        </div>
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5 text-slate-400" />
                        <div className="text-center">
                          <p className="text-xs text-slate-500"><span className="font-semibold">Click to upload</span> media</p>
                          <p className="text-[10px] text-slate-400">Max 10MB</p>
                        </div>
                      </>
                    )}
                    <input 
                      id="file-upload" 
                      type="file" 
                      className="hidden" 
                      onChange={handleFileChange}
                      accept="image/*,video/*"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column: Description */}
            <div className="space-y-2 flex flex-col h-full">
              <Label htmlFor="description" className="text-xs font-semibold text-slate-700">Issue Explanation</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Please describe what happened and steps to reproduce..."
                className="flex-1 min-h-[250px] border-slate-200 focus:ring-primary/20 resize-none text-xs p-3"
                value={formData.description}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <DialogFooter className="pt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              disabled={loading}
              className="h-9 border-slate-200 text-slate-600"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="h-9 bg-primary hover:bg-primary/90 text-white min-w-[120px]"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting
                </>
              ) : (
                "Submit Report"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default IssueReportDialog;
