import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Globe,
  Lock,
  Settings as SettingsIcon,
  Mail,
  Phone,
  FileText,
  Headphones,
  Bug,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TabSwitcher } from "@/components/shared";
import type { TabItem } from "@/components/shared/TabSwitcher";
import { useAuthStore } from "@/store/authStore";
import MonthlyFeeConfigTab from "@/components/features/college/config/MonthlyFeeConfigTab";

const SettingsPage = () => {
  const { currentBranch } = useAuthStore();
  const isCollege = currentBranch?.branch_type === "COLLEGE";
  // Default to privacy for school, configuration for college
  const [activeTab, setActiveTab] = useState(isCollege ? "configuration" : "privacy");
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [isPrivacyPolicyDialogOpen, setIsPrivacyPolicyDialogOpen] = useState(false);

  // Reset activeTab if it's "configuration" but user is on school
  useEffect(() => {
    if (!isCollege && activeTab === "configuration") {
      setActiveTab("privacy");
    }
  }, [isCollege, activeTab]);

  const tabs: TabItem[] = useMemo(() => {
    const baseTabs: TabItem[] = [
      // Configuration tab - only for college
      ...(isCollege ? [{
        value: "configuration",
        label: "Configuration",
        icon: SettingsIcon,
        content: (
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5" />
                Configuration
              </CardTitle>
              <CardDescription>
                Manage fee settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <MonthlyFeeConfigTab />
              </div>
            </CardContent>
          </Card>
        ),
      }] : []),
      {
        value: "privacy",
        label: "Privacy",
        icon: Lock,
        content: (
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Privacy & Security
              </CardTitle>
              <CardDescription>
                Manage your privacy and security preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <h3 className="font-medium mb-2">Data & Privacy</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Your data is securely stored and encrypted. We follow strict
                  privacy guidelines to protect your information.
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsPrivacyPolicyDialogOpen(true)}
                >
                  View Privacy Policy
                </Button>
              </div>
            </CardContent>
          </Card>
        ),
      },
      {
        value: "about",
        label: "About",
        icon: Globe,
        content: (
          <Card className="border-none shadow-lg relative">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                About Velonex ERP
              </CardTitle>
              <CardDescription>
                Application information and support
              </CardDescription>
            </CardHeader>
            {/* Version in top right corner of About card */}
            <div className="absolute top-6 right-6 flex items-center gap-2 bg-muted/50 backdrop-blur-sm px-3 py-1.5 rounded-md border z-10">
              <Tag className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">v1.0.0</span>
            </div>
            <CardContent className="space-y-6">

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold tracking-tight">Support & Help</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Get assistance and access resources
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card 
                    className="group cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/50"
                    onClick={() => {
                      window.open('https://drive.google.com/drive/folders/10gsq1_6Nt4fTMbrEO0AobIaQmMHD1dWS', '_blank', 'noopener,noreferrer');
                    }}
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                            <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-semibold text-base leading-none">Documentation</h4>
                          <p className="text-sm text-muted-foreground">
                            Browse guides and API references
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card 
                    className="group cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/50"
                    onClick={() => setIsContactDialogOpen(true)}
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                            <Headphones className="h-5 w-5 text-green-600 dark:text-green-400" />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-semibold text-base leading-none">Contact Support</h4>
                          <p className="text-sm text-muted-foreground">
                            Reach out to our support team
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card 
                    className="group cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/50"
                    onClick={() => {
                      window.open('https://www.jotform.com/form/253145100074039', '_blank', 'noopener,noreferrer');
                    }}
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                            <Bug className="h-5 w-5 text-red-600 dark:text-red-400" />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-semibold text-base leading-none">Report an Issue</h4>
                          <p className="text-sm text-muted-foreground">
                            Report bugs or request features
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <Separator />

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
            </CardContent>
          </Card>
        ),
      },
    ];

    return baseTabs;
  }, [isCollege]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto space-y-6"
      >
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your application preferences and settings
          </p>
        </div>

        <TabSwitcher
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          tabListClassName={`grid w-full ${isCollege ? 'grid-cols-3' : 'grid-cols-2'} lg:w-[600px]`}
        />
      </motion.div>

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

      {/* Privacy Policy Dialog */}
      <Dialog open={isPrivacyPolicyDialogOpen} onOpenChange={setIsPrivacyPolicyDialogOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Privacy Policy
            </DialogTitle>
            <DialogDescription>
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-4 text-sm">
              <section>
                <h3 className="font-semibold text-base mb-2">1. Introduction</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Welcome to VELONEX ERP. We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our ERP system.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-base mb-2">2. Information We Collect</h3>
                <p className="text-muted-foreground leading-relaxed mb-2">
                  We collect information that you provide directly to us, including:
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                  <li>Personal identification information (name, email address, phone number)</li>
                  <li>Institutional information (school/college details, branch information)</li>
                  <li>Academic and administrative data (student records, fee information, attendance)</li>
                  <li>User account credentials and authentication data</li>
                  <li>Usage data and system logs</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-base mb-2">3. How We Use Your Information</h3>
                <p className="text-muted-foreground leading-relaxed mb-2">
                  We use the collected information for the following purposes:
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                  <li>To provide, maintain, and improve our ERP services</li>
                  <li>To process transactions and manage institutional operations</li>
                  <li>To communicate with you about your account and our services</li>
                  <li>To ensure system security and prevent fraudulent activities</li>
                  <li>To comply with legal obligations and regulatory requirements</li>
                  <li>To analyze usage patterns and improve user experience</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-base mb-2">4. Data Security</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We implement industry-standard security measures to protect your data, including encryption, secure authentication protocols, regular security audits, and access controls. However, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-base mb-2">5. Data Storage and Retention</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Your data is stored securely on our servers. We retain your information for as long as necessary to provide our services and comply with legal obligations. When data is no longer needed, we securely delete or anonymize it in accordance with our data retention policies.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-base mb-2">6. Data Sharing and Disclosure</h3>
                <p className="text-muted-foreground leading-relaxed mb-2">
                  We do not sell, trade, or rent your personal information. We may share your information only in the following circumstances:
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                  <li>With your explicit consent</li>
                  <li>To comply with legal obligations or court orders</li>
                  <li>To protect our rights, privacy, safety, or property</li>
                  <li>With service providers who assist in operating our system (under strict confidentiality agreements)</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-base mb-2">7. Your Rights</h3>
                <p className="text-muted-foreground leading-relaxed mb-2">
                  You have the right to:
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                  <li>Access and review your personal information</li>
                  <li>Request correction of inaccurate data</li>
                  <li>Request deletion of your data (subject to legal and operational requirements)</li>
                  <li>Request restriction of processing of your data</li>
                  <li>Object to certain types of data processing</li>
                  <li>Data portability (receive your data in a structured format)</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-base mb-2">8. Cookies and Tracking Technologies</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We use cookies and similar tracking technologies to enhance your experience, analyze system usage, and maintain your session. You can control cookie preferences through your browser settings, though this may affect system functionality.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-base mb-2">9. Third-Party Services</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Our ERP system may integrate with third-party services for enhanced functionality. These services have their own privacy policies, and we encourage you to review them. We are not responsible for the privacy practices of third-party services.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-base mb-2">10. Children's Privacy</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Our services are designed for educational institutions. We handle student data in compliance with applicable educational privacy laws and regulations, including FERPA and similar regional requirements.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-base mb-2">11. Changes to This Privacy Policy</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new policy on this page and updating the "Last updated" date. Your continued use of our services after such changes constitutes acceptance of the updated policy.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-base mb-2">12. Contact Us</h3>
                <p className="text-muted-foreground leading-relaxed mb-2">
                  If you have questions or concerns about this Privacy Policy or our data practices, please contact us:
                </p>
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a 
                      href="mailto:smdigitalx@gmail.com" 
                      className="text-sm text-primary hover:underline"
                    >
                      smdigitalx@gmail.com
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a 
                      href="tel:8184919998" 
                      className="text-sm text-primary hover:underline"
                    >
                      +91 8184919998
                    </a>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SettingsPage;
