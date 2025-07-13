import { useState } from 'react';
import { Play, BookOpen, Clock, Users, Award, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export default function Landing() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubscribing(true);
    try {
      await apiRequest('POST', '/api/newsletter', { email });
      toast({
        title: 'Success!',
        description: 'You have been subscribed to our newsletter.',
      });
      setEmail('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to subscribe. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubscribing(false);
    }
  };

  const stats = [
    { value: '10,000+', label: 'Active Learners' },
    { value: '150+', label: 'Courses Available' },
    { value: '50+', label: 'Expert Instructors' },
    { value: '95%', label: 'Success Rate' },
  ];

  const features = [
    {
      icon: Clock,
      title: '5-Minute Lessons',
      description: 'Perfect bite-sized lessons that fit your busy schedule',
    },
    {
      icon: BookOpen,
      title: 'Resume Anywhere',
      description: 'Pick up exactly where you left off across all devices',
    },
    {
      icon: Award,
      title: 'Certificates',
      description: 'Earn certificates as you complete courses and milestones',
    },
    {
      icon: Users,
      title: 'Expert Instructors',
      description: 'Learn from native speakers and language experts',
    },
    {
      icon: BarChart3,
      title: 'Progress Tracking',
      description: 'Monitor your improvement with detailed analytics',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                {t('hero.title')}
              </h1>
              <p className="text-xl mb-8 text-blue-100">
                {t('hero.subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg"
                  onClick={() => window.location.href = '/api/login'}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <Play className="h-5 w-5 mr-2" />
                  {t('hero.start')}
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-blue-600"
                >
                  <BookOpen className="h-5 w-5 mr-2" />
                  {t('hero.explore')}
                </Button>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1544717297-fa95b6ee9643?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600"
                alt="Students learning together in East Africa"
                className="rounded-xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">{stat.value}</div>
                <div className="text-gray-600 dark:text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose Kiswahili Mastery?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Everything you need to master Kiswahili
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-white dark:bg-gray-800 shadow-sm">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-blue-600 rounded-2xl p-8 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">{t('newsletter.title')}</h2>
            <p className="text-xl text-blue-100 mb-8">
              Get the latest lessons, tips, and cultural insights delivered to your inbox
            </p>
            <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto flex gap-4">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-white text-gray-900 placeholder-gray-500"
                required
              />
              <Button 
                type="submit" 
                disabled={isSubscribing}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {isSubscribing ? 'Subscribing...' : t('newsletter.subscribe')}
              </Button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
