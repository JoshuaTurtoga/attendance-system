"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function InstructorIndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/instructor/today");
  }, [router]);

  return null;
}
