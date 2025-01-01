"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { LoaderCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import api from "@/lib/api";

const emailSchema = z.object({
  newEmail: z.string().email("Please enter a valid email address"),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters long"),
});

type EmailFormData = z.infer<typeof emailSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

const ProfilePage = () => {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const {
    register: registerEmail,
    handleSubmit: handleSubmitEmail,
    formState: { errors: emailErrors, isSubmitting: isEmailSubmitting },
  } = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/users/${session?.user?.id}/profile`);
      setProfile(response.data.data);
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data.message ?? "Something went wrong");
      } else {
        console.error(error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      fetchProfile();
    }
  }, [session]);

  const handleEmailUpdate = async (data: EmailFormData) => {
    try {
      const response = await api.patch(
        `/api/users/${session?.user?.id}/profile/email`,
        { newEmail: data.newEmail }
      );
      if (response.data.success) {
        toast.success("Email updated successfully. Please verify your new email.");
      }
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data.message ?? "Something went wrong");
      } else {
        console.error(error);
      }
    }
  };

  const handlePasswordUpdate = async (data: PasswordFormData) => {
    try {
      const response = await api.patch(
        `/api/users/${session?.user?.id}/profile/password`,
        {
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }
      );
      if (response.data.success) {
        toast.success("Password updated successfully");
      }
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data.message ?? "Something went wrong");
      } else {
        console.error(error);
      }
    }
  };

  if (!session) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Profile Management</h1>
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input value={profile?.name} disabled />
            </div>
            <div>
              <Label>Username</Label>
              <Input value={profile?.username} disabled />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={profile?.email} disabled />
            </div>
            <div>
              <Label>Bio</Label>
              <Input value={profile?.bio} disabled />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="email" className="mt-8">
        <TabsList>
          <TabsTrigger value="email">Update Email</TabsTrigger>
          <TabsTrigger value="password">Change Password</TabsTrigger>
        </TabsList>
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Update Email</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitEmail(handleEmailUpdate)}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="newEmail">New Email</Label>
                    <Input
                      id="newEmail"
                      {...registerEmail("newEmail")}
                      placeholder="Enter new email"
                    />
                    {emailErrors.newEmail && (
                      <p className="text-red-500 text-sm">
                        {emailErrors.newEmail.message}
                      </p>
                    )}
                  </div>
                  <Button type="submit" disabled={isEmailSubmitting}>
                    {isEmailSubmitting ? (
                      <>
                        <LoaderCircle className="w-4 h-4 mr-2 animate-spin" />
                        Updating Email...
                      </>
                    ) : (
                      "Update Email"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitPassword(handlePasswordUpdate)}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      {...registerPassword("currentPassword")}
                      placeholder="Enter current password"
                    />
                    {passwordErrors.currentPassword && (
                      <p className="text-red-500 text-sm">
                        {passwordErrors.currentPassword.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      {...registerPassword("newPassword")}
                      placeholder="Enter new password"
                    />
                    {passwordErrors.newPassword && (
                      <p className="text-red-500 text-sm">
                        {passwordErrors.newPassword.message}
                      </p>
                    )}
                  </div>
                  <Button type="submit" disabled={isPasswordSubmitting}>
                    {isPasswordSubmitting ? (
                      <>
                        <LoaderCircle className="w-4 h-4 mr-2 animate-spin" />
                        Updating Password...
                      </>
                    ) : (
                      "Change Password"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfilePage;