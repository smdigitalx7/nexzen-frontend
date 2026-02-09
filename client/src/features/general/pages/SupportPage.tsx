import React, { useState } from 'react';
import { Button } from "@/common/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/common/components/ui/card";
import { MessageSquareWarning, LifeBuoy, BookOpen, Headphones } from "lucide-react";
import IssueReportDialog from '../components/Support/IssueReportDialog';

const SupportPage: React.FC = () => {
  const [isReportOpen, setIsReportOpen] = useState(false);

  return (
    <div className="container mx-auto py-12 px-4 max-w-5xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">Help & Support Center</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Need assistance? Our support team is here to help you get the most out of your ERP system.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <Card className="hover:shadow-md transition-shadow border-slate-200">
          <CardHeader>
            <LifeBuoy className="w-10 h-10 text-primary mb-2" />
            <CardTitle>Technical Support</CardTitle>
            <CardDescription>Get help with system errors, crashes, or bugs.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
               onClick={() => setIsReportOpen(true)}
               className="w-full bg-primary hover:bg-primary/90"
            >
              <MessageSquareWarning className="w-4 h-4 mr-2" />
              Report an Issue
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-slate-200">
          <CardHeader>
            <BookOpen className="w-10 h-10 text-primary mb-2" />
            <CardTitle>Knowledge Base</CardTitle>
            <CardDescription>Read guides and documentation on how to use features.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full border-slate-200 text-slate-600">
              View Documentation
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-slate-200">
          <CardHeader>
            <Headphones className="w-10 h-10 text-primary mb-2" />
            <CardTitle>Contact Us</CardTitle>
            <CardDescription>Direct line for urgent inquiries and enterprise support.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full border-slate-200 text-slate-600">
              Contact Sales
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Can't find what you're looking for?</h3>
          <p className="text-slate-600">Our team is available Mon-Fri, 9am - 6pm for live assistance.</p>
        </div>
        <Button onClick={() => setIsReportOpen(true)} size="lg">
          Talk to an Expert
        </Button>
      </div>

      <IssueReportDialog 
        isOpen={isReportOpen} 
        onClose={() => setIsReportOpen(false)} 
      />
    </div>
  );
};

export default SupportPage;
