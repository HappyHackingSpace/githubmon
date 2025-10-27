"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Github, Shield, BarChart3 } from "lucide-react";

export function CallToActionSection() {
  const router = useRouter();

  return (
    <section className="text-center py-12">
      <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-xl hover:shadow-2xl transition-all duration-300 max-w-4xl mx-auto">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                <BarChart3 className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>

            <div className="flex-1 text-center md:text-left">
              <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                Unlock Advanced Analytics
              </h3>
              <p className="text-base mb-4 text-gray-600 dark:text-gray-300">
                Sign in with your GitHub account to access comprehensive
                organization insights
              </p>

              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm mb-4">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                  <Shield className="w-4 h-4" />
                  <span>Secure</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                  <BarChart3 className="w-4 h-4" />
                  <span>Analytics</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                  <Github className="w-4 h-4" />
                  <span>Integration</span>
                </div>
              </div>
            </div>

            <div className="flex-shrink-0">
              <button
                onClick={() => router.push("/login")}
                className="bg-indigo-600 text-white dark:bg-indigo-500 dark:text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Github className="w-5 h-5" />
                Sign In
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
