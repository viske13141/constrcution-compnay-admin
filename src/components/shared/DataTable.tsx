import React, { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Button } from '@/src/components/ui/button';

export interface ColumnDef<T> {
  key: string;
  header: string;
  align?: 'left' | 'right';
  sortValue?: (row: T) => string | number;
  render: (row: T) => React.ReactNode;
  mobileLabel?: string;
  hideOnMobileCard?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  keyExtractor: (row: T) => string;
  pageSize?: number;
  onRowClick?: (row: T) => void;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  pageSize = 8,
  onRowClick,
  emptyTitle = 'No matching records',
  emptyDescription = 'Adjust your filters or add a new entry to populate this view.',
  emptyAction,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);

  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    const col = columns.find((c) => c.key === sortKey);
    if (!col?.sortValue) return data;
    const getter = col.sortValue;
    return [...data].sort((a, b) => {
      const av = getter(a);
      const bv = getter(b);
      if (av === bv) return 0;
      const cmp = av < bv ? -1 : 1;
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [data, columns, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageData = sortedData.slice((safePage - 1) * pageSize, safePage * pageSize);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(1);
  };

  if (data.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-8 text-center">
        <p className="text-sm font-medium text-[#172B4D]">{emptyTitle}</p>
        <p className="mt-1 text-xs text-[#64748B] max-w-md mx-auto">{emptyDescription}</p>
        {emptyAction && <div className="mt-4">{emptyAction}</div>}
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
      {/* Desktop / Tablet Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70">
              {columns.map((col) => {
                const isSortable = Boolean(col.sortValue);
                const isSorted = sortKey === col.key;
                return (
                  <th
                    key={col.key}
                    className={cn(
                      'px-4 py-2.5 text-xs font-semibold text-[#64748B] whitespace-nowrap',
                      col.align === 'right' && 'text-right'
                    )}
                  >
                    {isSortable ? (
                      <button
                        type="button"
                        onClick={() => handleSort(col.key)}
                        className={cn(
                          'inline-flex items-center gap-1 hover:text-[#172B4D] cursor-pointer',
                          col.align === 'right' && 'flex-row-reverse'
                        )}
                      >
                        <span>{col.header}</span>
                        {isSorted ? (
                          sortDir === 'asc' ? (
                            <ArrowUp className="h-3 w-3 text-[#2563EB]" />
                          ) : (
                            <ArrowDown className="h-3 w-3 text-[#2563EB]" />
                          )
                        ) : (
                          <ArrowUpDown className="h-3 w-3 opacity-40" />
                        )}
                      </button>
                    ) : (
                      col.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {pageData.map((row) => (
              <tr
                key={keyExtractor(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(
                  'transition-colors',
                  onRowClick ? 'hover:bg-slate-50 cursor-pointer' : 'hover:bg-slate-50/50'
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      'px-4 py-2.5 align-middle text-[#172B4D]',
                      col.align === 'right' && 'text-right tabular-nums'
                    )}
                  >
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List (360px - 767px) */}
      <div className="md:hidden divide-y divide-slate-200">
        {pageData.map((row) => (
          <div
            key={keyExtractor(row)}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
            className={cn('p-4 space-y-2', onRowClick && 'active:bg-slate-50 cursor-pointer')}
          >
            {columns
              .filter((c) => !c.hideOnMobileCard)
              .map((col, idx) => (
                <div
                  key={col.key}
                  className={cn(
                    idx === 0
                      ? 'font-medium text-[#172B4D]'
                      : 'flex items-center justify-between gap-3 text-xs'
                  )}
                >
                  {idx > 0 && (
                    <span className="text-[#64748B] shrink-0">{col.mobileLabel || col.header}</span>
                  )}
                  <div className={cn(idx > 0 && 'text-right text-[#172B4D] tabular-nums min-w-0')}>
                    {col.render(row)}
                  </div>
                </div>
              ))}
          </div>
        ))}
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between border-t border-slate-200 px-4 py-2.5 text-xs text-[#64748B] bg-slate-50/40">
        <span className="tabular-nums">
          Showing {(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, sortedData.length)} of{' '}
          {sortedData.length}
        </span>
        <div className="flex items-center gap-1.5">
          <Button
            variant="secondary"
            size="sm"
            disabled={safePage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="h-7 px-2"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <span className="px-2 tabular-nums font-medium text-[#172B4D]">
            {safePage} / {totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={safePage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="h-7 px-2"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
