"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

/** Runs `load` once on mount and hands the result to `onLoad`. A failure is usually an expired admin session. */
export const useAdminLoad = <T,>(load: () => Promise<T>, onLoad: (data: T) => void, what: string) => {
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    load()
      .then(onLoad)
      .catch(error => {
        console.error(`Error loading ${what}:`, error);
        toast.error(`Failed to load ${what}. Reload the page; you may need to log in again.`);
      })
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return isLoading;
};

/** Client-side paging over an already-loaded list */
export const usePaged = <T,>(items: T[], perPage = 10) => {
  const [page, setPage] = useState(1);
  const pages = Math.ceil(items.length / perPage);
  return { page, setPage, pages, pageItems: items.slice((page - 1) * perPage, page * perPage) };
};

export const AdminPagination = ({
  page,
  pages,
  onChange,
}: {
  page: number;
  pages: number;
  onChange: (page: number) => void;
}) => (
  <Pagination>
    <PaginationContent>
      <PaginationItem>
        <button disabled={page === 1} onClick={() => onChange(Math.max(1, page - 1))}>
          <PaginationPrevious className={page === 1 ? "pointer-events-none opacity-50" : ""} />
        </button>
      </PaginationItem>
      {Array.from({ length: pages }, (_, i) => (
        <PaginationItem key={i + 1}>
          <button onClick={() => onChange(i + 1)}>
            <PaginationLink isActive={page === i + 1}>{i + 1}</PaginationLink>
          </button>
        </PaginationItem>
      ))}
      <PaginationItem>
        <button disabled={page === pages} onClick={() => onChange(Math.min(pages, page + 1))}>
          <PaginationNext className={page === pages ? "pointer-events-none opacity-50" : ""} />
        </button>
      </PaginationItem>
    </PaginationContent>
  </Pagination>
);
