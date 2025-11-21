import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useLocation, useRoute } from 'wouter';
import { Elements, CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, CreditCard, Lock, Wallet } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? 'pk_test_placeholder_12345');

type StripePaymentFormProps = {
  course: any;
  isProcessing: boolean;
  setIsProcessing: (value: boolean) => void;
  onSuccess: () => Promise<void> | void;
  toast: ReturnType<typeof useToast>['toast'];
  userName?: string | null;
};

function StripePaymentForm({ course, isProcessing, setIsProcessing, onSuccess, toast, userName }: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();

  const handleStripePayment = async (event: FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) {
      toast({
        title: 'Stripe unavailable',
        description: 'Stripe failed to initialize. Please refresh and try again.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    try {
      const response = await apiRequest('POST', '/api/create-payment-intent', {
        courseId: course.id,
        provider: 'stripe',
      });
      const data = await response.json();

      if (data.testMode) {
        await apiRequest('POST', '/api/payment-success', {
          courseId: course.id,
          provider: 'stripe',
          paymentIntentId: data.paymentIntentId,
        });
        toast({
          title: 'Test payment confirmed',
          description: 'Enrollment completed using placeholder Stripe keys.',
        });
        await onSuccess();
        return;
      }

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card details are missing.');
      }

      const confirmation = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: userName || 'Biblical Financial Courses learner',
          },
        },
      });

      if (confirmation.error) {
        throw confirmation.error;
      }

      await apiRequest('POST', '/api/payment-success', {
        courseId: course.id,
        provider: 'stripe',
        paymentIntentId: confirmation.paymentIntent?.id ?? data.paymentIntentId,
      });

      toast({
        title: 'Payment complete',
        description: 'You now have access to this course.',
      });
      await onSuccess();
    } catch (error: any) {
      console.error('Stripe payment error:', error);
      toast({
        title: 'Payment Error',
        description: error?.message ?? 'Unable to process Stripe payment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleStripePayment} className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#0f172a',
                '::placeholder': {
                  color: '#94a3b8',
                },
              },
              invalid: {
                color: '#ef4444',
              },
            },
          }}
        />
      </div>
      <Button type="submit" disabled={isProcessing || !stripe || !elements} className="w-full bg-black text-white hover:bg-gray-800 min-h-[44px] rounded-full">
        {isProcessing ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Lock className="h-4 w-4 mr-2" />
            Pay with card (Stripe)
          </>
        )}
      </Button>
    </form>
  );
}

export default function Checkout() {
  const [, params] = useRoute('/checkout/:courseId');
  const [, navigate] = useLocation();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'stripe' | 'paypal'>('stripe');
  const [paypalOrderId, setPaypalOrderId] = useState<string | null>(null);
  const [awaitingPaypalCapture, setAwaitingPaypalCapture] = useState(false);

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

  const handleEnrollmentSuccess = async () => {
    await queryClient.invalidateQueries({ queryKey: ['/api/enrollments'] });
    navigate(`/courses/${course?.id}`);
  };

  const handlePaypalStart = async () => {
    if (!course) return;
    setIsProcessing(true);
    setAwaitingPaypalCapture(false);
    try {
      const response = await apiRequest('POST', '/api/create-payment-intent', {
        courseId: course.id,
        provider: 'paypal',
      });
      const data = await response.json();
      setPaypalOrderId(data.orderId);

      if (data.testMode) {
        await apiRequest('POST', '/api/payment-success', {
          courseId: course.id,
          provider: 'paypal',
          paypalOrderId: data.orderId,
        });
        toast({
          title: 'PayPal test confirmed',
          description: 'Enrollment completed using placeholder PayPal credentials.',
        });
        await handleEnrollmentSuccess();
        return;
      }

      if (data.approvalUrl) {
        window.open(data.approvalUrl, '_blank', 'noopener');
      }

      toast({
        title: 'Complete PayPal approval',
        description: 'Finish the PayPal checkout window, then click confirm below.',
      });
      setAwaitingPaypalCapture(true);
    } catch (error: any) {
      console.error('PayPal order error:', error);
      toast({
        title: 'PayPal Error',
        description: error?.message ?? 'Unable to start PayPal checkout. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaypalConfirm = async () => {
    if (!course || !paypalOrderId) return;
    setIsProcessing(true);
    try {
      await apiRequest('POST', '/api/payment-success', {
        courseId: course.id,
        provider: 'paypal',
        paypalOrderId,
      });
      toast({
        title: 'Payment complete',
        description: 'Your PayPal payment has been captured.',
      });
      await handleEnrollmentSuccess();
    } catch (error: any) {
      console.error('PayPal capture error:', error);
      toast({
        title: 'PayPal Error',
        description: error?.message ?? 'Unable to capture your PayPal order. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
      setAwaitingPaypalCapture(false);
    }
  };

  const paymentOptions = useMemo(
    () => [
      {
        id: 'stripe',
        title: 'Card (Stripe)',
        description: 'Visa, Mastercard, Amex',
        icon: CreditCard,
      },
      {
        id: 'paypal',
        title: 'PayPal',
        description: 'Checkout with your PayPal account',
        icon: Wallet,
      },
    ],
    [],
  );

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
      <div className="max-w-2xl mx-auto px-4 space-y-6">
        <Button variant="ghost" onClick={() => navigate('/courses')} className="mb-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Courses
        </Button>

        <div className="grid gap-6">
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Complete your enrollment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                <div>
                  <h3 className="font-semibold text-lg text-slate-900 dark:text-white">{course.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{course.description}</p>
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                    <span>{course.lessonCount} lessons</span>
                    <span>{course.duration} minutes</span>
                    <span className="capitalize">{course.level}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-semibold text-slate-900 dark:text-white">${course.price}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">One-time payment</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-sm font-semibold text-slate-500 uppercase tracking-[0.3em]">Payment method</div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {paymentOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setSelectedMethod(option.id as 'stripe' | 'paypal')}
                      className={`rounded-2xl border px-4 py-3 text-left transition ${
                        selectedMethod === option.id
                          ? 'border-blue-500 bg-blue-50 dark:border-blue-400/70 dark:bg-blue-500/10'
                          : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                        <option.icon className="h-4 w-4" />
                        <span className="font-semibold">{option.title}</span>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{option.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 dark:border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-semibold text-slate-900 dark:text-white">Total</span>
                  <span className="text-2xl font-bold text-slate-900 dark:text-white">${course.price}</span>
                </div>

                {selectedMethod === 'stripe' ? (
                  <Elements stripe={stripePromise} key={course.id}>
                    <StripePaymentForm
                      course={course}
                      isProcessing={isProcessing}
                      setIsProcessing={setIsProcessing}
                      onSuccess={handleEnrollmentSuccess}
                      toast={toast}
                      userName={user ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.email : null}
                    />
                  </Elements>
                ) : (
                  <div className="space-y-3">
                    <Button
                      onClick={handlePaypalStart}
                      disabled={isProcessing}
                      className="w-full min-h-[44px] rounded-full bg-[#ffc439] text-slate-900 hover:bg-[#f0b627]"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Opening PayPal...
                        </>
                      ) : (
                        <>
                          <Wallet className="h-4 w-4 mr-2" />
                          Continue with PayPal
                        </>
                      )}
                    </Button>
                    {awaitingPaypalCapture && (
                      <Button
                        variant="outline"
                        onClick={handlePaypalConfirm}
                        disabled={isProcessing}
                        className="w-full rounded-full border-slate-300 dark:border-slate-600"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Capturing order...
                          </>
                        ) : (
                          <>
                            <Lock className="h-4 w-4 mr-2" />
                            I approved in PayPal — finalize enrollment
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                )}

                <div className="mt-4 text-center text-xs text-gray-600 dark:text-gray-400 flex flex-col gap-1">
                  <span className="inline-flex items-center justify-center gap-1">
                    <Lock className="h-3 w-3" /> Secure payments powered by Stripe & PayPal
                  </span>
                  <span>
                    Test mode is enabled until you replace the placeholder API keys in <Badge variant="secondary">.env</Badge>
                  </span>
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