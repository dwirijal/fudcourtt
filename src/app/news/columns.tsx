
'use client'

import * as React from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import type { Post } from '@/types'
import { format } from 'date-fns'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export const columns: ColumnDef<Post>[] = [
    {
      id: 'expander',
      header: () => null,
      cell: ({ row }) => {
        return (
          <Button
            onClick={() => row.toggleExpanded()}
            variant="ghost"
            size="icon"
            className="h-8 w-8"
          >
            <ChevronRight
              className={cn(
                'h-4 w-4 transition-transform duration-200',
                row.getIsExpanded() && 'rotate-90'
              )}
            />
          </Button>
        )
      },
    },
    {
        accessorKey: 'title',
        header: 'Judul',
        cell: ({ row }) => {
            const post = row.original
            return (
                <Link href={`/news/${post.slug}`} className="hover:text-primary transition-colors font-semibold">
                    {post.title}
                </Link>
            )
        },
    },
    {
        accessorKey: 'published_at',
        header: () => <div className="text-right">Tanggal Terbit</div>,
        cell: ({ row }) => {
            const dateString = row.getValue('published_at') as string;
            const [formattedDate, setFormattedDate] = React.useState('');

            React.useEffect(() => {
                // Defer date formatting to the client to prevent hydration mismatch
                setFormattedDate(format(new Date(dateString), "d MMMM yyyy"));
            }, [dateString]);
            
            return <div className="text-right tabular-nums text-muted-foreground">{formattedDate || '...'}</div>
        },
    },
]
