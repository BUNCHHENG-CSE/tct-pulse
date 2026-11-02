'use client';

import * as React from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { formatDistanceToNow } from 'date-fns';
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Download,
  FileJson,
  FileSpreadsheet,
  GitMerge,
  MoreHorizontal,
  Search,
  ShieldCheck,
  Trash2,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

import type { Post, PostStatus } from '@/types/database';
import {
  updatePostStatusAction,
  deletePostAction,
  bulkUpdateStatusAction,
  bulkDeletePostsAction,
} from '@/lib/actions/posts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getCategoryBadge } from './post-card';
import { PostDetailSheet } from './post-detail-sheet';
import { CreatePostDialog } from './create-post-dialog';
import { MergePostDialog } from './merge-post-dialog';

interface FeedbackDataTableProps {
  initialPosts: Post[];
  isLoggedIn?: boolean;
  currentUserEmail?: string | null;
}

export function FeedbackDataTable({
  initialPosts,
  isLoggedIn = false,
  currentUserEmail,
}: FeedbackDataTableProps) {
  const [data, setData] = React.useState<Post[]>(initialPosts);
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'upvotes_count', desc: true },
  ]);
  const [rowSelection, setRowSelection] = React.useState<Record<string, boolean>>({});
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState<string>('all');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');

  const [selectedPost, setSelectedPost] = React.useState<Post | null>(null);
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);

  // Merge modal state
  const [mergeSourcePost, setMergeSourcePost] = React.useState<Post | null>(null);
  const [isMergeOpen, setIsMergeOpen] = React.useState(false);

  React.useEffect(() => {
    setData(initialPosts);
  }, [initialPosts]);

  const handleVoteChange = (postId: string, newCount: number, hasUpvoted: boolean) => {
    setData((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, upvotes_count: newCount, has_upvoted: hasUpvoted }
          : p
      )
    );
    setSelectedPost((prev) =>
      prev && prev.id === postId
        ? { ...prev, upvotes_count: newCount, has_upvoted: hasUpvoted }
        : prev
    );
  };

  const handleStatusUpdate = async (postId: string, newStatus: PostStatus) => {
    const res = await updatePostStatusAction(postId, newStatus);
    if (res.success) {
      setData((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, status: newStatus } : p))
      );
      toast.success(`Status updated to ${newStatus.replace('_', ' ')}`);
    } else {
      toast.error(res.error || 'Failed to update status');
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to permanently delete this post?')) return;
    const res = await deletePostAction(postId);
    if (res.success) {
      setData((prev) => prev.filter((p) => p.id !== postId));
      toast.success('Post deleted');
    } else {
      toast.error(res.error || 'Failed to delete post');
    }
  };

  const filteredData = React.useMemo(() => {
    return data.filter((item) => {
      if (categoryFilter !== 'all' && item.category !== categoryFilter) {
        return false;
      }
      if (statusFilter !== 'all' && item.status !== statusFilter) {
        return false;
      }
      if (globalFilter.trim()) {
        const query = globalFilter.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query);
        const matchesAuthor = (item.author_email || '').toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc && !matchesAuthor) {
          return false;
        }
      }
      return true;
    });
  }, [data, categoryFilter, statusFilter, globalFilter]);

  // Export handlers
  const handleExportCSV = () => {
    const headers = [
      'ID',
      'Title',
      'Category',
      'Status',
      'Target Quarter',
      'Upvotes',
      'Submitter',
      'Created At',
      'Official Response',
    ];
    const rows = filteredData.map((p) => [
      `"${p.id}"`,
      `"${p.title.replace(/"/g, '""')}"`,
      `"${p.category}"`,
      `"${p.status}"`,
      `"${p.target_quarter || ''}"`,
      p.upvotes_count,
      `"${p.author_email || 'community'}"`,
      `"${p.created_at}"`,
      `"${(p.admin_response || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `tctpulse-feedback-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${filteredData.length} items to CSV`);
  };

  const handleExportJSON = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(filteredData, null, 2)
    )}`;
    const link = document.createElement('a');
    link.setAttribute('href', jsonString);
    link.setAttribute(
      'download',
      `tctpulse-feedback-${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${filteredData.length} items to JSON`);
  };

  // Bulk actions handlers
  const selectedRowIds = Object.keys(rowSelection).filter((k) => rowSelection[k]);
  const selectedPosts = selectedRowIds
    .map((id) => filteredData[Number(id)])
    .filter(Boolean);

  const handleBulkStatus = async (status: PostStatus) => {
    const postIds = selectedPosts.map((p) => p.id);
    if (postIds.length === 0) return;

    const res = await bulkUpdateStatusAction(postIds, status);
    if (res.success) {
      setData((prev) =>
        prev.map((p) => (postIds.includes(p.id) ? { ...p, status } : p))
      );
      setRowSelection({});
      toast.success(`Moved ${postIds.length} items to ${status.replace('_', ' ')}`);
    } else {
      toast.error(res.error || 'Bulk update failed');
    }
  };

  const handleBulkDelete = async () => {
    const postIds = selectedPosts.map((p) => p.id);
    if (postIds.length === 0) return;

    if (!confirm(`Are you sure you want to delete ${postIds.length} selected items?`)) {
      return;
    }

    const res = await bulkDeletePostsAction(postIds);
    if (res.success) {
      setData((prev) => prev.filter((p) => !postIds.includes(p.id)));
      setRowSelection({});
      toast.success(`Deleted ${postIds.length} items`);
    } else {
      toast.error(res.error || 'Bulk delete failed');
    }
  };

  const columns = React.useMemo<ColumnDef<Post>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            onChange={(e) => table.toggleAllPageRowsSelected(!!e.target.checked)}
            aria-label="Select all"
            className="h-3.5 w-3.5 rounded border-border text-foreground accent-foreground cursor-pointer"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={(e) => row.toggleSelected(!!e.target.checked)}
            aria-label="Select row"
            className="h-3.5 w-3.5 rounded border-border text-foreground accent-foreground cursor-pointer"
          />
        ),
        enableSorting: false,
      },
      {
        accessorKey: 'title',
        header: 'Feedback & Summary',
        cell: ({ row }) => {
          const post = row.original;
          return (
            <div
              className="space-y-1 max-w-md cursor-pointer group/title"
              onClick={() => {
                setSelectedPost(post);
                setIsSheetOpen(true);
              }}
            >
              <div className="flex items-center gap-2 flex-wrap">
                {getCategoryBadge(post.category)}
                <span className="font-mono font-semibold text-xs text-foreground group-hover/title:text-foreground/80 transition-colors line-clamp-1">
                  {post.title}
                </span>
                {post.target_quarter && (
                  <span className="inline-flex items-center gap-0.5 text-[9px] px-1 py-0.2 rounded border border-border bg-muted/60 text-muted-foreground font-mono">
                    🎯 {post.target_quarter}
                  </span>
                )}
                {post.admin_response && (
                  <span
                    className="inline-flex items-center gap-0.5 text-[9px] px-1 py-0.2 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono"
                    title="Official Team Response Pinned"
                  >
                    <ShieldCheck className="h-2.5 w-2.5" /> Team Replied
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground line-clamp-1 font-sans">
                {post.description}
              </p>
            </div>
          );
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const post = row.original;
          return (
            <Select
              value={post.status}
              onValueChange={(val) => handleStatusUpdate(post.id, val as PostStatus)}
            >
              <SelectTrigger className="h-7 w-28 text-[11px] font-mono rounded-md bg-background border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="font-mono text-xs">
                <SelectItem value="under_review">Review</SelectItem>
                <SelectItem value="planned">Planned</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
              </SelectContent>
            </Select>
          );
        },
      },
      {
        accessorKey: 'upvotes_count',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              size="sm"
              className="-ml-2 h-7 text-xs font-mono font-semibold hover:bg-muted rounded"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Upvotes
              <ArrowUpDown className="ml-1 h-3 w-3" />
            </Button>
          );
        },
        cell: ({ row }) => (
          <div className="font-mono text-[11px] font-bold text-foreground inline-flex items-center gap-1 px-2 py-0.5 rounded bg-muted border border-border">
            <span>▲</span> {row.original.upvotes_count}
          </div>
        ),
      },
      {
        accessorKey: 'author_email',
        header: 'Submitter',
        cell: ({ row }) => (
          <span className="text-[11px] text-muted-foreground font-mono truncate max-w-[120px] block">
            {row.original.author_email || 'community'}
          </span>
        ),
      },
      {
        accessorKey: 'created_at',
        header: 'Submitted',
        cell: ({ row }) => (
          <span className="text-[11px] text-muted-foreground whitespace-nowrap font-mono">
            {formatDistanceToNow(new Date(row.original.created_at), { addSuffix: true })}
          </span>
        ),
      },
      {
        id: 'actions',
        cell: ({ row }) => {
          const post = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded text-muted-foreground hover:text-foreground"
                >
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-lg font-mono">
                <DropdownMenuLabel className="text-[10px] uppercase tracking-wider">
                  Actions
                </DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedPost(post);
                    setIsSheetOpen(true);
                  }}
                  className="text-xs cursor-pointer"
                >
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setMergeSourcePost(post);
                    setIsMergeOpen(true);
                  }}
                  className="text-xs cursor-pointer gap-1.5"
                >
                  <GitMerge className="h-3 w-3" />
                  Merge into...
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleDelete(post.id)}
                  className="text-xs text-destructive focus:text-destructive cursor-pointer"
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      rowSelection,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div className="space-y-3 font-mono">
      {/* Search & Filters Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 rounded-xl border border-border bg-card p-3 shadow-xs">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[180px] max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search feedback..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-8 pr-7 h-8 text-xs rounded-md bg-background border-border font-mono"
            />
            {globalFilter && (
              <button
                type="button"
                onClick={() => setGlobalFilter('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="h-8 w-32 text-xs rounded-md bg-background border-border font-mono">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="rounded-lg font-mono text-xs">
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="feature">Features</SelectItem>
              <SelectItem value="bug">Bugs</SelectItem>
              <SelectItem value="improvement">Improvements</SelectItem>
              <SelectItem value="integration">Integrations</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-8 w-32 text-xs rounded-md bg-background border-border font-mono">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="rounded-lg font-mono text-xs">
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="under_review">Review</SelectItem>
              <SelectItem value="planned">Planned</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          {/* Export Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 text-xs font-mono rounded-md"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-lg font-mono">
              <DropdownMenuItem
                onClick={handleExportCSV}
                className="text-xs cursor-pointer gap-2"
              >
                <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-500" />
                <span>Export as CSV</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleExportJSON}
                className="text-xs cursor-pointer gap-2"
              >
                <FileJson className="h-3.5 w-3.5 text-sky-500" />
                <span>Export as JSON</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <CreatePostDialog
            isLoggedIn={isLoggedIn}
            buttonLabel="New Item"
            buttonSize="sm"
          />
        </div>
      </div>

      {/* Floating Bulk Actions Bar */}
      {selectedPosts.length > 0 && (
        <div className="flex items-center justify-between gap-3 p-2.5 rounded-lg border border-primary/40 bg-primary/5 text-xs font-mono animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <span className="font-bold text-primary">{selectedPosts.length}</span>
            <span className="text-muted-foreground">posts selected</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground">Bulk Status:</span>
            <Select onValueChange={(val) => handleBulkStatus(val as PostStatus)}>
              <SelectTrigger className="h-7 w-32 text-[11px] rounded bg-background border-border">
                <SelectValue placeholder="Move to..." />
              </SelectTrigger>
              <SelectContent className="font-mono text-xs">
                <SelectItem value="under_review">Review</SelectItem>
                <SelectItem value="planned">Planned</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              className="h-7 text-[11px] gap-1 px-2.5 rounded font-mono"
            >
              <Trash2 className="h-3 w-3" />
              <span>Delete</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setRowSelection({})}
              className="h-7 text-[11px] px-2 rounded font-mono text-muted-foreground hover:text-foreground"
            >
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
        <Table>
          <TableHeader className="bg-muted/30">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-border hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-[11px] font-mono font-bold text-muted-foreground h-9">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className="hover:bg-muted/30 transition-colors border-border/70"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-2.5">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-28 text-center text-xs text-muted-foreground font-mono"
                >
                  No feedback items match query.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between px-1">
        <div className="text-[11px] text-muted-foreground font-mono">
          Showing {table.getFilteredRowModel().rows.length} of {data.length} items
        </div>
        <div className="flex items-center space-x-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="h-7 text-xs font-mono rounded"
          >
            <ChevronLeft className="h-3 w-3 mr-1" />
            Prev
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="h-7 text-xs font-mono rounded"
          >
            Next
            <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </div>

      <PostDetailSheet
        post={selectedPost}
        isOpen={isSheetOpen}
        onClose={() => {
          setIsSheetOpen(false);
          setSelectedPost(null);
        }}
        isLoggedIn={isLoggedIn}
        currentUserEmail={currentUserEmail}
        onVoteChange={handleVoteChange}
        allPosts={data}
      />

      <MergePostDialog
        sourcePost={mergeSourcePost}
        isOpen={isMergeOpen}
        onClose={() => {
          setIsMergeOpen(false);
          setMergeSourcePost(null);
        }}
        allPosts={data}
        onMerged={() => {
          setData((prev) => prev.filter((p) => p.id !== mergeSourcePost?.id));
        }}
      />
    </div>
  );
}
