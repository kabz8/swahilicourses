import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Users, Clock } from "lucide-react";
import { loginLocalUser, registerLocalUser } from "@/lib/localAuth";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phoneNumber: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginData = z.infer<typeof loginSchema>;
type RegisterData = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("login");

  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginData) => {
      try {
        const response = await apiRequest("POST", "/api/login", data);
        return response.json();
      } catch {
        return loginLocalUser(data.email, data.password);
      }
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["auth:user"], user);
      toast({
        title: t("loginSuccess"),
        description: t("welcomeBack"),
      });
      navigate("/dashboard");
    },
    onError: (error: any) => {
      toast({
        title: t("loginFailed"),
        description: error.message || t("invalidCredentials"),
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      try {
        const response = await apiRequest("POST", "/api/register", data);
        return response.json();
      } catch {
        return registerLocalUser(data);
      }
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["auth:user"], user);
      toast({
        title: t("registrationSuccess"),
        description: t("welcomeToHujambo"),
      });
      navigate("/dashboard");
    },
    onError: (error: any) => {
      toast({
        title: t("registrationFailed"),
        description: error.message || t("registrationError"),
        variant: "destructive",
      });
    },
  });

  // Redirect if already logged in
  if (user && !isLoading) {
    navigate("/dashboard");
    return null;
  }

  const onLogin = (data: LoginData) => {
    loginMutation.mutate(data);
  };

  const onRegister = (data: RegisterData) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 items-center min-h-screen">
          {/* Left side - Hero section */}
          <div className="hidden lg:block">
            <div className="text-center space-y-6">
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
                {t("welcomeToHujambo")}
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-md mx-auto">
                {t("authPageDescription")}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {t("interactiveLessons")}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t("interactiveLessonsDesc")}
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {t("faithBased")}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t("faithBasedDesc")}
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {t("progressTracking")}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t("progressTrackingDesc")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Auth forms */}
          <div className="w-full max-w-md mx-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">{t("signIn")}</TabsTrigger>
                <TabsTrigger value="register">{t("signUp")}</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("signInToAccount")}</CardTitle>
                    <CardDescription>
                      {t("signInDescription")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                      <div>
                        <Label htmlFor="email">{t("email")}</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder={t("emailPlaceholder")}
                          {...loginForm.register("email")}
                        />
                        {loginForm.formState.errors.email && (
                          <p className="text-sm text-red-600 mt-1">
                            {loginForm.formState.errors.email.message}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="password">{t("password")}</Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder={t("passwordPlaceholder")}
                          {...loginForm.register("password")}
                        />
                        {loginForm.formState.errors.password && (
                          <p className="text-sm text-red-600 mt-1">
                            {loginForm.formState.errors.password.message}
                          </p>
                        )}
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? t("signingIn") : t("signIn")}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="register">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("createAccount")}</CardTitle>
                    <CardDescription>
                      {t("createAccountDescription")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">{t("firstName")}</Label>
                          <Input
                            id="firstName"
                            placeholder={t("firstNamePlaceholder")}
                            {...registerForm.register("firstName")}
                          />
                          {registerForm.formState.errors.firstName && (
                            <p className="text-sm text-red-600 mt-1">
                              {registerForm.formState.errors.firstName.message}
                            </p>
                          )}
                        </div>
                        
                        <div>
                          <Label htmlFor="lastName">{t("lastName")}</Label>
                          <Input
                            id="lastName"
                            placeholder={t("lastNamePlaceholder")}
                            {...registerForm.register("lastName")}
                          />
                          {registerForm.formState.errors.lastName && (
                            <p className="text-sm text-red-600 mt-1">
                              {registerForm.formState.errors.lastName.message}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="email">{t("email")}</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder={t("emailPlaceholder")}
                          {...registerForm.register("email")}
                        />
                        {registerForm.formState.errors.email && (
                          <p className="text-sm text-red-600 mt-1">
                            {registerForm.formState.errors.email.message}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="phoneNumber">{t("phoneNumber")}</Label>
                        <Input
                          id="phoneNumber"
                          type="tel"
                          placeholder={t("phoneNumberPlaceholder")}
                          {...registerForm.register("phoneNumber")}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="password">{t("password")}</Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder={t("passwordPlaceholder")}
                          {...registerForm.register("password")}
                        />
                        {registerForm.formState.errors.password && (
                          <p className="text-sm text-red-600 mt-1">
                            {registerForm.formState.errors.password.message}
                          </p>
                        )}
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? t("creatingAccount") : t("createAccount")}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}