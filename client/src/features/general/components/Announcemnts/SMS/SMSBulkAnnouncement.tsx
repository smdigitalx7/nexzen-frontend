import { useState, useMemo } from "react";
import { useSMSTemplates, useSendBulkSMS, type SMSTemplate } from "@/features/general/hooks/useSMS";
import { useSchoolClasses } from "@/features/school/hooks/use-school-classes";
import { useQuery } from "@tanstack/react-query";
import { TransportService } from "@/features/school/services/transport.service";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/common/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/common/components/ui/card";
import { Loader } from "@/common/components/ui/ProfessionalLoader";
import { Badge } from "@/common/components/ui/badge";
import { Textarea } from "@/common/components/ui/textarea";
import { Send, Users, Bus, FileText, Info, AlertCircle } from "lucide-react";
import { Checkbox } from "@/common/components/ui/checkbox";

const SMSBulkAnnouncement = () => {
  const { data: templates = [], isLoading: isTemplatesLoading } = useSMSTemplates();
  const { data: classes = [], isLoading: isClassesLoading } = useSchoolClasses();
  
  // Custom query for bus routes since there's no hook but service exists
  const { data: routes = [], isLoading: isRoutesLoading } = useQuery({
    queryKey: ["school", "bus-routes", "names"],
    queryFn: () => TransportService.getRouteNames(),
  });

  const sendBulkMutation = useSendBulkSMS();

  const [formData, setFormData] = useState({
    audience_category: "CLASS" as "CLASS" | "TRANSPORT",
    audience_ids: [] as number[],
    template_key: "",
    template_variables: {} as Record<string, string>,
    title: "",
    content: "",
  });

  const selectedTemplate = useMemo(() => 
    templates.filter(t => t.is_active).find(t => t.template_key === formData.template_key),
  [templates, formData.template_key]);

  const handleTemplateChange = (key: string) => {
    const template = (templates as SMSTemplate[]).find(t => t.template_key === key);
    const initialVars: Record<string, string> = {};
    template?.variable_names.forEach(v => {
      initialVars[v] = "";
    });
    setFormData({ 
      ...formData, 
      template_key: key, 
      template_variables: initialVars,
      content: template?.content || "" 
    });
  };

  const handleVariableChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      template_variables: {
        ...formData.template_variables,
        [name]: value,
      },
    });
  };

  const toggleClass = (id: number) => {
    const ids = [...formData.audience_ids];
    const index = ids.indexOf(id);
    if (index > -1) {
      ids.splice(index, 1);
    } else {
      ids.push(id);
    }
    setFormData({ ...formData, audience_ids: ids });
  };

  const handleRouteSelect = (id: string) => {
    setFormData({ ...formData, audience_ids: [parseInt(id)] });
  };

  const handleSubmit = async () => {
    try {
      await sendBulkMutation.mutateAsync({
        ...formData,
        audience_ids: formData.audience_ids.length > 0 ? formData.audience_ids : undefined,
      });
    } catch (error) {
       console.error("Failed to send bulk SMS", error);
    }
  };

  const isLoading = isTemplatesLoading || isClassesLoading || isRoutesLoading;

  if (isLoading) return <Loader.Data message="Preparing communications..." />;

  const activeTemplates = (templates as SMSTemplate[]).filter(t => t.is_active);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
             <CardTitle>Compose Announcement</CardTitle>
             <CardDescription>Target your audience and select a DLT template.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
             <div className="space-y-4">
               <div className="space-y-2">
                 <Label>Select Audience Category</Label>
                 <div className="grid grid-cols-2 gap-4">
                   <Button 
                     variant={formData.audience_category === "CLASS" ? "default" : "outline"}
                     className="justify-start gap-2"
                     onClick={() => setFormData({ ...formData, audience_category: "CLASS", audience_ids: [] })}
                   >
                     <Users className="h-4 w-4" /> Class-wise
                   </Button>
                   <Button 
                     variant={formData.audience_category === "TRANSPORT" ? "default" : "outline"}
                     className="justify-start gap-2"
                     onClick={() => setFormData({ ...formData, audience_category: "TRANSPORT", audience_ids: [] })}
                   >
                     <Bus className="h-4 w-4" /> Transport-wise
                   </Button>
                 </div>
               </div>

               {formData.audience_category === "CLASS" ? (
                 <div className="space-y-2 border rounded-lg p-4 bg-muted/10">
                   <div className="flex justify-between items-center mb-2">
                     <Label>Target Classes</Label>
                     <Button 
                       variant="outline" 
                       size="sm" 
                       className="h-auto p-1 text-[10px]"
                       onClick={() => setFormData({ 
                         ...formData, 
                         audience_ids: formData.audience_ids.length === classes.length 
                           ? [] 
                           : classes.map((cls: any) => cls.class_id) 
                       })}
                     >
                       {formData.audience_ids.length === classes.length ? "Deselect All" : "Select All Classes"}
                     </Button>
                   </div>
                   <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                     {classes.map((cls) => (
                       <div key={cls.class_id} className="flex items-center space-x-2">
                         <Checkbox 
                           id={`cls-${cls.class_id}`} 
                           checked={formData.audience_ids.includes(cls.class_id)}
                           onCheckedChange={() => toggleClass(cls.class_id)}
                         />
                         <label 
                           htmlFor={`cls-${cls.class_id}`}
                           className="text-xs font-medium leading-none cursor-pointer"
                         >
                           {cls.class_name}
                         </label>
                       </div>
                     ))}
                   </div>
                   {formData.audience_ids.length === 0 && (
                     <p className="text-[10px] text-muted-foreground italic mt-2">
                       No specific classes selected. SMS will be sent to ALL active students.
                     </p>
                   )}
                 </div>
               ) : (
                 <div className="space-y-2">
                   <Label htmlFor="route-select">Select Bus Route (Required)</Label>
                   <Select onValueChange={handleRouteSelect}>
                     <SelectTrigger id="route-select">
                       <SelectValue placeholder="Choose a route..." />
                     </SelectTrigger>
                     <SelectContent>
                       {routes.map((route: any) => (
                         <SelectItem key={route.bus_route_id} value={route.bus_route_id.toString()}>
                           {route.route_name} {route.route_no && `(${route.route_no})`}
                         </SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                 </div>
               )}

               <div className="space-y-2">
                 <Label htmlFor="template">SMS Template (Required)</Label>
                 <Select value={formData.template_key} onValueChange={handleTemplateChange}>
                    <SelectTrigger id="template">
                       <SelectValue placeholder="Select an active template..." />
                    </SelectTrigger>
                    <SelectContent>
                       {activeTemplates.map(t => (
                         <SelectItem key={t.template_key} value={t.template_key}>
                           {t.template_name}
                         </SelectItem>
                       ))}
                       {activeTemplates.length === 0 && (
                         <div className="p-2 text-xs text-muted-foreground italic">No active templates found.</div>
                       )}
                    </SelectContent>
                 </Select>
               </div>

               <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Internal Title (Required)</Label>
                    <Input 
                      id="title" 
                      placeholder="e.g. Exam Schedule Feb 2025" 
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="internal-content">Message Description (For records)</Label>
                    <Textarea 
                      id="internal-content" 
                      placeholder="Brief description of this announcement..." 
                      className="min-h-[80px]"
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    />
                  </div>
               </div>
             </div>

             <div className="pt-4">
                <Button 
                  className="w-full gap-2" 
                  size="lg"
                  disabled={!formData.template_key || (formData.audience_category === "TRANSPORT" && formData.audience_ids.length === 0) || !formData.title || sendBulkMutation.isPending}
                  onClick={handleSubmit}
                >
                  <Send className="h-4 w-4" />
                  {sendBulkMutation.isPending ? "Queuing Messages..." : "Send Bulk SMS"}
                </Button>
             </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="h-full bg-muted/20">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="h-4 w-4" /> Template Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             {selectedTemplate ? (
               <div className="space-y-4">
                 <div className="bg-white rounded-lg p-3 border border-muted shadow-sm">
                   <p className="text-[10px] text-muted-foreground mb-1 font-semibold uppercase tracking-wider">Preview Content</p>
                   <p className="text-sm italic leading-relaxed text-foreground/80">
                      {selectedTemplate.content}
                   </p>
                 </div>

                 <div className="space-y-3">
                   <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Fill Variables</p>
                   {selectedTemplate.variable_names.length > 0 ? (
                     selectedTemplate.variable_names.map((v) => (
                       <div key={v} className="space-y-1.5">
                         <Label htmlFor={`var-${v}`} className="text-xs flex items-center gap-1">
                           {v} <span className="text-red-500">*</span>
                         </Label>
                         <Input 
                           id={`var-${v}`} 
                           className="h-8 text-xs border-red-500 focus-visible:ring-red-500"
                           placeholder={`Value for {${v}}`}
                           value={formData.template_variables[v] || ""}
                           onChange={(e) => handleVariableChange(v, e.target.value)}
                         />
                       </div>
                     ))
                   ) : (
                     <div className="flex items-center gap-2 text-xs text-muted-foreground bg-white/50 p-2 rounded border border-dashed">
                       <Info className="h-3 w-3" /> No variables required for this template.
                     </div>
                   )}
                 </div>
                 
                 <div className="pt-2 border-t border-muted">
                    <p className="text-[10px] text-muted-foreground">DLT ID: <span className="font-mono">{selectedTemplate.dlt_template_id}</span></p>
                 </div>
               </div>
             ) : (
               <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                    <AlertCircle className="h-6 w-6 text-muted-foreground/50" />
                  </div>
                  <p className="text-xs text-muted-foreground max-w-[150px]">Choose a template to configure variables and see a preview.</p>
               </div>
             )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SMSBulkAnnouncement;
