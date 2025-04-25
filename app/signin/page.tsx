import SignInForm from "@/components/sign-in-form";
import ScrollingCards from "@/components/scrolling-cards";
import ThemeToggle from "@/components/theme-toggle";

import { Navbar } from "@/components/navbar";

export default function SignInPage() {
  return (
    <>
      <Navbar />
      <div className="flex min-h-screen">
        <div className="hidden lg:block w-1/2 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-green-700" />
          <div className="absolute top-4 left-4 z-10">
            <ThemeToggle />
          </div>
          <ScrollingCards />
        </div>

        <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col">
          <SignInForm />
        </div>
      </div>
    </>
  );
}
