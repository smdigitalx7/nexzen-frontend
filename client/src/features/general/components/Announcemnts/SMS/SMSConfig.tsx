import { useState, useEffect } from "react";
import { useSMSConfig, useCreateSMSConfig, useUpdateSMSConfig, type SMSConfig as SMSConfigType } from "@/features/general/hooks/useSMS";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/common/components/ui/select";
import { Switch } from "@/common/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/common/components/ui/card";
import { Loader } from "@/common/components/ui/ProfessionalLoader";
import { ShieldCheck, Info, Save } from "lucide-react";

const SMSConfig = () => {
  const { data: config, isLoading } = useSMSConfig();
  const createMutation = useCreateSMSConfig();
  const updateMutation = useUpdateSMSConfig();

  const [formData, setFormData] = useState({
    sms_api_key: "",
    sms_route: "dlt" as any,
    sms_flash: false,
    dlt_entity_id: "",
    sender_id: "",
    is_active: true,
  });

  useEffect(() => {
    if (config) {
      setFormData({
        sms_api_key: "", // API key is never exposed
        sms_route: (config as SMSConfigType).sms_route,
        sms_flash: (config as SMSConfigType).sms_flash,
        dlt_entity_id: (config as SMSConfigType).dlt_entity_id || "",
        sender_id: (config as SMSConfigType).sender_id,
        is_active: (config as SMSConfigType).is_active,
      });
    }
  }, [config]);

  const handleSave = async () => {
    try {
      if (config) {
        await updateMutation.mutateAsync({
          ...formData,
          sms_api_key: formData.sms_api_key || undefined,
        });
      } else {
        await createMutation.mutateAsync(formData);
      }
    } catch (error) {
       console.error("Failed to save config", error);
    }
  };

  if (isLoading) return <Loader.Data message="Loading configuration..." />;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            SMS gateway Settings
          </CardTitle>
          <CardDescription>
            Configure your SMS provider (Fast2SMS) and DLT details.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="api_key">Fast2SMS API Key</Label>
              <Input 
                id="api_key" 
                type="password" 
                placeholder={config ? "••••••••••••••••" : "Enter API Key"} 
                value={formData.sms_api_key}
                onChange={(e) => setFormData({ ...formData, sms_api_key: e.target.value })}
              />
              <p className="text-[10px] text-muted-foreground">
                API key is encrypted and never shown back for security.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="route">SMS Route</Label>
                <Select 
                  value={formData.sms_route} 
                  onValueChange={(val) => setFormData({ ...formData, sms_route: val })}
                >
                  <SelectTrigger id="route">
                    <SelectValue placeholder="Select Route" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dlt">DLT (Transactional)</SelectItem>
                    <SelectItem value="dlt_manual">DLT Manual</SelectItem>
                    <SelectItem value="q">Quick (Service)</SelectItem>
                    <SelectItem value="otp">OTP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sender_id">Sender ID (DLT Header)</Label>
                <Input 
                  id="sender_id" 
                  placeholder="e.g. NZNEDU" 
                  maxLength={6}
                  value={formData.sender_id}
                  onChange={(e) => setFormData({ ...formData, sender_id: e.target.value.toUpperCase() })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="entity_id">DLT Entity ID</Label>
              <Input 
                id="entity_id" 
                placeholder="16-digit DLT Registration ID" 
                value={formData.dlt_entity_id}
                onChange={(e) => setFormData({ ...formData, dlt_entity_id: e.target.value })}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/20 border rounded-lg">
              <div className="space-y-1">
                <Label htmlFor="flash">Flash SMS</Label>
                <p className="text-xs text-muted-foreground">Messages appear instantly on screen (use with caution).</p>
              </div>
              <Switch 
                id="flash" 
                checked={formData.sms_flash} 
                onCheckedChange={(checked) => setFormData({ ...formData, sms_flash: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/20 border rounded-lg">
              <div className="space-y-1">
                <Label htmlFor="active">System Status</Label>
                <p className="text-xs text-muted-foreground">Enable or disable all SMS outgoing services.</p>
              </div>
              <Switch 
                id="active" 
                checked={formData.is_active} 
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>
          </div>

          <div className="pt-4">
             <Button onClick={handleSave} className="w-full gap-2" disabled={createMutation.isPending || updateMutation.isPending}>
               <Save className="h-4 w-4" />
               {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save Configuration"}
             </Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex gap-3 text-primary">
         <Info className="h-5 w-5 mt-0.5 flex-shrink-0" />
         <div className="text-xs space-y-1 leading-relaxed">
            <p className="font-semibold">Important Note:</p>
            <p>Ensure your Sender ID and DLT Entity ID match exactly what is approved in your Fast2SMS portal. Incorrect details will cause message delivery failure.</p>
         </div>
      </div>
    </div>
  );
};

export default SMSConfig;
