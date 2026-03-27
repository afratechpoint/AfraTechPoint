import React from "react";
import { Metadata } from "next";
import AdminClientLayout from "@/components/admin/AdminClientLayout";

export const metadata: Metadata = {
  title: "Admin Panel | Afra Tech Point",
  description: "Manage your Afra Tech Point store.",
  manifest: "/api/manifest/admin",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ATP Admin",
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminClientLayout>{children}</AdminClientLayout>;
}
