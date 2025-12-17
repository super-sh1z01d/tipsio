"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, User, Trash2, Camera, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslations } from "@/i18n/client";

const staffSchema = z.object({
  displayName: z.string().min(1, "Display name is required"),
  fullName: z.string().optional(),
  role: z.enum(["WAITER", "BARTENDER", "BARISTA", "HOSTESS", "CHEF", "ADMINISTRATOR", "OTHER"]),
  avatarUrl: z.string().optional(),
});

type StaffForm = z.infer<typeof staffSchema>;

type Staff = {
  id: string;
  displayName: string;
  fullName?: string;
  role: string;
  status: string;
  avatarUrl?: string | null;
  balance?: number;
  totalTips?: number;
  qrCode?: { id: string; shortCode: string; status: string };
  user?: { email?: string; phone?: string };
  _count?: { tips: number };
  createdAt?: string;
};

// Avatar component with fallback
function StaffAvatar({ staff }: { staff: Staff }) {
  if (staff.avatarUrl) {
    return (
      <Image 
        src={staff.avatarUrl} 
        alt={staff.displayName}
        width={48} 
        height={48}
        className="w-12 h-12 rounded-full object-cover"
      />
    );
  }
  
  // Fallback avatar with initials
  const initials = staff.displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
    
  return (
    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
      <span className="text-primary font-semibold">{initials || <User className="h-5 w-5" />}</span>
    </div>
  );
}

export default function StaffManagementPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [venueId, setVenueId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
    const t = useTranslations('venue.staff');
  
    const roleLabels: Record<string, string> = {
      WAITER: t('roles.waiter'),
      BARTENDER: t('roles.bartender'),
      BARISTA: t('roles.barista'),
      HOSTESS: t('roles.hostess'),
      CHEF: t('roles.chef'),
      ADMINISTRATOR: t('roles.administrator'),
      OTHER: t('roles.other'),
    };
  
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
  
    const form = useForm<StaffForm>({
      resolver: zodResolver(staffSchema),
      defaultValues: {
        displayName: "",
        fullName: "",
        role: "WAITER",
        avatarUrl: "",
      },
    });
  
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
  
      // Validate file type
      const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
      if (!allowedTypes.includes(file.type)) {
        setError("Только JPEG, PNG, WebP или GIF");
        return;
      }
  
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Файл слишком большой. Максимум 5MB");
        return;
      }
  
      setAvatarFile(file);
      setError(null);
  
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    };
  
    const clearAvatar = () => {
      setAvatarFile(null);
      setAvatarPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    };
  
    const fetchData = useCallback(async () => {
      try {
        const dashRes = await fetch("/api/venues/dashboard?period=week");
        if (!dashRes.ok) throw new Error("Failed to load venue");
        const dashData = await dashRes.json();
  
        if (dashData.venue?.id) {
          setVenueId(dashData.venue.id);
          const staffRes = await fetch(
            `/api/staff?venueId=${dashData.venue.id}`
          );
          if (staffRes.ok) {
            const staffData = await staffRes.json();
            setStaff(staffData.staff || []);
          }
        }
      } catch (err) {
        console.error("Failed to load data:", err);
        setError("Failed to load venue data");
      } finally {
        setIsPageLoading(false);
      }
    }, [setVenueId, setStaff, setError, setIsPageLoading]); // Add all dependencies
  
    useEffect(() => {
      fetchData();
    }, [fetchData]);

  const handleAddStaff = async (data: StaffForm) => {
    if (!venueId) {
      setError("Venue not loaded");
      return;
    }
    setIsLoading(true);
    setError(null);
    
    try {
      let avatarUrl = data.avatarUrl;

      // Upload avatar if file selected
      if (avatarFile) {
        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", avatarFile);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          const uploadError = await uploadRes.json();
          setError(uploadError.message || "Failed to upload photo");
          setIsUploading(false);
          setIsLoading(false);
          return;
        }

        const uploadData = await uploadRes.json();
        avatarUrl = uploadData.url;
        setIsUploading(false);
      }

      const response = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, avatarUrl, venueId }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.message || "Failed to add staff");
        return;
      }
      setStaff([result.staff, ...staff]);
      setIsDialogOpen(false);
      form.reset();
      clearAvatar();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
      setIsUploading(false);
    }
  };

  const handleToggleStatus = async (staffMember: Staff) => {
    const newStatus = staffMember.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      const response = await fetch(`/api/staff/${staffMember.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        setStaff(
          staff.map((s) =>
            s.id === staffMember.id ? { ...s, status: newStatus } : s
          )
        );
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleDeleteStaff = async (staffMember: Staff) => {
    if (!confirm(t('deleteConfirm', { name: staffMember.displayName }))) return;
    
    try {
      const response = await fetch(`/api/staff/${staffMember.id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setStaff(staff.filter((s) => s.id !== staffMember.id));
      }
    } catch (err) {
      console.error("Failed to delete staff:", err);
    }
  };

  if (isPageLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }


  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-heading font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-cyan-500 to-blue-600">
              {t('addStaff')}
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-heavy">
            <DialogHeader>
              <DialogTitle className="font-heading">
                {t('addStaffMember')}
              </DialogTitle>
              <DialogDescription>
                {t('addStaffDesc')}
              </DialogDescription>
            </DialogHeader>

            <form
              onSubmit={form.handleSubmit(handleAddStaff)}
              className="space-y-4"
            >
              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="displayName">{t('displayName')} *</Label>
                <Input
                  id="displayName"
                  placeholder={t('displayNamePlaceholder')}
                  {...form.register("displayName")}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">{t('fullName')}</Label>
                <Input
                  id="fullName"
                  placeholder={t('fullNamePlaceholder')}
                  {...form.register("fullName")}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">{t('role')} *</Label>
                <Select
                  onValueChange={(value) =>
                    form.setValue("role", value as StaffForm["role"])
                  }
                  defaultValue="WAITER"
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder={t('selectRole')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WAITER">{t('roles.waiter')}</SelectItem>
                    <SelectItem value="BARISTA">{t('roles.barista')}</SelectItem>
                    <SelectItem value="BARTENDER">{t('roles.bartender')}</SelectItem>
                    <SelectItem value="HOSTESS">{t('roles.hostess')}</SelectItem>
                    <SelectItem value="CHEF">{t('roles.chef')}</SelectItem>
                    <SelectItem value="ADMINISTRATOR">{t('roles.administrator')}</SelectItem>
                    <SelectItem value="OTHER">{t('roles.other')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t('photo')}</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="avatar-upload"
                />
                
                {avatarPreview ? (
                  <div className="relative w-24 h-24 mx-auto">
                    <Image
                      src={avatarPreview}
                      alt="Preview"
                      width={96}
                      height={96}
                      className="w-24 h-24 rounded-full object-cover border-2 border-primary/20"
                    />
                    <button
                      type="button"
                      onClick={clearAvatar}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-destructive rounded-full flex items-center justify-center text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="avatar-upload"
                    className="flex flex-col items-center justify-center w-24 h-24 mx-auto rounded-full border-2 border-dashed border-muted-foreground/30 cursor-pointer hover:border-primary/50 transition-colors"
                  >
                    <Camera className="w-8 h-8 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground mt-1">{t('addPhoto')}</span>
                  </label>
                )}
                
                <p className="text-xs text-muted-foreground text-center">
                  {t('photoHint')}
                </p>
              </div>

              <Button
                type="submit"
                disabled={isLoading || isUploading}
                className="w-full h-14 text-lg font-heading font-bold bg-gradient-to-r from-cyan-500 to-blue-600"
              >
                {isUploading ? t('uploading') : isLoading ? t('adding') : t('addStaffButton')}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>


      {staff.length === 0 ? (
        <Card className="glass">
          <CardContent className="pt-6 text-center">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-heading font-bold mb-2">
              {t('noStaffYet')}
            </h3>
            <p className="text-muted-foreground mb-4">
              {t('noStaffDesc')}
            </p>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-gradient-to-r from-cyan-500 to-blue-600"
            >
              {t('addFirstStaff')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {staff.map((member) => (
            <Card key={member.id} className="glass">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <StaffAvatar staff={member} />
                    <div>
                      <CardTitle className="font-heading">
                        {member.displayName}
                      </CardTitle>
                      <CardDescription>
                        {roleLabels[member.role] || member.role} •{" "}
                        {member.qrCode?.shortCode || "No QR"}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        member.status === "ACTIVE"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-gray-500/20 text-gray-400"
                      }`}
                    >
                      {member.status === "ACTIVE" ? t('active') : t('inactive')}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleStatus(member)}
                    >
                      {member.status === "ACTIVE" ? t('deactivate') : t('activate')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteStaff(member)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span>💰 {member._count?.tips || 0} {t('tipsCount')}</span>
                  <span>📊 {t('totalEarned')}: Rp {(member.totalTips || 0).toLocaleString()}</span>
                  {(member.balance || 0) > 0 && (
                    <span className="text-primary font-medium">💵 {t('balance')}: Rp {member.balance?.toLocaleString()}</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
