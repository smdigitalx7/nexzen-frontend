import { Mail, Phone, ExternalLink, MessageCircle, FileText, Bug } from "lucide-react";
import { useState } from "react";
import { Button } from "@/common/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/common/components/ui/card";
import IssueReportDialog from "../../../components/Support/IssueReportDialog";

const SupportTab = () => {
    const [isIssueDialogOpen, setIsIssueDialogOpen] = useState(false);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
          <MessageCircle className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 font-outfit">
            Support & Help
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Get assistance and access resources for Velonex ERP
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl">
        {/* Contact Support */}
        <Card className="border-slate-200 shadow-none">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Phone className="h-5 w-5 text-blue-600" />
              Contact Support
            </CardTitle>
            <CardDescription>Direct help for technical issues</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-slate-400 mt-1" />
                <div>
                  <p className="text-sm font-medium">Email Support</p>
                  <p className="text-sm text-blue-600 hover:underline cursor-pointer">smdigitalx@gmail.com</p>
                  <p className="text-sm text-blue-600 hover:underline cursor-pointer">contact@smdigitalx.com</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-4 w-4 text-slate-400 mt-1" />
                <div>
                  <p className="text-sm font-medium">Phone Support</p>
                  <p className="text-sm text-slate-600">+91 8184919998</p>
                  <p className="text-sm text-slate-600">+91 7569259998</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resources */}
        <Card className="border-slate-200 shadow-none">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-600" />
              Resources
            </CardTitle>
            <CardDescription>Self-help and documentation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {import.meta.env.VITE_ADMIN_GUIDE_URL ? (
              <Button
                variant="outline"
                className="w-full justify-between"
                onClick={() => window.open(import.meta.env.VITE_ADMIN_GUIDE_URL, '_blank')}
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Admin Guide
                </div>
                <ExternalLink className="h-3.5 w-3.5 opacity-50" />
              </Button>
            ) : null}

            {import.meta.env.VITE_ACADEMIC_GUIDE_URL ? (
              <Button
                variant="outline"
                className="w-full justify-between"
                onClick={() => window.open(import.meta.env.VITE_ACADEMIC_GUIDE_URL, '_blank')}
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Academic Guide
                </div>
                <ExternalLink className="h-3.5 w-3.5 opacity-50" />
              </Button>
            ) : null}

            {import.meta.env.VITE_ACCOUNTANT_GUIDE_URL ? (
              <Button
                variant="outline"
                className="w-full justify-between"
                onClick={() => window.open(import.meta.env.VITE_ACCOUNTANT_GUIDE_URL, '_blank')}
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Accountant Guide
                </div>
                <ExternalLink className="h-3.5 w-3.5 opacity-50" />
              </Button>
            ) : null}

            {!import.meta.env.VITE_ADMIN_GUIDE_URL && !import.meta.env.VITE_ACADEMIC_GUIDE_URL && !import.meta.env.VITE_ACCOUNTANT_GUIDE_URL ? (
              <Button
                variant="outline"
                className="w-full justify-between"
                onClick={() => window.open('https://drive.google.com/drive/folders/10gsq1_6Nt4fTMbrEO0AobIaQmMHD1dWS', '_blank')}
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  User Guides
                </div>
                <ExternalLink className="h-3.5 w-3.5 opacity-50" />
              </Button>
            ) : null}
            <Button
              variant="outline"
              className="w-full justify-between"
              onClick={() => setIsIssueDialogOpen(true)}
            >
              <div className="flex items-center gap-2">
                <Bug className="h-4 w-4" />
                Report an Issue
              </div>
              <ExternalLink className="h-3.5 w-3.5 opacity-50" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Support Hours */}
      <div className="mt-8 p-4 bg-slate-50 border border-slate-200 rounded-lg max-w-5xl">
        <p className="text-sm text-slate-600">
          <strong>Support Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM IST. 
          For urgent production issues, please contact us via phone.
        </p>
      </div>

      {/* Issue Report Dialog */}
        <IssueReportDialog 
            isOpen={isIssueDialogOpen} 
            onClose={() => setIsIssueDialogOpen(false)} 
        />
    </div>
  );
};

export default SupportTab;
