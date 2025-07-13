import { useEffect, useState } from 'react';
import { useLocation, useRoute } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, CreditCard, Lock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export default function Checkout() {
  const [, params] = useRoute('/checkout/:courseId');
  const [, navigate] = useLocation();
  const { isAuthenticated, user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const courseId = params?.courseId ? parseInt(params.courseId) : null;

  const { data: course, isLoading: isCourseLoading } = useQuery({
    queryKey: [`/api/courses/${courseId}`],
    enabled: !!courseId,
    retry: false,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/register');
    }
  }, [isAuthenticated, navigate]);

  const handlePayment = async () => {
    if (!course || !user) return;

    setIsProcessing(true);
    
    try {
      // For now, show a message that Stripe keys are needed
      toast({
        title: 'Payment System Not Configured',
        description: 'Stripe payment integration will be available once API keys are configured.',
        variant: 'destructive',
      });
      
      // In a real implementation, this would create a payment intent
      // and redirect to Stripe checkout
      /*
      const response = await apiRequest('POST', '/api/create-payment-intent', {
        courseId: course.id,
        amount: course.price * 100, // Convert to cents
      });
      
      const { clientSecret } = await response.json();
      // Redirect to Stripe checkout or handle payment
      */
      
    } catch (error) {
      toast({
        title: 'Payment Error',
        description: 'Unable to process payment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isCourseLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Course not found</h2>
          <Button onClick={() => navigate('/courses')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Courses
          </Button>
        </div>
      </div>
    );
  }

  if (course.isFree) {
    navigate(`/courses/${course.id}`);
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/courses')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Courses
        </Button>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Course Purchase
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-lg">{course.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {course.description}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span>{course.lessonCount} lessons</span>
                      <span>{course.duration} minutes</span>
                      <span className="capitalize">{course.level}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">${course.price}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      One-time payment
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-semibold">Total:</span>
                    <span className="text-2xl font-bold">${course.price}</span>
                  </div>
                  
                  <Button
                    onClick={handlePayment}
                    disabled={isProcessing}
                    className="w-full bg-black text-white hover:bg-gray-800 min-h-[44px]"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4 mr-2" />
                        Complete Purchase
                      </>
                    )}
                  </Button>
                  
                  <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
                    <Lock className="h-4 w-4 inline mr-1" />
                    Secure payment powered by Stripe
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">What's included</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Lifetime access to course content
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  {course.lessonCount} video lessons
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Progress tracking and resumable lessons
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Mobile-friendly learning experience
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}