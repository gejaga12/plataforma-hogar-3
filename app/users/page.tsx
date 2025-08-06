"use client";
import { ProtectedLayout } from "@/components/layout/protected-layout";
import UsersContent from "@/components/users/UserContent";

export default function UsersPage() {
  
  return (
    <ProtectedLayout>
      <UsersContent />
    </ProtectedLayout>
  );
}
