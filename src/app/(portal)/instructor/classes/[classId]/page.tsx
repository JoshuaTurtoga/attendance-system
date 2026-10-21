"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function InstructorClassIndexPage() {
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    if (params.classId) {
      router.replace(`/instructor/classes/${params.classId}/roster`);
    }
  }, [params.classId, router]);

  return null;
}
