'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Bug, Loader2, Plus, Puzzle, Sparkles, Wrench } from 'lucide-react';
import { toast } from 'sonner';

import { postSchema, type PostInput } from '@/lib/validations';
import type { PostStatus } from '@/types/database';
import { createPostAction } from '@/lib/actions/posts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface CreatePostDialogProps {
  isLoggedIn?: boolean;
  buttonLabel?: string;
  buttonVariant?: 'default' | 'outline' | 'secondary';
  buttonSize?: 'default' | 'sm' | 'lg';
  defaultStatus?: PostStatus;
  className?: string;
}

const CATEGORIES = [
  { id: 'feature', label: 'Feature', icon: Sparkles, desc: 'New idea or proposal' },
  { id: 'bug', label: 'Bug', icon: Bug, desc: 'Broken behavior' },
  { id: 'improvement', label: 'Improvement', icon: Wrench, desc: 'Enhancement' },
  { id: 'integration', label: 'Integration', icon: Puzzle, desc: 'Tool integration' },
] as const;

export function CreatePostDialog({
  isLoggedIn = false,
  buttonLabel = 'Submit Feedback',
  buttonVariant = 'default',
  buttonSize = 'default',
  defaultStatus = 'under_review',
  className,
}: CreatePostDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PostInput>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'feature',
      status: defaultStatus,
    },
  });

  const selectedCategory = watch('category');

  const handleOpenClick = () => {
    if (!isLoggedIn) {
      toast.info('Please sign in to submit new feedback', {
        action: {
          label: 'Sign In',
          onClick: () => router.push('/login'),
        },
      });
      return;
    }
    setOpen(true);
  };

  const onSubmit = async (values: PostInput) => {
    setIsSubmitting(true);
    const res = await createPostAction(values);
    setIsSubmitting(false);

    if (res.success) {
      toast.success('Feedback submitted! Thank you.');
      setOpen(false);
      reset();
    } else {
      toast.error(res.error || 'Failed to submit feedback');
    }
  };

  return (
    <>
      <Button
        variant={buttonVariant}
        size={buttonSize}
        className={cn('cursor-pointer shadow-xs gap-1 font-mono text-xs', className)}
        onClick={handleOpenClick}
      >
        <Plus className="h-3.5 w-3.5" />
        <span>{buttonLabel}</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md rounded-xl bg-card border-border p-5 font-mono">
          <DialogHeader>
            <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] font-mono">
              <Sparkles className="h-3.5 w-3.5" />
              <span>// submit feedback</span>
            </div>
            <DialogTitle className="text-base font-mono font-bold tracking-tight">
              Create Feedback Item
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground font-sans">
              Provide context and expected behavior for the engineering team.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5 pt-1">
            {/* Category Visual Cards */}
            <div className="space-y-1.5">
              <Label className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">Category</Label>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setValue('category', cat.id)}
                      className={cn(
                        'flex items-center gap-2 p-2 rounded-lg border text-left transition-all cursor-pointer font-mono text-xs min-w-0',
                        isSelected
                          ? 'border-foreground bg-muted text-foreground font-semibold shadow-xs'
                          : 'border-border bg-background hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0" />
                      <div className="overflow-hidden min-w-0 flex-1">
                        <div className="text-[11px] leading-none font-semibold truncate">{cat.label}</div>
                        <div className="text-[9px] text-muted-foreground truncate mt-0.5 font-sans">{cat.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Title */}
            <div className="space-y-1">
              <Label htmlFor="title" className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                Title
              </Label>
              <Input
                id="title"
                placeholder="Brief summary..."
                {...register('title')}
                className="h-8 text-xs rounded-md bg-background border-border font-mono"
              />
              {errors.title && (
                <p className="text-[10px] text-destructive font-mono">
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1">
              <Label htmlFor="description" className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="What problem does this address..."
                rows={3}
                {...register('description')}
                className="text-xs rounded-md bg-background border-border resize-none font-mono"
              />
              {errors.description && (
                <p className="text-[10px] text-destructive font-mono">
                  {errors.description.message}
                </p>
              )}
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setOpen(false)}
                className="rounded-md font-mono"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting}
                className="gap-1.5 rounded-md font-mono"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Plus className="h-3.5 w-3.5" />
                    Submit
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
