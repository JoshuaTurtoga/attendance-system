"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function StudentIndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/student/today");
  }, [router]);

  return null;
}
