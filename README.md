# WriteSharp - Sharpen Your Writing Skills

WriteSharp is a web application designed to help aspiring writers—particularly young individuals—improve their writing skills by generating and organizing their own ideas, expressing them clearly and logically, and mastering grammar and word choice. It's a practical, user-driven tool that bridges the gap between raw thoughts and polished writing.

## Purpose

To empower users to:

- Develop their ability to brainstorm and structure original ideas.
- Write with clarity, logic, and confidence.
- Identify and overcome personal writing weaknesses (e.g., grammar errors, poor word choice).
- Build a consistent writing habit in a flexible, supportive environment.

## Features

### Auto-Save

WriteSharp includes an automatic draft saving feature that:

- Silently saves your work as you type
- Waits until you stop typing for a few seconds before saving
- Shows you when your draft was last saved
- Works alongside manual saves when you want to explicitly save progress

For more details on the implementation, see [Auto-Save Implementation](./documents/auto-save-implementation.md).

### AI-Powered Writing Evaluation

WriteSharp uses advanced AI to evaluate your writing skills:

- Gemini AI analyzes your drafts across multiple writing dimensions
- Provides scores for clarity, logic, expression, structure, and grammar
- Tracks your progress over time with a writer profile
- Automatically determines your writing level based on performance

For more details on this feature, see [LLM Evaluation Implementation](./documents/llm-evaluation-implementation.md).

## Target Audience

- Young writers (e.g., students, hobbyists) looking to improve clarity, structure, and correctness.
- Beginners who struggle with organizing ideas or grammar, with room to scale for advanced users.

## Getting Started

### Environment Setup

1. Copy the `.env.local.example` file to `.env.local`:

```bash
cp .env.local.example .env.local
```

2. Set up your environment variables:
   - For Supabase, add your Supabase credentials
   - For Gemini AI, add your Gemini API key (get one from [Google AI Studio](https://makersuite.google.com/app/apikey))

### Running the Application

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## API Features

### Gemini AI Integration

WriteSharp uses Google's Gemini AI (Flash 2.0 model) to provide intelligent writing suggestions. The API includes:

#### Ideas Generation API

Endpoint: `POST /api/ideas`

Request body:

```json
{
  "existingIdeas": ["Your first idea", "Your second idea"],
  "ideaIndex": 0, // Optional: index of the idea being edited
  "foundation": {
    // Optional: foundation information for more targeted suggestions
    "topic": "Topic of your writing",
    "audience": "Your target audience",
    "purpose": "Purpose of your writing"
  }
}
```

Response:

```json
{
  "suggestion": "AI-generated suggestion",
  "ideaIndex": 0 // If provided in request
}
```

#### Testing the API

- To test if Gemini is properly configured: `GET /api/test-gemini`
- To test the ideas API with foundation information: `POST /api/test-gemini`

## Features

- User Authentication with Email/Password
- Draft Management System
- Writing Foundation Setup
- Ideas Development Tools
- Content Editor with Auto-Save
- Writing Skill Evaluator
  - Automatic evaluation of writing skills across multiple dimensions
  - Writer profile that tracks skill development over time
  - Personalized writing tips based on performance
  - Visual progress tracking with charts
- And more!

## Writing Skill Evaluator

The application includes an automatic skill evaluation system that analyzes your writing and provides actionable feedback:

### How It Works

1. **Triggering the Evaluator**

   - When you save a draft or mark it as "Feedback Ready", the system automatically evaluates your writing
   - It checks for originality and flags content that may be copied from external sources
   - Your skills profile is updated with the latest evaluation

2. **Evaluation Criteria**

   - **Reasoner Skills (60% weight)**:
     - Clarity (20%): Measures the precision of language and concepts
     - Logic (20%): Assesses the logical flow and connections between ideas
     - Expression (20%): Evaluates vocabulary diversity and word choice
   - **Polisher Skills (40% weight)**:
     - Structure (20%): Checks for proper introduction, body, and conclusion
     - Grammar/Words (20%): Identifies grammatical and spelling errors

3. **Writer Profile**

   - Your overall level (Beginner, Solid, Advanced, Expert) is determined by your performance
   - The profile is based on a rolling average of your recent drafts
   - Visual charts show your progress over time
   - Personalized tips help you improve specific areas

4. **View Your Skills**
   - Navigate to "Your Skills" from the dashboard to see your full skills profile
   - Review specific scores and track your improvement over time
