"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Eye, EyeOff, Mail, Lock, User, Home } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useAuth } from "@/hooks/useAuth";

const loginSchema = z.object({
  fullName: z.string(),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({});

  const onSubmit = async (data: LoginFormData) => {
    try {
      setLoading(true);
      const user = await signIn(data.fullName, data.password);

      console.log("Usuario logueado:", user);

      router.push("/dashboard");
    } catch (error: any) {
      setError("root", { message: error.message });
    } finally {
      setLoading(false);
    }
  };

  // const handleGoogleSignIn = async () => {
  //   try {
  //     setLoading(true);
  //     await signInWithGoogle();
  //     router.push("/dashboard");
  //   } catch (error: any) {
  //     setError("root", { message: error.message });
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <div className="h-auto flex items-center justify-center rounded-lg bg-white/95 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-md w-full space-y-8">
        <div>
         <div className="mx-auto flex items-center justify-center h-12 w-1/2 bg-orange-500 rounded-lg px-2">
            <h1 className="text-white text-xl font-bold flex items-center gap-1">
              H O G
              <Home className="text-white" size={21} />R
            </h1>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-gray-100">
            Iniciar Sesión
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Accede a tu cuenta de HogarApp
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Usuario
              </label>
              <div className="mt-1 relative">
                <input
                  {...register("fullName")}
                  type="text"
                  className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm transition-colors"
                  placeholder="Tu usuario..."
                />
                <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
              </div>
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Contraseña
              </label>
              <div className="mt-1 relative">
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  className="appearance-none relative block w-full px-3 py-2 pl-10 pr-10 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm transition-colors"
                  placeholder="Tu contraseña"
                />
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>

          {errors.root && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.root.message}
              </p>
            </div>
          )}

          <div className="space-y-4">
            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting || loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                "Iniciar Sesión"
              )}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
