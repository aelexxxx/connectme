'use client';

import { Suspense } from "react";
import AppLayout from "@/components/layout/AppLayout";
import CommunitiesContent from "./_components/CommunitiesContent";
import { Loader2 } from "lucide-react";

export default function CommunitiesPage() {
  return (
    <AppLayout>
      <Suspense fallback={
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading communities...</span>
        </div>
      }>
        <CommunitiesContent />
      </Suspense>
    </AppLayout>
  );
}
