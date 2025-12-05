"use client";

import { useState, useEffect } from "react";
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
import { Loader2, User, Trash2 } from "lucide-react";
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
      <img 
        src={staff.avatarUrl} 
        alt={staff.displayName}
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

  const form = useForm<StaffForm>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      displayName: "",
      fullName: "",
      role: "WAITER",
      avatarUrl: "",
    },
  });

  useEffect(() => {
    async function fetchData() {
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
    }
    fetchData();
  }, []);

  const handleAddStaff = async (data: StaffForm) => {
    if (!venueId) {
      setError("Venue not loaded");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, venueId }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.message || "Failed to add staff");
        return;
      }
      setStaff([result.staff, ...staff]);
      setIsDialogOpen(false);
      form.reset();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
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
                <Label htmlFor="avatarUrl">{t('photo')}</Label>
                <Input
                  id="avatarUrl"
                  placeholder={t('photoPlaceholder')}
                  {...form.register("avatarUrl")}
                  className="h-12"
                />
                <p className="text-xs text-muted-foreground">
                  {t('photoHint')}
                </p>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 text-lg font-heading font-bold bg-gradient-to-r from-cyan-500 to-blue-600"
              >
                {isLoading ? t('adding') : t('addStaffButton')}
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
