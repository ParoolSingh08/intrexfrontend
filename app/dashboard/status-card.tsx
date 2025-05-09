// components/dashboard/status-card.tsx
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface StatusCardProps {
  title: string
  status: 'triggered' | 'opened' | 'on' | 'off' | 'standby' | 'cooling'
  value?: string
  actionText?: string
  onAction?: () => void
  className?: string
}

export function StatusCard({ 
  title, 
  status, 
  value, 
  actionText, 
  onAction,
  className 
}: StatusCardProps) {
  // Define status colors
  const statusConfig = {
    triggered: { color: 'text-warning-500', bg: 'bg-warning-500/10' },
    opened: { color: 'text-destructive', bg: 'bg-destructive/10' },
    on: { color: 'text-success-500', bg: 'bg-success/10' },
    off: { color: 'text-muted-foreground', bg: 'bg-muted/20' },
    standby: { color: 'text-info', bg: 'bg-info/10' },
    cooling: { color: 'text-info', bg: 'bg-info/10' },
  }
  
  const { color, bg } = statusConfig[status]
  
  return (
    <Card className={cn("dashboard-card", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={cn(
          "inline-flex px-2 py-1 rounded-md text-xs font-medium mb-2",
          bg, color
        )}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </div>
        
        {value && <div className="text-lg font-semibold mb-4">{value}</div>}
        
        {actionText && onAction && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={onAction}
            className="w-full"
          >
            {actionText}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

// components/dashboard/device-status.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface DeviceStatusProps {
  icon: React.ReactNode
  device: string
  isOn: boolean
  temperature?: string
  status?: string
  remainingTime?: string
  className?: string
}

export function DeviceStatus({ 
  icon, 
  device, 
  isOn, 
  temperature, 
  status,
  remainingTime,
  className 
}: DeviceStatusProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-4">
          {icon}
          <CardTitle className="text-base font-medium">{device}</CardTitle>
        </div>
        <div className={isOn ? "text-success" : "text-muted-foreground"}>
          {isOn ? 'On' : 'Off'}
        </div>
      </CardHeader>
      <CardContent>
        {temperature && (
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm">Temperature</span>
            <span className="font-medium">{temperature}</span>
          </div>
        )}
        {status && (
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm">Status</span>
            <span className={status.toLowerCase() === 'standby' ? 'text-info' : 'text-success'}>
              {status}
            </span>
          </div>
        )}
        {remainingTime && (
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm">Remaining Time</span>
            <span className="font-medium">{remainingTime}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// components/dashboard/data-table.tsx
'use client'

import { useState } from 'react'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  ColumnFiltersState,
  getFilteredRowModel,
} from '@tanstack/react-table'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchColumn?: string
  searchPlaceholder?: string
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchColumn,
  searchPlaceholder = 'Search...',
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  })

  return (
    <div>
      {/* Search input */}
      {searchColumn && (
        <div className="flex items-center py-4">
          <Input
            placeholder={searchPlaceholder}
            value={(table.getColumn(searchColumn)?.getFilterValue() as string) ?? ''}
            onChange={(event) =>
              table.getColumn(searchColumn)?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
        </div>
      )}
      
      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHeader key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHeader>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination */}
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} of{" "}
          {table.getCoreRowModel().rows.length} row(s).
        </div>
        <div className="flex items-center space-x-2">
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value))
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}