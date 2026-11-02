'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Bug, Loader2, Plus, Sparkles, Wand2, Wrench } from 'lucide-react';
import { toast } from 'sonner';

import { changelogSchema, type ChangelogInput } from '@/lib/validations';
import { createChangelogAction, generateChangelogDraftAction } from '@/lib/actions/changelogs';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface ChangelogDialogProps {
  buttonLabel?: string;
}

const RELEASE_TYPES = [
  { id: 'new', label: 'Feature', icon: Sparkles },
  { id: 'improved', label: 'Improvement', icon: Wrench },
  { id: 'fixed', label: 'Bug Fix', icon: Bug },
] as const;

export function ChangelogDialog({
  buttonLabel = 'Publish Release',
}: ChangelogDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isGenerating, setIsGenerating] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ChangelogInput>({
    resolver: zodResolver(changelogSchema),
    defaultValues: {
      version: 'v1.0.0',
      tag: 'new',
      title: '',
      content: '',
    },
  });

  const selectedTag = watch('tag');

  const handleAutoGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await generateChangelogDraftAction();
      if (res.success && res.data) {
        setValue('version', res.data.version);
        setValue('title', res.data.title);
        setValue('content', res.data.content);
        setValue('tag', res.data.tag);
        toast.success(`Draft generated from ${res.data.shippedCount} shipped items!`);
      } else {
        toast.error(res.error || 'Failed to auto-generate draft');
      }
    } catch {
      toast.error('Unexpected error generating release notes');
    } finally {
      setIsGenerating(false);
    }
  };

  const onSubmit = async (values: ChangelogInput) => {
    setIsSubmitting(true);
    const res = await createChangelogAction(values);
    setIsSubmitting(false);

    if (res.success) {
      toast.success(`Release ${values.version} published!`);
      setOpen(false);
      reset();
    } else {
      toast.error(res.error || 'Failed to publish release');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-1.5 cursor-pointer shadow-xs rounded-md font-mono text-xs">
          <Plus className="h-3.5 w-3.5" />
          {buttonLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-xl bg-card border-border p-5 font-mono">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] font-mono">
              <Sparkles className="h-3.5 w-3.5" />
              <span>// release note</span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAutoGenerate}
              disabled={isGenerating || isSubmitting}
              className="h-7 text-[10px] gap-1 px-2 font-mono border-dashed hover:border-foreground"
              title="Automatically scan shipped features and draft changelog"
            >
              {isGenerating ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Wand2 className="h-3 w-3 text-primary" />
              )}
              <span>Auto-Draft Shipped</span>
            </Button>
          </div>
          <DialogTitle className="text-base font-mono font-bold tracking-tight">
            Publish New Changelog
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground font-sans">
            Notify users about feature updates and bug fixes.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 pt-1">
          <div className="space-y-1.5">
            <Label className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">Type</Label>
            <div className="grid grid-cols-3 gap-1.5">
              {RELEASE_TYPES.map((type) => {
                const isSelected = selectedTag === type.id;
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setValue('tag', type.id as any)}
                    className={cn(
                      'flex items-center justify-center gap-1.5 p-2 rounded-md border text-center transition-all cursor-pointer text-xs font-mono',
                      isSelected
                        ? 'border-foreground bg-muted text-foreground font-semibold shadow-xs'
                        : 'border-border bg-background hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <Icon className="h-3 w-3 shrink-0" />
                    <span>{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <Label htmlFor="version" className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                Version
              </Label>
              <Input
                id="version"
                placeholder="v1.0.0"
                disabled={isSubmitting}
                {...register('version')}
                className="h-8 text-xs font-mono rounded-md bg-background border-border"
              />
              {errors.version && (
                <p className="text-[10px] text-destructive font-mono">{errors.version.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="title" className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                Title
              </Label>
              <Input
                id="title"
                placeholder="Title..."
                disabled={isSubmitting}
                {...register('title')}
                className="h-8 text-xs rounded-md bg-background border-border font-mono"
              />
              {errors.title && (
                <p className="text-[10px] text-destructive font-mono">{errors.title.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="content" className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
              Notes
            </Label>
            <Textarea
              id="content"
              placeholder="Release description..."
              rows={4}
              disabled={isSubmitting}
              {...register('content')}
              className="text-xs rounded-md bg-background border-border resize-none font-mono"
            />
            {errors.content && (
              <p className="text-[10px] text-destructive font-mono">{errors.content.message}</p>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
              className="rounded-md font-mono"
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting} className="gap-1.5 rounded-md font-mono">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Publishing...
                </>
              ) : (
                'Publish'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
