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
      {/* Hero Section */}
      <section className="py-16 md:py-24 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold text-[#333333]">
                Sharpen Your Writing, See Your Edge
              </h1>
              <p className="text-lg text-[#666666]">
                Organize ideas, write better, track your level—all in one spot.
              </p>
              <Button className="bg-[#2ECC71] hover:bg-[#27AE60] text-white font-medium px-8 py-6 rounded-md">
                Start Writing Free
              </Button>
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
                <h3 className="text-xl font-semibold mb-2">Brainstorm Easy</h3>
                <p className="text-[#666666]">Turn messy ideas into a plan.</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 p-3 bg-blue-100 rounded-full">
                  <PenIcon className="h-8 w-8 text-[#4A90E2]" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Write with Focus</h3>
                <p className="text-[#666666]">Stay on track, no drift.</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 p-3 bg-blue-100 rounded-full">
                  <ActivityIcon className="h-8 w-8 text-[#4A90E2]" />
                </div>
                <h3 className="text-xl font-semibold mb-2">See Your Growth</h3>
                <p className="text-[#666666]">Know your writer level—daily.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-2xl md:text-3xl font-bold text-[#4A90E2] text-center mb-12">
            Your Writing, Leveled Up
          </h2>

          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="bg-gray-200 w-[200px] h-[100px] flex items-center justify-center rounded-md mb-4">
                <p className="text-gray-600">Idea Organizer screenshot</p>
              </div>
              <h3 className="text-lg font-semibold">1. Plan It</h3>
              <p className="text-sm text-[#666666]">
                Organize your thoughts first
              </p>
            </div>

            <ArrowRightIcon className="hidden md:block h-8 w-8 text-[#4A90E2]" />

            <div className="flex flex-col items-center text-center">
              <div className="bg-gray-200 w-[200px] h-[100px] flex items-center justify-center rounded-md mb-4">
                <p className="text-gray-600">Practice Room screenshot</p>
              </div>
              <h3 className="text-lg font-semibold">2. Write It</h3>
              <p className="text-sm text-[#666666]">
                Craft your text with guidance
              </p>
            </div>

            <ArrowRightIcon className="hidden md:block h-8 w-8 text-[#4A90E2]" />

            <div className="flex flex-col items-center text-center">
              <div className="bg-gray-200 w-[200px] h-[100px] flex items-center justify-center rounded-md mb-4">
                <p className="text-gray-600">Skill Evaluator radar</p>
              </div>
              <h3 className="text-lg font-semibold">3. Track It</h3>
              <p className="text-sm text-[#666666]">
                Watch your skills improve
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Proof Point Section */}
      <section className="py-16 bg-[#F5F6F5] px-4">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-2xl md:text-3xl font-bold text-[#4A90E2] text-center mb-8">
            Grow Like You Mean It
          </h2>

          <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center gap-8 bg-white p-8 rounded-lg shadow-md">
            <div className="flex-1">
              <blockquote className="text-lg italic mb-4">
                &ldquo;Logic went from 5 to 9 in a week—WriteSharp&apos;s my
                coach.&rdquo;
              </blockquote>
              <p className="text-right font-medium">—Alex, 22</p>
            </div>

            <div className="flex-1 flex justify-center">
              <div className="bg-gray-100 w-[200px] h-[200px] rounded-full flex items-center justify-center">
                <p className="text-[#2ECC71] font-semibold">Logic 5 → 9</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <section className="py-16 bg-white border-t border-gray-200 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col items-center text-center space-y-8">
            <h2 className="text-xl text-[#333333]">
              Ready to Write Better? Join Free.
            </h2>

            <Button className="bg-[#2ECC71] hover:bg-[#27AE60] text-white font-medium px-8 py-6 rounded-md">
              Get Started
            </Button>

            <div className="flex gap-6 pt-6">
              <Link href="#" className="text-[#4A90E2] hover:underline">
                About
              </Link>
              <Link href="#" className="text-[#4A90E2] hover:underline">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
