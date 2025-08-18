"use client";

import { useTheme } from "@/components/theme/ThemeProvider";
import Image from "next/image";

const Footer = () => {
  const { theme } = useTheme();

  return (
    <footer className="w-full py-8 mt-auto bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-24 h-24 relative">
              <Image
                src={theme === "dark" ? "/hhs-white.avif" : "/hhs-black.avif"}
                alt="Logo"
                fill
                className="object-contain"
              />
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              Happy Hacking Space
            </h2>
          </div>

          <p
            className={`text-sm text-center text-muted-foreground ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            © {new Date().getFullYear()} Happy Hacking Space . All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
