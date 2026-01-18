// app/settings/page.tsx
'use client';

import { useEffect, useState } from 'react'; // Import useState
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

const formSchema = z.object({
  bio: z.string().max(500, "Bio cannot exceed 500 characters.").optional(),
  systemInstruction: z.string().max(1000, "Instructions cannot exceed 1000 characters.").optional(),
});

export default function SettingsPage() {
  const { status } = useSession();
  const router = useRouter();
  // --- FIX: Introduce a dedicated loading state for the form data ---
  const [isFormLoading, setIsFormLoading] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bio: '',
      systemInstruction: '',
    },
  });

  const { formState: { isSubmitting, isDirty } } = form;

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    if (status === 'authenticated') {
      // Start loading form data
      setIsFormLoading(true);
      fetch('/api/user/profile')
        .then((res) => res.json())
        .then((data) => {
          form.reset({
            bio: data.bio || '',
            systemInstruction: data.systemInstruction || '',
          });
        })
        .finally(() => {
          // Finish loading once data is fetched and form is reset
          setIsFormLoading(false);
        });
    }
  }, [status, router, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const response = await fetch('/api/user/update', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });

    if (response.ok) {
      toast.success('Profile updated successfully!');
      form.reset(values);
    } else {
      toast.error('Failed to update profile.');
    }
  }

  // --- FIX: Update the rendering condition ---
  if (status === 'loading' || isFormLoading) {
    return (
       <div className="p-10">
            <Skeleton className="h-8 w-1/4 mb-2" />
            <Skeleton className="h-4 w-1/2 mb-8" />
            <Skeleton className="h-24 w-full mb-8" />
            <Skeleton className="h-32 w-full mb-8" />
            <Skeleton className="h-10 w-24" />
       </div>
    );
  }

  return (
    <div className="p-4 md:p-10">
      <Card>
        <CardHeader>
          <CardTitle>User Settings</CardTitle>
          <CardDescription>Update your profile and AI agent instructions.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Bio</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Tell us about your background and expertise..." {...field} />
                    </FormControl>
                    <FormDescription>This helps the AI understand your perspective.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="systemInstruction"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custom AI Instructions</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., 'Always provide answers in the style of a skeptical investor.' or 'Focus on the long-term implications.'" {...field} />
                    </FormControl>
                    <FormDescription>Provide custom instructions to tailor the agents personality and response style. Leave blank for default behavior.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isSubmitting || !isDirty}>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}