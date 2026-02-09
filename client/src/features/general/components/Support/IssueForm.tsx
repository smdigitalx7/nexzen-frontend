import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/common/components/ui/card";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import { Textarea } from "@/common/components/ui/textarea";
import { Button } from "@/common/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/common/components/ui/select";
import { Loader2, Upload, CheckCircle2, AlertCircle } from "lucide-react";
import "./IssueForm.css";

const IssueForm: React.FC = () => {
  const [formData, setFormData] = useState({
    branch: '',
    userName: '',
    managementSystem: '',
    issue: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
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
    setStatus('idle');

    try {
      let fileData = '';
      let fileName = '';

      if (file) {
        fileData = await toBase64(file);
        fileName = file.name;
      }

      const payload = {
        ...formData,
        fileData,
        fileName
      };

      // Replace with actual Google Apps Script Web App URL
      const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzMsDBw6lenLu1dNzTa8eQVXo0KZr0CjFh7NrZHcBt6ETVC4NHHl-eGkd81Y1GZhy4/exec';

      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', // Google Apps Script requires no-cors for simple POST or it might fail preflight
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      // Note: with 'no-cors', we can't read the response body. 
      // We assume success if no error is thrown, or use a slightly different approach if we need response data.
      setStatus('success');
      setMessage('Issue reported successfully! Our team will look into it.');
      setFormData({ branch: '', userName: '', managementSystem: '', issue: '' });
      setFile(null);
    } catch (error) {
      console.error('Error submitting form:', error);
      setStatus('error');
      setMessage('Failed to submit issue. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="issue-form-container">
      <Card className="issue-card">
        <CardHeader className="text-center">
          <CardTitle className="gradient-text">Raise an Issue</CardTitle>
          <CardDescription>
            Report any bugs or system issues. We'll get back to you soon.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="branch">Branch</Label>
                <Select onValueChange={(v) => handleSelectChange('branch', v)} value={formData.branch}>
                  <SelectTrigger id="branch">
                    <SelectValue placeholder="Select Branch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Main">Main Branch</SelectItem>
                    <SelectItem value="North">North Branch</SelectItem>
                    <SelectItem value="South">South Branch</SelectItem>
                    <SelectItem value="West">West Branch</SelectItem>
                    <SelectItem value="East">East Branch</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="userName">Your Name</Label>
                <Input
                  id="userName"
                  name="userName"
                  placeholder="John Doe"
                  value={formData.userName}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="managementSystem">Management System Name</Label>
              <Input
                id="managementSystem"
                name="managementSystem"
                placeholder="ERP, CRM, LMS, etc."
                value={formData.managementSystem}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="issue">Issue Description</Label>
              <Textarea
                id="issue"
                name="issue"
                placeholder="Describe the issue in detail..."
                className="min-h-[120px]"
                value={formData.issue}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="attachment">Photo or Video</Label>
              <div className="file-upload-wrapper">
                <input
                  type="file"
                  id="attachment"
                  className="hidden-input"
                  onChange={handleFileChange}
                  accept="image/*,video/*"
                />
                <label htmlFor="attachment" className="file-upload-label">
                  <Upload className="w-5 h-5 mr-2" />
                  {file ? file.name : "Choose Photo or Video"}
                </label>
              </div>
            </div>

            <Button type="submit" className="w-full submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Raise Issue"
              )}
            </Button>

            {status !== 'idle' && (
              <div className={`status-message ${status}`}>
                {status === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                ) : (
                  <AlertCircle className="w-5 h-5 mr-2" />
                )}
                {message}
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default IssueForm;
