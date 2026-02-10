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
      <DialogContent className="sm:max-w-[750px]">
        <DialogHeader className="pb-2 border-b">
          <DialogTitle>{editingTemplate ? "Edit Template" : "Add New Template"}</DialogTitle>
        </DialogHeader>

        <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-2 flex items-center justify-between text-[11px] text-blue-700">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 shrink-0" />
            <span className="font-semibold">DLT Registration required before adding templates.</span>
          </div>
          <div className="flex gap-2 text-[10px] text-blue-600/80">
            <span>1. Register</span> &rarr;
            <span>2. Get Approval</span> &rarr;
            <span>3. Add Here</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-2">
          {/* Left Column: Metadata */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="key" className="text-xs font-semibold">Template Key <span className="text-red-500">*</span></Label>
              <Input 
                id="key" 
                disabled={!!editingTemplate} 
                placeholder="e.g. EXAM_SCD" 
                className="h-8 text-sm uppercase"
                value={formData.template_key}
                onChange={(e) => setFormData({ ...formData, template_key: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dlt_id" className="text-xs font-semibold">DLT Template ID <span className="text-red-500">*</span></Label>
              <Input 
                id="dlt_id" 
                disabled={!!editingTemplate && !isDltVerified}
                placeholder="e.g. 1007..." 
                className="h-8 text-sm"
                value={formData.dlt_template_id}
                onChange={(e) => setFormData({ ...formData, dlt_template_id: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-semibold">Display Name <span className="text-red-500">*</span></Label>
              <Input 
                id="name" 
                placeholder="e.g. Exam Schedule Notification" 
                className="h-8 text-sm"
                value={formData.template_name}
                onChange={(e) => setFormData({ ...formData, template_name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vars" className="text-xs font-semibold">Variable Names</Label>
              <Input 
                id="vars" 
                disabled={!!editingTemplate && !isDltVerified}
                placeholder="e.g. name, date, subject" 
                className="h-8 text-sm"
                value={formData.variable_names.join(", ")}
                onChange={(e) => handleVariablesChange(e.target.value)}
              />
              <p className="text-[10px] text-muted-foreground">Order must match DLT registration.</p>
            </div>
          </div>

          {/* Right Column: Content & Status */}
          <div className="space-y-4 flex flex-col h-full">
             {editingTemplate && (
                <div className="flex items-center space-x-2 p-2 bg-amber-50/50 border border-amber-100 rounded mb-1">
                  <Switch 
                    id="dlt-verified" 
                    checked={isDltVerified} 
                    onCheckedChange={setIsDltVerified}
                    className="data-[state=checked]:bg-amber-600"
                  />
                  <Label htmlFor="dlt-verified" className="text-[10px] font-bold text-amber-900 cursor-pointer">
                    Click to Enable Content Updates
                  </Label>
                </div>
              )}

            <div className="space-y-2 flex-1 flex flex-col">
              <Label htmlFor="content" className="text-xs font-semibold">Template Content <span className="text-red-500">*</span></Label>
              <Textarea 
                id="content" 
                disabled={!!editingTemplate && !isDltVerified}
                placeholder="Dear {#var#}, your exam is on {#var#}" 
                className="flex-1 min-h-[180px] text-sm resize-none p-3"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              />
              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Info className="h-3 w-3" /> Content must exactly match DLT.
              </p>
            </div>

            <div className="flex items-center space-x-2 pt-2 border-t">
              <Switch 
                id="active" 
                checked={!!formData.is_active} 
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="active" className="text-xs font-semibold cursor-pointer">Mark as Active</Label>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t pt-3">
          <Button variant="outline" onClick={() => setIsFormOpen(false)} size="sm" className="h-8">Cancel</Button>
          <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending} size="sm" className="h-8">
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
