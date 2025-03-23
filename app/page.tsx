import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  LightbulbIcon,
  PenIcon,
  ActivityIcon,
  ArrowRightIcon,
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header/Navigation */}
      <header className="py-4 border-b border-gray-200">
        <div className="container mx-auto max-w-7xl flex justify-between items-center px-4">
          <h1 className="font-bold text-xl text-[#4A90E2]">WriteSharp</h1>
          <div className="flex gap-4">
            <Link href="/auth/login">
              <Button variant="outline" className="hover:text-[#4A90E2]">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button className="bg-[#2ECC71] hover:bg-[#27AE60] text-white">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold text-[#333333]">
                Bridge Your Ideas to Polished Writing
              </h1>
              <p className="text-lg text-[#666666]">
                WriteSharp helps aspiring writers organize thoughts, express
                ideas clearly, and master grammar and word choice—all in one
                supportive environment.
              </p>
              <Link href="/auth/signup">
                <Button className="bg-[#2ECC71] hover:bg-[#27AE60] text-white font-medium px-8 py-6 rounded-md">
                  Start Writing Free
                </Button>
              </Link>
            </div>
            <div className="flex-1 flex justify-center">
              <div className="bg-gray-200 w-full max-w-[640px] aspect-video flex items-center justify-center rounded-md shadow-md">
                <p className="text-gray-600">Editor + Radar Mockup</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-[#F5F6F5] px-4">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-2xl md:text-3xl font-bold text-[#4A90E2] text-center mb-12">
            Why WriteSharp?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 p-3 bg-blue-100 rounded-full">
                  <LightbulbIcon className="h-8 w-8 text-[#4A90E2]" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Idea Generation</h3>
                <p className="text-[#666666]">
                  Develop and structure your original ideas with confidence.
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 p-3 bg-blue-100 rounded-full">
                  <PenIcon className="h-8 w-8 text-[#4A90E2]" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Clear Expression</h3>
                <p className="text-[#666666]">
                  Write with clarity, logic, and purpose in your own voice.
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 p-3 bg-blue-100 rounded-full">
                  <ActivityIcon className="h-8 w-8 text-[#4A90E2]" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Skill Improvement
                </h3>
                <p className="text-[#666666]">
                  Identify weaknesses and track your growth as a writer.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-2xl md:text-3xl font-bold text-[#4A90E2] text-center mb-12">
            Your Writing Journey
          </h2>

          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="bg-gray-200 w-[200px] h-[100px] flex items-center justify-center rounded-md mb-4">
                <p className="text-gray-600">Idea Organizer screenshot</p>
              </div>
              <h3 className="text-lg font-semibold">1. Brainstorm</h3>
              <p className="text-sm text-[#666666]">
                Generate and organize your thoughts logically
              </p>
            </div>

            <ArrowRightIcon className="hidden md:block h-8 w-8 text-[#4A90E2]" />

            <div className="flex flex-col items-center text-center">
              <div className="bg-gray-200 w-[200px] h-[100px] flex items-center justify-center rounded-md mb-4">
                <p className="text-gray-600">Practice Room screenshot</p>
              </div>
              <h3 className="text-lg font-semibold">2. Express</h3>
              <p className="text-sm text-[#666666]">
                Transform ideas into clear, coherent writing
              </p>
            </div>

            <ArrowRightIcon className="hidden md:block h-8 w-8 text-[#4A90E2]" />

            <div className="flex flex-col items-center text-center">
              <div className="bg-gray-200 w-[200px] h-[100px] flex items-center justify-center rounded-md mb-4">
                <p className="text-gray-600">Skill Evaluator radar</p>
              </div>
              <h3 className="text-lg font-semibold">3. Improve</h3>
              <p className="text-sm text-[#666666]">
                Track progress and overcome writing weaknesses
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Proof Point Section */}
      <section className="py-16 bg-[#F5F6F5] px-4">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-2xl md:text-3xl font-bold text-[#4A90E2] text-center mb-8">
            Build Your Writing Habit
          </h2>

          <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center gap-8 bg-white p-8 rounded-lg shadow-md">
            <div className="flex-1">
              <blockquote className="text-lg italic mb-4">
                &ldquo;WriteSharp helped me organize my thoughts and express
                them clearly. My writing improved dramatically in just
                weeks.&rdquo;
              </blockquote>
              <p className="text-right font-medium">—Alex, Student</p>
            </div>

            <div className="flex-1 flex justify-center">
              <div className="bg-gray-100 w-[200px] h-[200px] rounded-full flex items-center justify-center">
                <p className="text-[#2ECC71] font-semibold">Logic 5 → 9</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Target Audience Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-2xl md:text-3xl font-bold text-[#4A90E2] text-center mb-12">
            Who WriteSharp Is For
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4 text-[#4A90E2]">
                Young Writers
              </h3>
              <p className="text-[#666666]">
                Students and hobbyists looking to improve the clarity,
                structure, and correctness of their writing in a supportive
                environment.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4 text-[#4A90E2]">
                Writing Beginners
              </h3>
              <p className="text-[#666666]">
                Those who struggle with organizing ideas or grammar, with room
                to grow as your skills develop over time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <section className="py-16 bg-white border-t border-gray-200 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col items-center text-center space-y-8">
            <h2 className="text-xl text-[#333333]">
              Ready to Improve Your Writing? Join Free Today.
            </h2>

            <Link href="/auth/signup">
              <Button className="bg-[#2ECC71] hover:bg-[#27AE60] text-white font-medium px-8 py-6 rounded-md">
                Start Your Writing Journey
              </Button>
            </Link>

            <div className="flex gap-6 pt-6">
              <Link href="#" className="text-[#4A90E2] hover:underline">
                About
              </Link>
              <Link href="#" className="text-[#4A90E2] hover:underline">
                Contact
              </Link>
              <Link
                href="/auth/login"
                className="text-[#4A90E2] hover:underline"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
