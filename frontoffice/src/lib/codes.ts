"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export type Code = {
  id: number;
  groupCode: string;
  code: string;
  name: string;
  sortOrder: number;
  active: boolean;
};

/** 공통코드(/api/codes)를 1회 로드해 그룹/코드 → 한글명 조회 제공. */
export function useCodes() {
  const [codes, setCodes] = useState<Code[]>([]);

  useEffect(() => {
    api<Code[]>("/api/codes").then(setCodes).catch(() => {});
  }, []);

  const label = (group: string, code: string, fallback?: string) =>
    codes.find((c) => c.groupCode === group && c.code === code)?.name ?? fallback ?? code;

  return { codes, label };
}
