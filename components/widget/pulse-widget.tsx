'use client';

import * as React from 'react';
import {
  Bug,
  Check,
  Code,
  Copy,
  Loader2,
  MessageSquare,
  MessageSquarePlus,
  Puzzle,
  Send,
  Sparkles,
  Wrench,
  X,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';

import type { PostCategory } from '@/types/database';
import { createPostAction } from '@/lib/actions/posts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

const CATEGORIES: { id: PostCategory; label: string; icon: React.ElementType }[] = [
  { id: 'feature', label: 'Feature', icon: Sparkles },
  { id: 'bug', label: 'Bug', icon: Bug },
  { id: 'improvement', label: 'Improvement', icon: Wrench },
  { id: 'integration', label: 'Integration', icon: Puzzle },
];

export function PulseWidget() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'submit' | 'embed'>('submit');

  // Form states
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [category, setCategory] = React.useState<PostCategory>('feature');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [copiedSnippet, setCopiedSnippet] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error('Please enter a title and description');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createPostAction({
        title: title.trim(),
        description: description.trim(),
        category,
        status: 'under_review',
      });

      if (res.success) {
        toast.success('Thank you! Your feedback has been received.');
        setTitle('');
        setDescription('');
        setIsOpen(false);
      } else {
        toast.error(res.error || 'Failed to submit feedback');
      }
    } catch {
      toast.error('Unexpected error submitting feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  const embedCodeSnippet = `<!-- tctPulse In-App Feedback Widget -->
<script
  src="https://cdn.tctpulse.dev/widget.js"
  data-workspace-id="tctpulse-default"
  async
></script>`;

  const handleCopySnippet = () => {
    navigator.clipboard.writeText(embedCodeSnippet);
    setCopiedSnippet(true);
    toast.success('Widget snippet copied to clipboard!');
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 font-mono">
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2 rounded-full border border-border bg-foreground px-4 py-2.5 text-xs font-semibold text-background shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-95 cursor-pointer"
        >
          <Zap className="h-4 w-4 fill-current group-hover:rotate-12 transition-transform" />
          <span>Feedback</span>
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        </button>
      )}

      {/* Floating Widget Modal Card */}
      {isOpen && (
        <div className="w-[360px] sm:w-[400px] rounded-2xl border border-border bg-card shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-foreground text-background">
                <Zap className="h-3.5 w-3.5 fill-current" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-foreground">tctPulse Widget</h3>
                <p className="text-[10px] text-muted-foreground font-sans">
                  In-app customer voice portal
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex border-b border-border bg-muted/10 text-xs">
            <button
              onClick={() => setActiveTab('submit')}
              className={cn(
                'flex-1 py-2 text-center font-medium transition-colors border-b-2 cursor-pointer flex items-center justify-center gap-1.5',
                activeTab === 'submit'
                  ? 'border-foreground text-foreground font-bold bg-card'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              <MessageSquarePlus className="h-3 w-3" />
              <span>Submit Idea</span>
            </button>
            <button
              onClick={() => setActiveTab('embed')}
              className={cn(
                'flex-1 py-2 text-center font-medium transition-colors border-b-2 cursor-pointer flex items-center justify-center gap-1.5',
                activeTab === 'embed'
                  ? 'border-foreground text-foreground font-bold bg-card'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              <Code className="h-3 w-3" />
              <span>Embed SDK</span>
            </button>
          </div>

          {/* Content Body */}
          <div className="p-4">
            {activeTab === 'submit' ? (
              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Category Pills */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Type
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {CATEGORIES.map((cat) => {
                      const Icon = cat.icon;
                      const isSelected = category === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setCategory(cat.id)}
                          className={cn(
                            'flex items-center gap-1.5 px-2 py-1.5 rounded-md border text-[11px] transition-colors cursor-pointer',
                            isSelected
                              ? 'border-foreground bg-foreground text-background font-semibold shadow-xs'
                              : 'border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground'
                          )}
                        >
                          <Icon className="h-3 w-3" />
                          <span className="truncate">{cat.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Title */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Title
                  </label>
                  <Input
                    placeholder="Short summary of your request..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    disabled={isSubmitting}
                    className="h-8 text-xs font-mono rounded-md bg-background border-border"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Details
                  </label>
                  <Textarea
                    placeholder="Describe how this would help your workflow..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    disabled={isSubmitting}
                    rows={3}
                    className="text-xs font-mono rounded-md bg-background border-border resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting || !title.trim() || !description.trim()}
                  className="w-full gap-1.5 rounded-md font-mono text-xs cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      <span>Send Feedback</span>
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground font-sans leading-relaxed">
                  Embed this feedback launcher into any web app, documentation portal, or customer dashboard:
                </p>

                <div className="relative rounded-lg border border-border bg-muted/60 p-3 text-[11px] font-mono overflow-x-auto text-foreground">
                  <pre>{embedCodeSnippet}</pre>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopySnippet}
                  className="w-full gap-1.5 rounded-md font-mono text-xs cursor-pointer"
                >
                  {copiedSnippet ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy Embed Code</span>
                    </>
                  )}
                </Button>

                <p className="text-[10px] text-muted-foreground font-mono text-center">
                  Works with React, Vue, Next.js, Webflow & WordPress
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
