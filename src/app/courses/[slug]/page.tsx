"use client";

import { useRef, useState, useEffect, Suspense, lazy } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft, ArrowRight, BookOpen, Clock, Users, Star, Play, CheckCircle,
  // Play is kept — used in curriculum rows
  ChevronDown, ChevronUp, Code2, Globe, Layers, Brain, Smartphone, Server,
  Settings, Monitor, Award, Shield, BarChart2, Zap, MessageCircle,
  GraduationCap, Target, FileText, Video, Download, Lock, Sparkles,
  Share2, Heart, Globe2, Infinity, RefreshCcw, Tv,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { publicApi, type Course as ApiCourse } from "@/lib/api";
import Footer from "@/components/Footer";
import BunnyVideoPlayer from "@/components/BunnyVideoPlayer";
import { ReviewsSectionSkeleton } from "@/components/Skeleton";

// Lazy-load reviews — they're below the fold and should never block
// the curriculum, pricing card, or hero from rendering
const ReviewsSection = lazy(() => import("@/components/ReviewsSection"));

// ─── Course Data ───
const allCourses = [
  {
    id: 1,
    slug: "sigma-dsa-full-stack",
    tag: "Most Popular",
    icon: Layers,
    title: "Sigma — DSA + Full Stack",
    subtitle: "Complete Placement Preparation",
    description: "The all-in-one course covering Data Structures, Algorithms, Full Stack Web Dev with MERN, and Aptitude. Industry-aligned curriculum designed by ex-FAANG engineers.",
    longDescription: "Sigma is our flagship program designed for students who want a complete transformation — from coding basics to cracking top tech interviews. This course covers everything: programming fundamentals, advanced Data Structures & Algorithms, full-stack web development with the MERN stack, system design basics, aptitude preparation, and resume building. Every module is structured with video lectures, live doubt sessions, coding assignments, and real-world projects. You'll also get access to our exclusive placement cell that connects you with 500+ hiring partners.",
    duration: "8.5 months",
    students: "48,000+",
    rating: "4.9",
    reviews: "12,400+",
    price: "₹14,999",
    originalPrice: "₹24,999",
    highlights: ["500+ Video Lectures", "Live Sessions", "1-on-1 Doubt Support", "Placement Prep", "Resume Building", "Interview Mocks", "Certificate of Completion"],
    whatYouLearn: [
      "Master all major data structures — arrays, linked lists, trees, graphs, heaps, tries",
      "Solve 500+ coding problems with multiple approaches and optimal solutions",
      "Build 12+ production-grade full-stack applications with React & Node.js",
      "System design fundamentals — design Twitter, URL shortener, chat system",
      "Ace technical interviews with mock interviews and behavioral prep",
      "Deploy apps to cloud (AWS/Vercel) with CI/CD pipelines",
    ],
    prerequisites: ["Basic computer knowledge", "No prior coding experience needed", "A laptop with internet connection"],
    featured: true,
    category: ["all", "popular", "development"],
    level: "Beginner",
    image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=450&fit=crop&auto=format&q=80",
    gradient: "from-indigo-600/80 to-purple-700/90",
    accentColor: "#7c6fff",
    modules: 24,
    projects: 12,
    totalLectures: 520,
    totalHours: "274",
    instructor: "Aman Dhattarwal",
    instructorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&auto=format&q=80",
    instructorBio: "Ex-FAANG engineer with 8+ years of experience. Built products used by millions. Passionate about making tech education accessible and practical.",
    instructorCourses: 4,
    instructorStudents: "1,20,000+",
    instructorRating: "4.9",
    curriculum: [
      { title: "Foundation — Programming Basics", lectures: 28, duration: "14 hours", topics: ["Variables & Data Types", "Control Flow", "Functions", "OOP Basics"] },
      { title: "Data Structures — Linear", lectures: 42, duration: "24 hours", topics: ["Arrays", "Strings", "Linked Lists", "Stacks & Queues"] },
      { title: "Data Structures — Non-Linear", lectures: 38, duration: "22 hours", topics: ["Trees", "BST", "Heaps", "Graphs", "Tries"] },
      { title: "Algorithms — Sorting & Searching", lectures: 32, duration: "18 hours", topics: ["Binary Search", "Merge Sort", "Quick Sort", "Two Pointers"] },
      { title: "Algorithms — Advanced", lectures: 36, duration: "20 hours", topics: ["Dynamic Programming", "Greedy", "Backtracking", "Divide & Conquer"] },
      { title: "Frontend — HTML, CSS, JavaScript", lectures: 44, duration: "26 hours", topics: ["HTML5 Semantic", "CSS3 + Flexbox/Grid", "JavaScript ES6+", "DOM Manipulation"] },
      { title: "Frontend — React & Next.js", lectures: 48, duration: "28 hours", topics: ["React 19", "Hooks & Context", "Next.js App Router", "State Management"] },
      { title: "Backend — Node.js & Express", lectures: 40, duration: "24 hours", topics: ["REST APIs", "Authentication", "Database Design", "Error Handling"] },
      { title: "Database — MongoDB & SQL", lectures: 30, duration: "16 hours", topics: ["MongoDB CRUD", "Aggregation", "SQL Fundamentals", "ORMs"] },
      { title: "System Design Basics", lectures: 22, duration: "14 hours", topics: ["Scalability", "Load Balancing", "Caching", "Database Sharding"] },
      { title: "Projects — Capstone", lectures: 36, duration: "32 hours", topics: ["E-commerce App", "Social Media Clone", "Real-time Chat", "Portfolio Site"] },
      { title: "Placement Preparation", lectures: 24, duration: "16 hours", topics: ["Resume Building", "Mock Interviews", "HR Round Prep", "Salary Negotiation"] },
    ],
    reviewsData: [
      { name: "Rahul K.", avatar: "RK", rating: 5, title: "Life-changing course!", comment: "Got placed at Amazon within 2 months of completing. The DSA section is incredibly well-structured.", date: "2 weeks ago", helpful: 142 },
      { name: "Priya S.", avatar: "PS", rating: 5, title: "Best investment I've made", comment: "Coming from a non-CS background, this course gave me everything I needed. The projects are production-quality.", date: "1 month ago", helpful: 98 },
      { name: "Vikash M.", avatar: "VM", rating: 4, title: "Comprehensive and practical", comment: "The curriculum covers so much ground. Doubt support is amazing — responses within hours. Only wish there was more on system design.", date: "3 weeks ago", helpful: 67 },
      { name: "Ananya R.", avatar: "AR", rating: 5, title: "From zero to hero, literally", comment: "I started knowing nothing about programming. 8 months later, I cracked Flipkart's coding round. This course is that good.", date: "1 month ago", helpful: 203 },
    ],
  },
  { id: 2, slug: "alpha-plus-dsa-java-cpp", tag: "Beginner Friendly", icon: Code2, title: "Alpha Plus — DSA in Java/C++", subtitle: "Master Data Structures & Algorithms", description: "Start from zero and master DSA with 400+ problems.", longDescription: "Alpha Plus is purpose-built for students who want laser-focus on DSA.", duration: "4 months", students: "32,000+", rating: "4.8", reviews: "8,200+", price: "₹7,999", originalPrice: "₹13,999", highlights: ["400+ Video Lectures", "300+ Coding Problems", "Live Doubt Sessions", "Certificate", "Contest Prep", "Pattern-based approach"], whatYouLearn: ["Build a strong foundation in programming with Java or C++", "Master every major data structure with real interview problems", "Learn to identify problem patterns and apply the right approach", "Optimize solutions for time and space complexity", "Prepare for competitive programming contests", "Develop problem-solving intuition that transfers to any language"], prerequisites: ["No prior coding experience needed", "Basic math understanding", "Dedication of 2-3 hours daily"], featured: false, category: ["all", "popular", "development"], level: "Beginner", image: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&h=450&fit=crop&auto=format&q=80", gradient: "from-cyan-600/80 to-blue-700/90", accentColor: "#22d3ee", modules: 16, projects: 6, totalLectures: 420, totalHours: "152", instructor: "Shradha Khapra", instructorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&auto=format&q=80", instructorBio: "IIT graduate, competitive programming champion, and full-time educator.", instructorCourses: 6, instructorStudents: "1,20,000+", instructorRating: "4.8", curriculum: [{ title: "Programming Fundamentals", lectures: 24, duration: "12 hours", topics: ["Variables", "Loops", "Functions", "Recursion Basics"] }, { title: "Arrays & Strings", lectures: 36, duration: "20 hours", topics: ["Array Operations", "Sliding Window", "Two Pointers", "String Manipulation"] }, { title: "Linked Lists", lectures: 28, duration: "16 hours", topics: ["Singly LL", "Doubly LL", "Cycle Detection", "Reversal Techniques"] }, { title: "Stacks & Queues", lectures: 24, duration: "14 hours", topics: ["Stack Applications", "Monotonic Stack", "Queue Variants", "Deque"] }, { title: "Trees & BST", lectures: 40, duration: "24 hours", topics: ["Binary Trees", "BST Operations", "AVL Trees", "Tree Traversals"] }, { title: "Graphs", lectures: 38, duration: "22 hours", topics: ["BFS/DFS", "Shortest Path", "Topological Sort", "Union-Find"] }, { title: "Dynamic Programming", lectures: 44, duration: "26 hours", topics: ["1D DP", "2D DP", "DP on Trees", "Bitmask DP"] }, { title: "Advanced Topics & Contest Prep", lectures: 30, duration: "18 hours", topics: ["Segment Trees", "Tries", "Greedy Strategies", "Contest Techniques"] }], reviewsData: [{ name: "Arjun P.", avatar: "AP", rating: 5, title: "DSA made simple", comment: "Shradha ma'am explains concepts so clearly.", date: "1 week ago", helpful: 89 }, { name: "Neha G.", avatar: "NG", rating: 5, title: "Perfect for beginners", comment: "Step-by-step approach is exactly what I needed.", date: "2 weeks ago", helpful: 56 }] },
  { id: 3, slug: "delta-full-stack-web-dev", tag: "New Batch", icon: Globe, title: "Delta — Full Stack Web Dev", subtitle: "MERN Stack Development", description: "Go from zero to full-stack developer. Build 10+ real-world apps.", longDescription: "Delta is for builders. From HTML to deploying full-stack applications on the cloud.", duration: "5 months", students: "28,000+", rating: "4.9", reviews: "6,800+", price: "₹9,999", originalPrice: "₹17,999", highlights: ["500+ Video Lectures", "10+ Real Projects", "Resume Building", "Job Assistance", "GitHub Portfolio", "Cloud Deployment"], whatYouLearn: ["Build responsive, modern UIs with React 19 and Tailwind CSS", "Create RESTful APIs with Node.js, Express, and MongoDB", "Implement authentication, authorization, and security best practices", "Deploy applications to AWS, Vercel, and Railway", "Use Git/GitHub professionally", "Build a portfolio that stands out to recruiters"], prerequisites: ["Basic computer literacy", "No prior web development experience needed", "Willingness to build projects"], featured: false, category: ["all", "popular", "development"], level: "Beginner", image: "https://images.unsplash.com/photo-1593720213428-28a5b9e94613?w=800&h=450&fit=crop&auto=format&q=80", gradient: "from-emerald-600/80 to-teal-700/90", accentColor: "#34d399", modules: 20, projects: 10, totalLectures: 500, totalHours: "204", instructor: "Shradha Khapra", instructorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&auto=format&q=80", instructorBio: "IIT graduate and full-time educator.", instructorCourses: 6, instructorStudents: "1,20,000+", instructorRating: "4.8", curriculum: [{ title: "Web Fundamentals — HTML & CSS", lectures: 32, duration: "16 hours", topics: ["Semantic HTML5", "CSS3 + Flexbox/Grid", "Responsive Design", "Animations"] }, { title: "JavaScript Mastery", lectures: 40, duration: "24 hours", topics: ["ES6+ Features", "Async/Await", "DOM Manipulation", "Event Handling"] }, { title: "React — Core", lectures: 44, duration: "28 hours", topics: ["Components & Props", "Hooks", "Context API", "React Router"] }, { title: "Backend — Node.js & Express", lectures: 38, duration: "22 hours", topics: ["Server Setup", "Routing", "Middleware", "Error Handling"] }, { title: "Projects — Build & Deploy", lectures: 48, duration: "40 hours", topics: ["E-commerce Store", "Social Network", "Chat App", "Portfolio"] }], reviewsData: [{ name: "Karan T.", avatar: "KT", rating: 5, title: "Built my first SaaS!", comment: "From zero to building and deploying my own SaaS product.", date: "3 days ago", helpful: 112 }] },
  { id: 4, slug: "ai-machine-learning", tag: "Coming Soon", icon: Brain, title: "AI & Machine Learning", subtitle: "Python + Deep Learning + NLP", description: "Learn Python, scikit-learn, TensorFlow, and build AI/ML projects.", longDescription: "Our upcoming AI & Machine Learning course covers the complete ML pipeline.", duration: "6 months", students: "Early Access", rating: "—", reviews: "—", price: "₹11,999", originalPrice: "₹19,999", highlights: ["Python Fundamentals", "ML Algorithms", "Deep Learning & NLP", "Cloud Deployment", "Capstone Project"], whatYouLearn: ["Master Python for data science and ML", "Implement ML algorithms from scratch", "Build deep learning models with TensorFlow/PyTorch", "Deploy ML models to production"], prerequisites: ["Basic math (linear algebra, statistics)", "Some programming experience helpful"], featured: false, category: ["all", "data"], level: "Intermediate", image: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&h=450&fit=crop&auto=format&q=80", gradient: "from-violet-600/80 to-fuchsia-700/90", accentColor: "#a78bfa", modules: 18, projects: 8, totalLectures: 360, totalHours: "180", instructor: "Aman Dhattarwal", instructorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&auto=format&q=80", instructorBio: "Ex-FAANG engineer with 8+ years of experience.", instructorCourses: 4, instructorStudents: "1,20,000+", instructorRating: "4.9", curriculum: [{ title: "Python for ML", lectures: 30, duration: "16h", topics: ["NumPy", "Pandas", "Matplotlib"] }, { title: "Machine Learning", lectures: 40, duration: "24h", topics: ["Regression", "Classification", "Clustering"] }], reviewsData: [] },
  { id: 5, slug: "frontend-mastery-react-nextjs", tag: "Trending", icon: Monitor, title: "Frontend Mastery — React & Next.js", subtitle: "Modern UI Engineering", description: "Master React 19, Next.js 16, TypeScript, Tailwind CSS, and Framer Motion.", longDescription: "Become a frontend engineering expert.", duration: "4 months", students: "18,000+", rating: "4.9", reviews: "4,200+", price: "₹8,999", originalPrice: "₹15,999", highlights: ["React 19 + Next.js 16", "TypeScript Deep Dive", "Animation & Design Systems", "Performance Optimization", "Portfolio Projects"], whatYouLearn: ["Build production apps with React 19 and Next.js 16", "TypeScript for type-safe applications", "Create stunning animations with Framer Motion", "Master Tailwind CSS for rapid UI development"], prerequisites: ["Basic HTML/CSS/JS knowledge", "Familiarity with any programming language"], featured: false, category: ["all", "development"], level: "Intermediate", image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=450&fit=crop&auto=format&q=80", gradient: "from-sky-600/80 to-indigo-700/90", accentColor: "#38bdf8", modules: 14, projects: 7, totalLectures: 280, totalHours: "136", instructor: "Shradha Khapra", instructorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&auto=format&q=80", instructorBio: "IIT graduate and full-time educator.", instructorCourses: 6, instructorStudents: "1,20,000+", instructorRating: "4.8", curriculum: [{ title: "TypeScript Fundamentals", lectures: 20, duration: "12h", topics: ["Types", "Generics", "Utility Types"] }, { title: "React 19 Deep Dive", lectures: 36, duration: "22h", topics: ["RSC", "Hooks", "Suspense"] }], reviewsData: [{ name: "Dev P.", avatar: "DP", rating: 5, title: "Frontend game-changer", comment: "Went from basic React to building complex apps.", date: "1 week ago", helpful: 45 }] },
  { id: 6, slug: "backend-engineering-nodejs-go", tag: "Advanced", icon: Server, title: "Backend Engineering — Node.js & Go", subtitle: "Scalable Systems & APIs", description: "Build scalable backend systems with Node.js and Go.", longDescription: "Master backend engineering with two powerful languages.", duration: "5 months", students: "14,000+", rating: "4.8", reviews: "3,600+", price: "₹10,999", originalPrice: "₹18,999", highlights: ["Node.js + Express", "Go Fundamentals", "System Design", "PostgreSQL + Redis", "Docker & CI/CD"], whatYouLearn: ["Build production REST and GraphQL APIs", "Master Go for high-performance backends", "Implement caching with Redis", "Design scalable microservices architectures"], prerequisites: ["JavaScript/TypeScript basics", "Understanding of HTTP and APIs", "Basic database knowledge"], featured: false, category: ["all", "development", "devops"], level: "Advanced", image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=450&fit=crop&auto=format&q=80", gradient: "from-orange-600/80 to-red-700/90", accentColor: "#f97316", modules: 18, projects: 9, totalLectures: 360, totalHours: "168", instructor: "Aman Dhattarwal", instructorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&auto=format&q=80", instructorBio: "Ex-FAANG engineer with 8+ years of experience.", instructorCourses: 4, instructorStudents: "1,20,000+", instructorRating: "4.9", curriculum: [{ title: "Node.js Advanced", lectures: 32, duration: "18h", topics: ["Streams", "Worker Threads", "Clustering"] }, { title: "Go Fundamentals", lectures: 28, duration: "16h", topics: ["Goroutines", "Channels", "Interfaces"] }], reviewsData: [{ name: "Aditya K.", avatar: "AK", rating: 5, title: "Backend mastery", comment: "The Go section alone is worth the price.", date: "2 weeks ago", helpful: 67 }] },
  { id: 7, slug: "devops-cloud-aws-docker", tag: "New", icon: Settings, title: "DevOps & Cloud — AWS + Docker", subtitle: "Infrastructure & Automation", description: "Master Docker, Kubernetes, AWS, Terraform, and CI/CD pipelines.", longDescription: "Learn to deploy, scale, and monitor production applications.", duration: "4 months", students: "9,500+", rating: "4.7", reviews: "2,100+", price: "₹9,499", originalPrice: "₹16,999", highlights: ["Docker & Kubernetes", "AWS Core Services", "Terraform IaC", "CI/CD Pipelines", "Monitoring & Logging"], whatYouLearn: ["Containerize applications with Docker", "Orchestrate with Kubernetes", "Deploy on AWS (EC2, S3, Lambda, RDS)", "Automate infrastructure with Terraform"], prerequisites: ["Basic Linux command line", "Some backend development experience", "Understanding of networking basics"], featured: false, category: ["all", "devops"], level: "Intermediate", image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=450&fit=crop&auto=format&q=80", gradient: "from-amber-600/80 to-orange-700/90", accentColor: "#fbbf24", modules: 12, projects: 6, totalLectures: 240, totalHours: "120", instructor: "Shradha Khapra", instructorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&auto=format&q=80", instructorBio: "IIT graduate and full-time educator.", instructorCourses: 6, instructorStudents: "1,20,000+", instructorRating: "4.8", curriculum: [{ title: "Docker Deep Dive", lectures: 24, duration: "14h", topics: ["Containers", "Compose", "Networking"] }], reviewsData: [] },
  { id: 8, slug: "mobile-dev-react-native", tag: "Hot", icon: Smartphone, title: "Mobile Dev — React Native", subtitle: "Cross-Platform App Development", description: "Build beautiful, performant mobile apps for iOS and Android.", longDescription: "Build cross-platform mobile apps from scratch to App Store deployment.", duration: "3.5 months", students: "11,000+", rating: "4.8", reviews: "2,800+", price: "₹8,499", originalPrice: "₹14,999", highlights: ["React Native + Expo", "Native Modules", "State Management", "App Store Deployment", "Push Notifications"], whatYouLearn: ["Build iOS and Android apps from a single codebase", "Implement native features and animations", "Handle state management at scale", "Deploy to App Store and Google Play"], prerequisites: ["React basics", "JavaScript ES6+", "Basic understanding of mobile UX"], featured: false, category: ["all", "development"], level: "Intermediate", image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=450&fit=crop&auto=format&q=80", gradient: "from-rose-600/80 to-pink-700/90", accentColor: "#fb7185", modules: 12, projects: 5, totalLectures: 240, totalHours: "112", instructor: "Aman Dhattarwal", instructorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&auto=format&q=80", instructorBio: "Ex-FAANG engineer with 8+ years of experience.", instructorCourses: 4, instructorStudents: "1,20,000+", instructorRating: "4.9", curriculum: [{ title: "React Native Core", lectures: 28, duration: "16h", topics: ["Components", "Navigation", "Animations"] }], reviewsData: [] },
  { id: 9, slug: "system-design-lld-hld", tag: "Advanced", icon: Layers, title: "System Design — LLD + HLD", subtitle: "Architect Scalable Systems", description: "Master low-level and high-level system design.", longDescription: "Design Twitter, Uber, Netflix from scratch.", duration: "3 months", students: "7,200+", rating: "4.9", reviews: "1,900+", price: "₹12,999", originalPrice: "₹21,999", highlights: ["Low-Level Design", "High-Level Design", "Design Patterns", "Database Sharding", "Real Interview Questions"], whatYouLearn: ["Design large-scale distributed systems", "Apply SOLID principles and design patterns", "Handle scalability, availability, and consistency tradeoffs", "Crack system design interviews at FAANG companies"], prerequisites: ["2+ years of programming experience", "Understanding of databases and networking", "Familiarity with at least one backend language"], featured: false, category: ["all", "popular", "development"], level: "Advanced", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop&auto=format&q=80", gradient: "from-slate-600/80 to-zinc-700/90", accentColor: "#94a3b8", modules: 10, projects: 8, totalLectures: 200, totalHours: "96", instructor: "Shradha Khapra", instructorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&auto=format&q=80", instructorBio: "IIT graduate and full-time educator.", instructorCourses: 6, instructorStudents: "1,20,000+", instructorRating: "4.8", curriculum: [{ title: "LLD — Design Patterns", lectures: 18, duration: "12h", topics: ["SOLID", "Factory", "Observer", "Strategy"] }, { title: "HLD — Distributed Systems", lectures: 24, duration: "16h", topics: ["Load Balancing", "Sharding", "CAP Theorem"] }], reviewsData: [{ name: "Mohit V.", avatar: "MV", rating: 5, title: "Best system design course", comment: "Cleared Google L5 system design round after this course.", date: "1 month ago", helpful: 156 }] },
  { id: 10, slug: "data-science-analytics", tag: "New", icon: Brain, title: "Data Science & Analytics", subtitle: "Python + SQL + Visualization", description: "Become a data analyst or data scientist.", longDescription: "Master Python, Pandas, SQL, Tableau, and statistical methods.", duration: "5 months", students: "6,800+", rating: "4.7", reviews: "1,500+", price: "₹9,999", originalPrice: "₹17,999", highlights: ["Python + Pandas", "SQL Mastery", "Data Visualization", "Statistical Analysis", "Capstone Project"], whatYouLearn: ["Analyze and visualize data with Python and Pandas", "Write complex SQL queries for data extraction", "Build interactive dashboards with Tableau", "Apply statistical methods to derive business insights"], prerequisites: ["Basic math and statistics", "No prior programming needed", "Curiosity about data-driven decisions"], featured: false, category: ["all", "data"], level: "Beginner", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=450&fit=crop&auto=format&q=80", gradient: "from-teal-600/80 to-cyan-700/90", accentColor: "#2dd4bf", modules: 16, projects: 7, totalLectures: 320, totalHours: "148", instructor: "Aman Dhattarwal", instructorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&auto=format&q=80", instructorBio: "Ex-FAANG engineer with 8+ years of experience.", instructorCourses: 4, instructorStudents: "1,20,000+", instructorRating: "4.9", curriculum: [{ title: "Python for Data", lectures: 28, duration: "14h", topics: ["NumPy", "Pandas", "Data Cleaning"] }, { title: "SQL & Databases", lectures: 24, duration: "12h", topics: ["Joins", "Window Functions", "CTEs"] }], reviewsData: [] },
];

function getCourse(slug: string) {
  return allCourses.find((c) => c.slug === slug) || allCourses[0];
}

export default function CourseDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const course = getCourse(slug);
  const [expandedModule, setExpandedModule] = useState<number | null>(0);
  const [showAllCurriculum, setShowAllCurriculum] = useState(false);
  const [wishlist, setWishlist] = useState(false);

  const heroRef = useRef<HTMLDivElement>(null);

  const discount = course.originalPrice && course.price
    ? Math.round((1 - parseInt(course.price.replace(/[^\d]/g, "")) / parseInt(course.originalPrice.replace(/[^\d]/g, ""))) * 100)
    : 0;

  const visibleCurriculum = showAllCurriculum ? course.curriculum : course.curriculum.slice(0, 5);

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">

      {/* ═══ NAVBAR ═══ */}
      <header className="sticky top-0 z-50 py-2.5 backdrop-blur-xl border-b border-[var(--color-border)] bg-[var(--color-bg)]/90">
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/courses" className="flex items-center gap-1.5 text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] transition-colors text-[0.8rem]">
              <ArrowLeft size={15} /> <span className="hidden sm:inline">All Courses</span>
            </Link>
            <span className="w-px h-4 bg-[var(--color-border)] hidden sm:block" />
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-7 h-7 rounded-md bg-[var(--color-brand)] flex items-center justify-center">
                <BookOpen size={13} className="text-white" strokeWidth={2.5} />
              </div>
              <span className="font-display font-extrabold text-[0.9rem] text-[var(--color-fg)] hidden sm:inline" style={{ fontFamily: "var(--font-display)" }}><span className="text-grad">CGS</span></span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setWishlist((w) => !w)} className={cn("w-8 h-8 rounded-md border flex items-center justify-center transition-all text-[var(--color-fg-muted)]", wishlist && "text-rose-400 border-rose-500/30")}>
              <Heart size={14} className={wishlist ? "fill-current" : ""} />
            </button>
            <button className="w-8 h-8 rounded-md border border-[var(--color-border)] flex items-center justify-center text-[var(--color-fg-muted)]"><Share2 size={14} /></button>
          </div>
        </div>
      </header>

      {/* ═══ DARK HERO BANNER — sized only by its own text, no grid, no card ═══ */}
      <div ref={heroRef} className="bg-[#1a1a2e] border-b border-[var(--color-border)]">
        <div className="container py-4 sm:py-8 lg:pb-[70px]">
          <div className="lg:max-w-[calc(100%-380px)]">
            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-[0.7rem] sm:text-[0.78rem] text-[rgba(255,255,255,0.4)] mb-3 flex-wrap">
              <Link href="/" className="hover:text-[rgba(255,255,255,0.7)]">Home</Link><span>/</span>
              <Link href="/courses" className="hover:text-[rgba(255,255,255,0.7)]">Courses</Link><span>/</span>
              <span className="text-[rgba(255,255,255,0.6)]">{course.category[1] || "Development"}</span>
            </div>
            {/* Title */}
            <h1 className="font-display font-black text-[clamp(1.6rem,4vw,2.4rem)] text-white tracking-tight leading-tight mb-2" style={{ fontFamily: "var(--font-display)" }}>
              {course.title}
            </h1>
            <p className="text-[0.92rem] sm:text-[1rem] text-[rgba(255,255,255,0.65)] leading-relaxed mb-3 max-w-[560px]">{course.description}</p>
            {/* Meta row */}
            <div className="flex items-center gap-3 text-[0.85rem] sm:text-[0.9rem] flex-wrap mb-2">
              {course.featured && <span className="text-[0.7rem] sm:text-[0.75rem] font-bold px-2 py-0.5 rounded bg-[var(--color-amber)] text-black">Bestseller</span>}
              {course.rating !== "—" && (
                <span className="flex items-center gap-1.5 text-[var(--color-amber)] font-bold">
                  {course.rating}
                  <span className="flex">{[...Array(5)].map((_, i) => <Star key={i} size={13} className={cn("fill-current", i < Math.floor(parseFloat(course.rating)) ? "" : "opacity-30")} />)}</span>
                  <span className="text-[rgba(255,255,255,0.5)] font-normal underline ml-1">({course.reviews})</span>
                </span>
              )}
              <span className="text-[rgba(255,255,255,0.55)]">{course.students} students</span>
            </div>
            <div className="flex items-center gap-3 text-[0.82rem] sm:text-[0.88rem] text-[rgba(255,255,255,0.5)] flex-wrap mb-3">
              <span>By <span className="text-[var(--color-brand-light)] underline">{course.instructor}</span></span>
              <span className="flex items-center gap-1.5"><RefreshCcw size={13} />01/2026</span>
              <span className="flex items-center gap-1.5"><Globe2 size={13} />English, Hindi</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="tag text-[0.7rem] sm:text-[0.75rem] py-1 px-2.5">{course.tag}</span>
              <span className={cn("text-[0.7rem] sm:text-[0.75rem] font-bold px-2.5 py-1 rounded-full border",
                course.level === "Beginner" && "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
                course.level === "Intermediate" && "bg-amber-500/10 text-amber-400 border-amber-500/25",
                course.level === "Advanced" && "bg-rose-500/10 text-rose-400 border-rose-500/25"
              )}>{course.level}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ MAIN CONTENT — grid; card sits in right column, pulled up to overlap the hero, then sticky ═══ */}
      <div className="container">
        <div className="grid lg:grid-cols-[1fr_340px] gap-8">

          {/* Right column: enrollment card — negative margin pulls it up over the hero, sticky keeps it in view while scrolling */}
          <div className="hidden lg:block order-2 lg:-mt-[90px] lg:sticky lg:top-[76px] lg:self-start" id="enroll">
            <div className="rounded-xl border border-[var(--color-border-2)] bg-[var(--color-surface)] shadow-[0_8px_40px_rgba(0,0,0,0.5)] overflow-hidden">
              {/* Preview video — Bunny Stream embed */}
              <div className="relative">
                <BunnyVideoPlayer
                  thumbnail={course.image}
                  alt={`${course.title} preview`}
                  className="rounded-none"
                />
                {discount > 0 && (
                  <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-[var(--color-brand)] text-white text-[0.62rem] font-bold z-10">{discount}% OFF</div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-display font-black text-[1.4rem] text-[var(--color-fg)] leading-none" style={{ fontFamily: "var(--font-display)" }}>{course.price}</span>
                  {course.originalPrice && <span className="text-[0.8rem] text-[var(--color-fg-subtle)] line-through">{course.originalPrice}</span>}
                </div>
                <p className="text-[0.68rem] text-rose-300 mb-3 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />Sale ends in 1d 23h 14m
                </p>
                <button className="btn btn-brand w-full justify-center py-2.5 px-3 text-[0.78rem] mb-2 font-bold">
                  {course.tag === "Coming Soon" ? "Join Waitlist" : "Enroll Now"} <ArrowRight size={13} />
                </button>
                <button className="btn btn-outline w-full justify-center py-2 px-3 text-[0.74rem] mb-2">Add to Cart</button>
                <p className="text-center text-[0.66rem] text-[var(--color-fg-subtle)] mb-2.5">30-Day Money-Back Guarantee</p>
                <div className="flex items-center justify-center gap-4 pt-2 border-t border-[var(--color-border)] text-[0.68rem] text-[var(--color-fg-muted)]">
                  <button className="hover:text-[var(--color-fg)] flex items-center gap-1"><Share2 size={10} />Share</button>
                  <button className="hover:text-[var(--color-fg)] flex items-center gap-1"><GraduationCap size={10} />Gift</button>
                  <button onClick={() => setWishlist((w) => !w)} className={cn("flex items-center gap-1", wishlist ? "text-rose-400" : "hover:text-[var(--color-fg)]")}>
                    <Heart size={10} className={wishlist ? "fill-current" : ""} />Wishlist
                  </button>
                </div>
                <div className="mt-2 pt-2 border-t border-[var(--color-border)] flex gap-2">
                  <input type="text" placeholder="Coupon" className="input py-2 px-3 text-[0.7rem] rounded-md flex-1" />
                  <button className="btn btn-outline py-2 px-3 text-[0.68rem] rounded-md">Apply</button>
                </div>
              </div>
            </div>
          </div>

          {/* Left column: all page content */}
          <div className="order-1 py-6">

        {/* What you'll learn */}
        <div className="border border-[var(--color-border)] rounded-xl p-4 mb-5">
          <h2 className="font-display font-bold text-[0.98rem] text-[var(--color-fg)] mb-3" style={{ fontFamily: "var(--font-display)" }}>What you&apos;ll learn</h2>
          <div className="grid sm:grid-cols-2 gap-x-4 gap-y-1.5">
            {course.whatYouLearn.map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <CheckCircle size={13} className="flex-shrink-0 mt-0.5 text-[var(--color-brand)]" />
                <span className="text-[0.75rem] text-[var(--color-fg-muted)] leading-snug">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* This course includes */}
        <div className="mb-5">
          <h2 className="font-display font-bold text-[0.98rem] text-[var(--color-fg)] mb-2.5" style={{ fontFamily: "var(--font-display)" }}>This course includes</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {[
              { icon: Video, text: `${course.totalHours}h video` },
              { icon: FileText, text: `${course.totalLectures}+ lectures` },
              { icon: Target, text: `${course.projects} projects` },
              { icon: Download, text: "Resources" },
              { icon: Infinity, text: "Lifetime access" },
              { icon: Award, text: "Certificate" },
            ].map(({ icon: I, text }) => (
              <div key={text} className="flex items-center gap-1.5 text-[0.72rem] text-[var(--color-fg-muted)]">
                <I size={13} className="text-[var(--color-fg-subtle)]" />{text}
              </div>
            ))}
          </div>
        </div>

        {/* Course content */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="font-display font-bold text-[0.98rem] text-[var(--color-fg)]" style={{ fontFamily: "var(--font-display)" }}>Course content</h2>
            <span className="text-[0.65rem] text-[var(--color-fg-muted)]">{course.curriculum.length} sections • {course.totalLectures} lectures • {course.totalHours}h</span>
          </div>
          <div className="border border-[var(--color-border)] rounded-xl overflow-hidden divide-y divide-[var(--color-border)]">
            {visibleCurriculum.map((mod, idx) => (
              <div key={idx} className="bg-[var(--color-surface)]">
                <button onClick={() => setExpandedModule(expandedModule === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-3 text-left hover:bg-[var(--color-surface-2)] transition-colors">
                  <div className="flex items-center gap-2">
                    {expandedModule === idx ? <ChevronUp size={13} className="text-[var(--color-fg-muted)]" /> : <ChevronDown size={13} className="text-[var(--color-fg-muted)]" />}
                    <span className="text-[0.78rem] font-semibold text-[var(--color-fg)]">{mod.title}</span>
                  </div>
                  <span className="text-[0.65rem] text-[var(--color-fg-subtle)] ml-3 whitespace-nowrap">{mod.lectures} lectures • {mod.duration}</span>
                </button>
                <AnimatePresence>
                  {expandedModule === idx && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                      <div className="px-3 pb-2.5 space-y-1">
                        {mod.topics.map((topic: string, tIdx: number) => (
                          <div key={tIdx} className="flex items-center justify-between py-1 px-2 rounded-md hover:bg-[var(--color-surface-2)]">
                            <div className="flex items-center gap-2">
                              {tIdx < 2 ? <Play size={10} className="text-[var(--color-fg-subtle)]" /> : <Lock size={10} className="text-[var(--color-fg-subtle)]" />}
                              <span className="text-[0.72rem] text-[var(--color-fg-muted)]">{topic}</span>
                            </div>
                            {tIdx < 2 && <span className="text-[0.58rem] font-semibold text-[var(--color-brand-light)] border border-[var(--color-border-brand)] px-1.5 py-0.5 rounded">Preview</span>}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
          {course.curriculum.length > 5 && (
            <button onClick={() => setShowAllCurriculum(!showAllCurriculum)} className="btn btn-outline w-full justify-center mt-2.5 text-[0.75rem] py-2">
              {showAllCurriculum ? "Show less" : `Show all ${course.curriculum.length} sections`}
              {showAllCurriculum ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
          )}
        </div>

        {/* Requirements */}
        <div className="mb-5">
          <h2 className="font-display font-bold text-[0.98rem] text-[var(--color-fg)] mb-2" style={{ fontFamily: "var(--font-display)" }}>Requirements</h2>
          <ul className="space-y-1">
            {course.prerequisites.map((p, i) => (
              <li key={i} className="flex items-start gap-2 text-[0.75rem] text-[var(--color-fg-muted)]">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-fg-muted)] mt-[6px] flex-shrink-0" />{p}
              </li>
            ))}
          </ul>
        </div>

        {/* Description */}
        <div className="mb-5">
          <h2 className="font-display font-bold text-[0.98rem] text-[var(--color-fg)] mb-2" style={{ fontFamily: "var(--font-display)" }}>Description</h2>
          <p className="text-[0.78rem] text-[var(--color-fg-muted)] leading-[1.65] mb-2.5">{course.longDescription}</p>
          <div className="flex flex-wrap gap-1.5">
            {course.highlights.map((h) => (
              <span key={h} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--color-surface)] border border-[var(--color-border)] text-[0.65rem] text-[var(--color-fg-muted)]">
                <Sparkles size={8} style={{ color: course.accentColor }} />{h}
              </span>
            ))}
          </div>
        </div>

        {/* Instructor */}
        <div className="mb-5">
          <h2 className="font-display font-bold text-[0.98rem] text-[var(--color-fg)] mb-2.5" style={{ fontFamily: "var(--font-display)" }}>Instructor</h2>
          <div className="flex items-start gap-3">
            <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 border-2 border-[var(--color-border)]">
              <Image src={course.instructorAvatar} alt={course.instructor} width={56} height={56} className="object-cover w-full h-full" />
            </div>
            <div>
              <p className="text-[0.84rem] font-semibold text-[var(--color-brand-light)] mb-0.5">{course.instructor}</p>
              <div className="flex flex-wrap gap-x-2.5 gap-y-0.5 mb-1 text-[0.68rem] text-[var(--color-fg-muted)]">
                <span className="flex items-center gap-1"><Star size={9} className="text-[var(--color-amber)]" />{course.instructorRating}</span>
                <span className="flex items-center gap-1"><Users size={9} />{course.instructorStudents}</span>
                <span className="flex items-center gap-1"><Play size={9} />{course.instructorCourses} Courses</span>
              </div>
              <p className="text-[0.74rem] text-[var(--color-fg-muted)] leading-relaxed">{course.instructorBio}</p>
            </div>
          </div>
        </div>

        {/* Reviews — lazy loaded, never blocks above-the-fold content */}
        <Suspense fallback={<ReviewsSectionSkeleton />}>
          <ReviewsSection
            rating={course.rating}
            reviewsData={course.reviewsData}
          />
        </Suspense>

        {/* Related */}
        <div className="pb-28 lg:pb-0">
          <h2 className="font-display font-bold text-[0.98rem] text-[var(--color-fg)] mb-2.5" style={{ fontFamily: "var(--font-display)" }}>Students also bought</h2>
          <div className="space-y-1.5">
            {allCourses.filter(c => c.slug !== course.slug).slice(0, 3).map(rc => (
              <Link key={rc.id} href={`/courses/${rc.slug}`} className="flex items-center gap-2.5 p-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-border-2)] transition-all group">
                <div className="w-[64px] h-[40px] rounded-md overflow-hidden flex-shrink-0 relative"><Image src={rc.image} alt={rc.title} fill className="object-cover" sizes="64px" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-[0.72rem] font-semibold text-[var(--color-fg)] truncate group-hover:text-[var(--color-brand-light)]">{rc.title}</p>
                  <p className="text-[0.6rem] text-[var(--color-fg-subtle)]">{rc.instructor} • {rc.duration}</p>
                </div>
                <span className="text-[0.76rem] font-bold text-[var(--color-fg)] flex-shrink-0">{rc.price}</span>
              </Link>
            ))}
          </div>
        </div>

          </div>
        </div>
      </div>

      {/* ═══ FOOTER ═══ */}
      <Footer />

      {/* ═══ MOBILE STICKY ENROLL BAR — replaces the desktop card below lg ═══ */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--color-surface)] border-t border-[var(--color-border-2)] shadow-[0_-8px_32px_rgba(0,0,0,0.4)] px-4 py-3"
        style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}>
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <div className="flex items-baseline gap-1.5">
              <span className="font-display font-black text-[1.1rem] text-[var(--color-fg)] leading-none" style={{ fontFamily: "var(--font-display)" }}>{course.price}</span>
              {course.originalPrice && <span className="text-[0.66rem] text-[var(--color-fg-subtle)] line-through">{course.originalPrice}</span>}
            </div>
            {discount > 0 && <p className="text-[0.6rem] text-rose-300">{discount}% off</p>}
          </div>
          <button className="btn btn-outline flex-1 justify-center py-2.5 px-3 text-[0.78rem]">Add to Cart</button>
          <button className="btn btn-brand flex-1 justify-center py-2.5 px-3 text-[0.78rem] font-bold">
            {course.tag === "Coming Soon" ? "Join Waitlist" : "Enroll Now"}
          </button>
        </div>
      </div>
    </div>
  );
}
