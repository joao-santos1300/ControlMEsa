"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { homeFor, useAuth } from "@/lib/auth";
import { Loading } from "@/components/ui";

export default function Home() {
  const { session, ready } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    router.replace(session ? homeFor(session.role) : "/login");
  }, [ready, session, router]);

  return <Loading />;
}
