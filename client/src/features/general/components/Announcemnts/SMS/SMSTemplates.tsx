import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Edit2, Check, X, FileText, Info } from "lucide-react";
import { useSMSTemplates, useCreateSMSTemplate, useUpdateSMSTemplate, useDeleteSMSTemplate, type SMSTemplate } from "@/features/general/hooks/useSMS";
import { Button } from "@/common/components/ui/button";
import { Card, CardContent } from "@/common/components/ui/card";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import { Textarea } from "@/common/components/ui/textarea";
import { Badge } from "@/common/components/ui/badge";
import { Loader } from "@/common/components/ui/ProfessionalLoader";
import { ConfirmDialog } from "@/common/components/shared";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/common/components/ui/dialog";
import { Switch } from "@/common/components/ui/switch";

const SMSTemplates = () => {
  const { data: templates = [], isLoading } = useSMSTemplates();
  const createMutation = useCreateSMSTemplate();
  const updateMutation = useUpdateSMSTemplate();
  const deleteMutation = useDeleteSMSTemplate();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<SMSTemplate | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<number | null>(null);
  const [isDltVerified, setIsDltVerified] = useState(false);

  const [formData, setFormData] = useState({
    template_key: "",
    template_name: "",
    dlt_template_id: "",
    content: "",
    variable_names: [] as string[],
    is_active: true,
  });

  const handleOpenForm = (template?: SMSTemplate) => {
    if (template) {
      setEditingTemplate(template);
      setIsDltVerified(false); // Reset verification on edit
      setFormData({
        template_key: template.template_key,
        template_name: template.template_name,
        dlt_template_id: template.dlt_template_id,
        content: template.content,
        variable_names: template.variable_names,
        is_active: template.is_active,
      });
    } else {
      setEditingTemplate(null);
      setIsDltVerified(true); // Always verified for new templates (or at least editable)
      setFormData({
        template_key: "",
        template_name: "",
        dlt_template_id: "",
        content: "",
        variable_names: [],
        is_active: true,
      });
    }
    setIsFormOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingTemplate) {
        await updateMutation.mutateAsync({
          id: editingTemplate.template_id,
          data: {
            template_name: formData.template_name,
            dlt_template_id: formData.dlt_template_id,
            content: formData.content,
            variable_names: formData.variable_names,
            is_active: formData.is_active,
            category: "MANUAL",
          },
        });
      } else {
        await createMutation.mutateAsync({
          ...formData,
          category: "MANUAL",
        });
      }
      setIsFormOpen(false);
    } catch (error) {
      console.error("Failed to save template", error);
    }
  };

  const handleDelete = (id: number) => {
    setTemplateToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (templateToDelete) {
      await deleteMutation.mutateAsync(templateToDelete);
      setDeleteConfirmOpen(false);
    }
  };

  const handleVariablesChange = (value: string) => {
    const vars = value.split(",").map(v => v.trim()).filter(v => v !== "");
    setFormData({ ...formData, variable_names: vars });
  };

  if (isLoading) return <Loader.Data message="Loading templates..." />;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Manage Templates</h3>
        <Button onClick={() => handleOpenForm()} size="sm" className="gap-2">
          <Plus className="h-4 w-4" /> Add Template
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <motion.div
            key={template.template_id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="h-full flex flex-col hover:border-primary/50 transition-colors">
              <CardContent className="p-4 flex-1">
                <div className="flex justify-between items-start mb-2">
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm uppercase tracking-wider">{template.template_key}</h4>
                    <p className="text-xs text-muted-foreground">{template.template_name}</p>
                  </div>
                  <Badge variant={template.is_active ? "default" : "secondary"} className="h-5">
                    {template.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                
                <div className="bg-muted/30 rounded p-2 mb-3 mt-2 border border-muted">
                   <p className="text-xs font-mono line-clamp-3 leading-relaxed">
                     {template.content}
                   </p>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {template.variable_names.map((v, i) => (
                    <Badge key={i} variant="outline" className="text-[10px] py-0 px-1.5 font-normal">
                      {v}
                    </Badge>
                  ))}
                  {template.variable_names.length === 0 && (
                    <span className="text-[10px] text-muted-foreground italic">No variables</span>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-auto pt-2 border-t border-muted/50">
                   <p className="text-[10px] text-muted-foreground flex-1">
                     DLT ID: <span className="font-mono">{template.dlt_template_id}</span>
                   </p>
                   <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOpenForm(template)}>
                     <Edit2 className="h-3.5 w-3.5" />
                   </Button>
                   <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(template.template_id)}>
                     <Trash2 className="h-3.5 w-3.5" />
                   </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
        {templates.length === 0 && (
          <div className="col-span-full py-12 text-center border-2 border-dashed rounded-lg">
             <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
             <p className="text-muted-foreground">No templates found. Create your first one!</p>
          </div>
        )}
      </div>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingTemplate ? "Edit Template" : "Add New Template"}</DialogTitle>
          </DialogHeader>
          
          <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3 space-y-2 mb-2">
            <p className="text-[11px] font-bold text-blue-700 flex items-center gap-1.5 uppercase tracking-wider">
              <Info className="h-3.5 w-3.5" /> DLT Registration Process
            </p>
            <div className="grid grid-cols-3 gap-2 text-[10px] text-blue-600/80 leading-tight">
               <div className="bg-white/50 p-1.5 rounded border border-blue-50">
                 <span className="font-bold block mb-0.5 text-blue-800">1. Register</span>
                 Signup on DLT Platform (Airtel/PingConnect)
               </div>
               <div className="bg-white/50 p-1.5 rounded border border-blue-50">
                 <span className="font-bold block mb-0.5 text-blue-800">2. Get Approval</span>
                 Submit & get approval for Header & Template
               </div>
               <div className="bg-white/50 p-1.5 rounded border border-blue-50">
                 <span className="font-bold block mb-0.5 text-blue-800">3. Add Here</span>
                 Enter Approved DLT ID & Content in our Portal
               </div>
            </div>
          </div>

          <div className="space-y-4 py-2">
            {editingTemplate && (
              <div className="flex items-center space-x-2 p-3 bg-amber-50/30 border border-amber-100 rounded-lg mb-2">
                <Switch 
                  id="dlt-verified" 
                  checked={isDltVerified} 
                  onCheckedChange={setIsDltVerified}
                  className="data-[state=checked]:bg-amber-600"
                />
                <div className="space-y-0.5">
                  <Label htmlFor="dlt-verified" className="text-xs font-bold text-amber-900 cursor-pointer">
                    Enable Content Updates
                  </Label>
                  <p className="text-[10px] text-amber-700/80">Confirm if you have updated & approved this in DLT platform.</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="key" className="text-xs font-semibold">Template Key (Required)</Label>
                <Input 
                  id="key" 
                  disabled={!!editingTemplate} 
                  placeholder="e.g. EXAM_SCD" 
                  className="h-9 text-sm"
                  value={formData.template_key}
                  onChange={(e) => setFormData({ ...formData, template_key: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dlt_id" className="text-xs font-semibold">DLT Template ID (Required)</Label>
                <Input 
                  id="dlt_id" 
                  disabled={!!editingTemplate && !isDltVerified}
                  placeholder="e.g. 1007..." 
                  className="h-9 text-sm"
                  value={formData.dlt_template_id}
                  onChange={(e) => setFormData({ ...formData, dlt_template_id: e.target.value })}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-semibold">Display Name (Required)</Label>
              <Input 
                id="name" 
                placeholder="e.g. Exam Schedule Notification" 
                className="h-9 text-sm"
                value={formData.template_name}
                onChange={(e) => setFormData({ ...formData, template_name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content" className="text-xs font-semibold">Template Content (Required)</Label>
              <Textarea 
                id="content" 
                disabled={!!editingTemplate && !isDltVerified}
                placeholder="Dear {#var#}, your exam is on {#var#}" 
                className="min-h-[100px] text-sm resize-none"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              />
              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Info className="h-3 w-3" /> Content is for reference and must match DLT registration.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vars" className="text-xs font-semibold">Variable Names (Comma separated)</Label>
              <Input 
                id="vars" 
                disabled={!!editingTemplate && !isDltVerified}
                placeholder="e.g. name, date, subject" 
                className="h-9 text-sm"
                value={formData.variable_names.join(", ")}
                onChange={(e) => handleVariablesChange(e.target.value)}
              />
              <p className="text-[10px] text-muted-foreground">
                Define the order of variables as registered in DLT.
              </p>
            </div>

            <div className="flex items-center space-x-2 pt-1 border-t mt-2">
              <Switch 
                id="active" 
                checked={!!formData.is_active} 
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="active" className="text-xs font-semibold cursor-pointer">Mark as Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}>
               {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save Template"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={confirmDelete}
        title="Delete Template"
        description="Are you sure you want to delete this template? This action cannot be undone."
        variant="destructive"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default SMSTemplates;
