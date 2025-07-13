import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useLocation } from 'wouter';
import { insertUserSchema } from '@shared/schema';

const registerSchema = insertUserSchema.extend({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type RegisterData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      const response = await apiRequest('POST', '/api/register', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t('registrationSuccess'),
        description: t('welcomeToHujambo'),
      });
      navigate('/');
    },
    onError: (error: Error) => {
      toast({
        title: t('registrationFailed'),
        description: error.message || t('registrationError'),
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: RegisterData) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="bg-white dark:bg-gray-800 shadow-xl">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center text-gray-900 dark:text-white">
                {t('createAccount')}
              </CardTitle>
              <CardDescription className="text-center text-gray-600 dark:text-gray-400">
                {t('createAccountDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-gray-700 dark:text-gray-300">
                      {t('firstName')}
                    </Label>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder={t('firstNamePlaceholder')}
                      {...register('firstName')}
                      className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                    />
                    {errors.firstName && (
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {errors.firstName.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-gray-700 dark:text-gray-300">
                      {t('lastName')}
                    </Label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder={t('lastNamePlaceholder')}
                      {...register('lastName')}
                      className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                    />
                    {errors.lastName && (
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">
                    {t('email')}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t('emailPlaceholder')}
                    {...register('email')}
                    className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber" className="text-gray-700 dark:text-gray-300">
                    {t('phoneNumber')}
                  </Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder={t('phoneNumberPlaceholder')}
                    {...register('phoneNumber')}
                    className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                  />
                  {errors.phoneNumber && (
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {errors.phoneNumber.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">
                    {t('password')}
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder={t('passwordPlaceholder')}
                    {...register('password')}
                    className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                  />
                  {errors.password && (
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-black hover:bg-gray-800 text-white"
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? t('creatingAccount') : t('createAccount')}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Already have an account?{' '}
                  <button
                    onClick={() => navigate('/login')}
                    className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                  >
                    {t('signIn')}
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
    </div>
  );
}