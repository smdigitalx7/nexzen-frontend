import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  GraduationCap,
  Eye,
  EyeOff,
  Phone,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useLogin } from "@/lib/hooks/general/useAuth";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");

  const loginMutation = useLogin();
  const { toast } = useToast();

  // Load remembered email on component mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const result = await loginMutation.mutateAsync({
        identifier: email,
        password,
      });

      // Handle remember me functionality
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      // Redirect to appropriate page based on user role
      setLocation(result.redirectPath);
    } catch (err: any) {
      const message = err?.message || "Login failed";
      setError(message);
    }
  };

  const handleForgotPassword = () => {
    toast({
      title: "Forgot Password",
      description:
        "Please contact support at contact@smdigitalx.com or call +91 8184919998",
    });
  };

  const handlePhoneClick = () => {
    window.open("tel:+918184919998", "_self");
  };

  const handleEmailClick = () => {
    window.open("mailto:contact@smdigitalx.com", "_self");
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        backgroundImage: `url('/assets/loginbg.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Black opacity overlay */}
      <div className="absolute inset-0 bg-black/70"></div>

      {/* Logos positioned outside the card */}
      {/* <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-20">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="bg-white rounded-xl p-3 shadow-lg"
        >
          <img
            src="/assets/nexzen-logo.png"
            alt="Nexzen Logo"
            className="h-36 w-auto object-contain"
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="bg-white rounded-xl p-3 shadow-lg"
        >
          <img
            src="/assets/Velocity-logo.png"
            alt="Velocity Logo"
            className="h-36 w-auto object-contain"
          />
        </motion.div>
      </div> */}

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm dark:bg-gray-900/80 overflow-hidden">
          <CardHeader className="space-y-2 text-center pb-6">
            {/* Logos inside card */}
            <div className="flex justify-center items-center gap-4 ">
              <img
                src="/assets/nexzen-logo.png"
                alt="Nexzen Logo"
                className="h-28 w-auto object-contain opacity-100"
              />
              <div className="h-8 w-px bg-gray-400/80"></div>
              <img
                src="/assets/Velocity-logo.png"
                alt="Velocity Logo"
                className="h-28 w-auto object-contain opacity-100"
              />
            </div>

            <div className="space-y-1 mt-2">
              <div className="flex justify-center ">
                <img
                  src="/assets/Velonex-headname1.png"
                  alt="Velonex"
                  className="h-10 w-auto object-contain"
                />
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Educational Institute ERP System
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <Input
                  id="email"
                  type="email"
                  label="Email Address"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftIcon={<Mail className="h-4 w-4" />}
                  data-testid="input-email"
                  required
                  className="h-12 text-base bg-blue-500/5 dark:bg-black/10 border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-0 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <Input
                  id="password"
                  type="password"
                  label="Password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftIcon={<Lock className="h-4 w-4" />}
                  showPasswordToggle={true}
                  data-testid="input-password"
                  required
                  className="h-12 text-base bg-blue-500/5 dark:bg-black/10 border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-0 focus:outline-none"
                />
              </div>

              {/* Remember Me and Forgot Password */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="remember-me"
                    checked={rememberMe}
                    onCheckedChange={(checked) =>
                      setRememberMe(checked as boolean)
                    }
                    className="border-2 border-gray-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <Label
                    htmlFor="remember-me"
                    className="text-sm font-medium cursor-pointer text-gray-700 dark:text-gray-300"
                  >
                    Remember me
                  </Label>
                </div>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-primary hover:text-primary/80 font-medium transition-colors duration-200 hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    {error}
                  </div>
                </motion.div>
              )}

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl "
                disabled={loginMutation.isPending}
                data-testid="button-login"
              >
                {loginMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Signing in...
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-6 text-sm text-white/90 relative z-10"
        >
          {/* <p className="mb-2 text-sm font-medium">
            Empowering Education Through Technology
          </p> */}
          <p className="text-xs text-white/70">
            © 2025 Velonex - Powered by{" "}
            <a
              href="https://www.smdigitalx.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white/90 transition-colors duration-200 underline-none"
            >
              SMDigitalX
            </a>
          </p>
        </motion.div>
      </motion.div>

      {/* Contact Info - Outside Card, Bottom Right */}
      <div className="absolute bottom-4 right-4 flex flex-col  z-20 bg-white/10 hover:bg-white/10 backdrop-blur-sm p-2 rounded-lg">
        <p className="text-xs text-gray-400 text-right mb-1 font-medium">
          Need assistance? Contact our support team
        </p>
        <div className="flex flex-row gap-1 justify-end items-center">
          <button
            onClick={handlePhoneClick}
            className="flex items-center gap-1 rounded text-xs justify-end"
          >
            <Phone className="h-3 w-3 text-gray-400" />
            <span className="font-medium text-gray-400">8184919998</span>
          </button>
          <button
            onClick={handleEmailClick}
            className="flex items-center gap-1 rounded text-xs justify-end"
          >
            <Mail className="h-3 w-3 text-gray-400" />
            <span className="font-medium text-gray-400">
              contact@smdigitalx.com
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
