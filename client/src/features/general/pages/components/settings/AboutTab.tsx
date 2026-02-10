import { Info, FileText, Headphones, Bug, Tag, Mail, Phone } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/common/components/ui/dialog";
import { useState } from "react";
import { Separator } from "@/common/components/ui/separator";
import IssueReportDialog from "../../../components/Support/IssueReportDialog";

const AboutTab = () => {
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [isIssueDialogOpen, setIsIssueDialogOpen] = useState(false);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Info className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-foreground">
            About Velonex ERP
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Application information and support
          </p>
        </div>
      </div>

      <div className="space-y-8 max-w-3xl">
        {/* Version Info */}
        <div className="flex items-center gap-2 bg-muted/50 backdrop-blur-sm px-4 py-2 rounded-md border w-fit">
          <Tag className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">
            Version {__BUILD_DATE__ || "1.0.0"}
          </span>
        </div>

        {/* Support & Help */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold tracking-tight">
              Support & Help
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Get assistance and access resources
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => {
                window.open(
                  "https://drive.google.com/drive/folders/10gsq1_6Nt4fTMbrEO0AobIaQmMHD1dWS",
                  "_blank",
                  "noopener,noreferrer"
                );
              }}
              className="group p-6 bg-white border border-slate-200 rounded-lg hover:shadow-md hover:border-primary/50 transition-all text-left"
            >
              <div className="flex flex-col space-y-4">
                <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                  <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-semibold text-base leading-none">
                    Documentation
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Browse guides and API references
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setIsContactDialogOpen(true)}
              className="group p-6 bg-white border border-slate-200 rounded-lg hover:shadow-md hover:border-primary/50 transition-all text-left"
            >
              <div className="flex flex-col space-y-4">
                <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                  <Headphones className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-semibold text-base leading-none">
                    Contact Support
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Reach out to our support team
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setIsIssueDialogOpen(true)}
              className="group p-6 bg-white border border-slate-200 rounded-lg hover:shadow-md hover:border-primary/50 transition-all text-left"
            >
              <div className="flex flex-col space-y-4">
                <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                  <Bug className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-semibold text-base leading-none">
                    Report an Issue
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Report bugs or request features
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>

        <Separator />

        {/* Footer */}
        <div className="pt-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <span>© 2025</span>
              <span className="font-semibold text-foreground">VELONEX ERP</span>
              <span>All rights reserved.</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span>Made with</span>
              <span className="text-red-500">❤️</span>
              <span>by</span>
              <a
                href="https://www.smdigitalx.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground hover:underline transition-colors"
              >
                SMDigitalX
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Support Dialog */}
      <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Contact Support</DialogTitle>
            <DialogDescription>
              Get in touch with our support team
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Email</p>
                  <div className="space-y-1 mt-1">
                    <a
                      href="mailto:smdigitalx@gmail.com"
                      className="text-sm text-primary hover:underline block"
                    >
                      smdigitalx@gmail.com
                    </a>
                    <a
                      href="mailto:contact@smdigitalx.com"
                      className="text-sm text-primary hover:underline block"
                    >
                      contact@smdigitalx.com
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Phone</p>
                  <div className="space-y-1 mt-1">
                    <a
                      href="tel:8184919998"
                      className="text-sm text-primary hover:underline block"
                    >
                      +91 8184919998
                    </a>
                    <a
                      href="tel:7569259998"
                      className="text-sm text-primary hover:underline block"
                    >
                      +91 7569259998
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Issue Report Dialog */}
      <IssueReportDialog 
        isOpen={isIssueDialogOpen} 
        onClose={() => setIsIssueDialogOpen(false)} 
      />
    </div>
  );
};

export default AboutTab;
