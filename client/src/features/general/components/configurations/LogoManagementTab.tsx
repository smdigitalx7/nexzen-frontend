"use client";

import { useState, useCallback } from "react";
import { Upload, Trash2, Image as ImageIcon, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/common/components/ui/card";
import { Alert, AlertDescription } from "@/common/components/ui/alert";
import { useAuthStore } from "@/core/auth/authStore";
import { useLogoStatus, useLogos, useUploadLogo, useDeleteLogo } from "@/features/general/hooks/use-logos";
import type { LogoType } from "@/features/general/types/logos";
import { useToast } from "@/common/hooks/use-toast";
import { Loader } from "@/common/components/ui/ProfessionalLoader";

export default function LogoManagementTab() {
  const { currentBranch } = useAuthStore();
  const branchId = currentBranch?.branch_id;
  const { toast } = useToast();

  const { data: logoStatus, isLoading: statusLoading } = useLogoStatus(branchId);
  const { data: logos, isLoading: logosLoading } = useLogos(branchId);
  const uploadLogo = useUploadLogo();
  const deleteLogo = useDeleteLogo();

  const [uploadingType, setUploadingType] = useState<LogoType | null>(null);

  const handleFileSelect = useCallback(
    async (logoType: LogoType, file: File | null) => {
      if (!file || !branchId) return;

      // Validate file type
      const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/svg+xml"];
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload PNG, JPG, JPEG, GIF, or SVG files only.",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }

      try {
        setUploadingType(logoType);
        await uploadLogo.mutateAsync({
          branch_id: branchId,
          logo_type: logoType,
          file,
        });
      } catch (error) {
        // Error handled by mutation hook
      } finally {
        setUploadingType(null);
      }
    },
    [branchId, uploadLogo, toast]
  );

  const handleDelete = useCallback(
    async (logoType: LogoType) => {
      if (!branchId) return;

      if (!confirm(`Are you sure you want to delete the ${logoType.toLowerCase()} logo?`)) {
        return;
      }

      try {
        await deleteLogo.mutateAsync({
          branchId,
          logoType,
        });
      } catch (error) {
        // Error handled by mutation hook
      }
    },
    [branchId, deleteLogo]
  );

  const getLogoForType = (logoType: LogoType) => {
    return logos?.find((logo) => logo.logo_type === logoType);
  };

  if (!branchId) {
    return (
      <Alert>
        <AlertDescription>Please select a branch to manage logos.</AlertDescription>
      </Alert>
    );
  }

  if (statusLoading || logosLoading) {
    return <Loader.Data message="Loading logo status..." />;
  }

  const leftLogo = getLogoForType("LEFT");
  const rightLogo = getLogoForType("RIGHT");

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Branch Logos</h3>
        <p className="text-sm text-muted-foreground">
          Upload logos to be used in PDF receipts and documents. Maximum file size: 5MB. Supported formats: PNG, JPG, JPEG, GIF, SVG.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Logo Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Left Logo</span>
              {logoStatus?.has_left_logo ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-gray-400" />
              )}
            </CardTitle>
            <CardDescription>Logo displayed on the left side of documents</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {leftLogo ? (
              <div className="space-y-3">
                <div className="relative w-full h-32 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
                  <img
                    src={`/api/v1/public/logos/${leftLogo.logo_id}/image`}
                    alt="Left logo preview"
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                    <ImageIcon className="h-8 w-8 text-gray-400" />
                  </div>
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>
                    <strong>File:</strong> {leftLogo.file_name}
                  </p>
                  <p>
                    <strong>Size:</strong> {(leftLogo.file_size / 1024).toFixed(2)} KB
                  </p>
                  <p>
                    <strong>Type:</strong> {leftLogo.content_type}
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete("LEFT")}
                  disabled={deleteLogo.isPending}
                  className="w-full"
                >
                  {deleteLogo.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Logo
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No logo uploaded</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <input
                type="file"
                id="left-logo-upload"
                accept="image/png,image/jpeg,image/jpg,image/gif,image/svg+xml"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  handleFileSelect("LEFT", file);
                  // Reset input
                  e.target.value = "";
                }}
                disabled={uploadingType !== null}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById("left-logo-upload")?.click()}
                disabled={uploadingType !== null || uploadLogo.isPending}
                className="w-full"
              >
                {uploadingType === "LEFT" ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : leftLogo ? (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Replace Logo
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Logo
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Right Logo Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Right Logo</span>
              {logoStatus?.has_right_logo ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-gray-400" />
              )}
            </CardTitle>
            <CardDescription>Logo displayed on the right side of documents</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {rightLogo ? (
              <div className="space-y-3">
                <div className="relative w-full h-32 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
                  <img
                    src={`/api/v1/public/logos/${rightLogo.logo_id}/image`}
                    alt="Right logo preview"
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                    <ImageIcon className="h-8 w-8 text-gray-400" />
                  </div>
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>
                    <strong>File:</strong> {rightLogo.file_name}
                  </p>
                  <p>
                    <strong>Size:</strong> {(rightLogo.file_size / 1024).toFixed(2)} KB
                  </p>
                  <p>
                    <strong>Type:</strong> {rightLogo.content_type}
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete("RIGHT")}
                  disabled={deleteLogo.isPending}
                  className="w-full"
                >
                  {deleteLogo.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Logo
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No logo uploaded</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <input
                type="file"
                id="right-logo-upload"
                accept="image/png,image/jpeg,image/jpg,image/gif,image/svg+xml"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  handleFileSelect("RIGHT", file);
                  // Reset input
                  e.target.value = "";
                }}
                disabled={uploadingType !== null}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById("right-logo-upload")?.click()}
                disabled={uploadingType !== null || uploadLogo.isPending}
                className="w-full"
              >
                {uploadingType === "RIGHT" ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : rightLogo ? (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Replace Logo
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Logo
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}










