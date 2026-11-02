'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight, Eye, EyeOff, Loader2, Lock, Mail, Sparkles, Zap } from 'lucide-react';
import { toast } from 'sonner';

import { authSchema, type AuthInput } from '@/lib/validations';
import { loginAction, signupAction } from '@/lib/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/dashboard';

  const [activeTab, setActiveTab] = React.useState<'login' | 'signup'>('login');
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<AuthInput>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: AuthInput) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (activeTab === 'login') {
        const result = await loginAction(values);
        if (!result.success) {
          setErrorMessage(result.error || 'Failed to sign in. Verify credentials.');
          toast.error(result.error || 'Invalid credentials');
          return;
        }
        toast.success('Signed in successfully.');
        router.push(redirectTo);
        return;
      } else {
        const result = await signupAction(values);
        if (!result.success) {
          setErrorMessage(result.error || 'Failed to create account.');
          toast.error(result.error || 'Sign up failed');
          return;
        }
        toast.success('Account created.');
        setActiveTab('login');
        reset();
      }
    } catch {
      setErrorMessage('Unexpected error occurred. Please try again.');
      toast.error('Authentication error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-border shadow-xs bg-card rounded-xl overflow-hidden font-mono">
      <Tabs
        value={activeTab}
        onValueChange={(val) => {
          setActiveTab(val as 'login' | 'signup');
          setErrorMessage(null);
        }}
        className="w-full"
      >
        <CardHeader className="p-3 pb-0">
          <TabsList className="grid w-full grid-cols-2 rounded-lg bg-muted/50 p-1">
            <TabsTrigger
              value="login"
              className="rounded-md text-xs font-mono font-medium data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs"
            >
              Sign In
            </TabsTrigger>
            <TabsTrigger
              value="signup"
              className="rounded-md text-xs font-mono font-medium data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs"
            >
              Create Account
            </TabsTrigger>
          </TabsList>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-3.5 p-5 pt-4">
            {errorMessage && (
              <div className="rounded-md bg-destructive/10 border border-destructive/20 p-2.5 text-xs text-destructive font-mono">
                {errorMessage}
              </div>
            )}

            <div className="space-y-1">
              <Label htmlFor="email" className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  autoComplete="email"
                  disabled={isLoading}
                  {...register('email')}
                  className="pl-8 h-8 text-xs rounded-md bg-background border-border font-mono"
                />
              </div>
              {errors.email && (
                <p className="text-[10px] text-destructive font-mono">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                  Password
                </Label>
                {activeTab === 'login' && (
                  <span className="text-[10px] text-muted-foreground font-mono">
                    min. 6 chars
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete={
                    activeTab === 'login' ? 'current-password' : 'new-password'
                  }
                  disabled={isLoading}
                  {...register('password')}
                  className="pl-8 pr-8 h-8 text-xs rounded-md bg-background border-border font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  disabled={isLoading}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer disabled:pointer-events-none"
                >
                  {showPassword ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-[10px] text-destructive font-mono">
                  {errors.password.message}
                </p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-2.5 p-5 pt-0">
            <Button
              type="submit"
              className="w-full h-8 gap-1.5 shadow-xs cursor-pointer rounded-md font-mono text-xs font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : activeTab === 'login' ? (
                <>
                  Authenticate
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              ) : (
                <>
                  Register
                  <Sparkles className="h-3.5 w-3.5" />
                </>
              )}
            </Button>

            <div className="w-full rounded-md border border-border/80 bg-muted/40 p-2.5 text-[11px] font-mono text-muted-foreground space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground flex items-center gap-1.5 text-[10px]">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Test Credentials
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setValue('email', 'admin@tctpulse.dev', { shouldValidate: true });
                    setValue('password', 'password123', { shouldValidate: true });
                    setErrorMessage(null);
                  }}
                  className="text-[10px] text-foreground hover:underline cursor-pointer"
                >
                  Auto-fill
                </button>
              </div>
              <div className="text-[10px] space-y-0.5 font-mono text-muted-foreground">
                <div>Email: <span className="text-foreground">admin@tctpulse.dev</span></div>
                <div>Pass: <span className="text-foreground">password123</span></div>
              </div>
            </div>

            <p className="text-center text-[10px] text-muted-foreground font-mono leading-normal">
              tctPulse // secure workspace access
            </p>
          </CardFooter>
        </form>
      </Tabs>
    </Card>
  );
}

export default function LoginPage() {
  const router = useRouter();

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center p-4 bg-background font-mono overflow-hidden">
      <div className="w-full max-w-sm space-y-5">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-foreground text-background">
            <Zap className="h-5 w-5 fill-current" />
          </div>
          <div>
            <h1 className="text-lg font-mono font-bold tracking-tight text-foreground">
              tctPulse Auth
            </h1>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              product feedback & roadmap management
            </p>
          </div>
        </div>

        <Suspense
          fallback={
            <div className="h-64 w-full animate-pulse rounded-xl border border-border bg-card" />
          }
        >
          <LoginFormContent />
        </Suspense>

        <div className="text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/')}
            className="text-xs text-muted-foreground hover:text-foreground cursor-pointer gap-1.5 rounded-md font-mono h-7"
          >
            <ArrowLeft className="h-3 w-3" />
            public portal
          </Button>
        </div>
      </div>
    </div>
  );
}
