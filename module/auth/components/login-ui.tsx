"use client"

import { signIn } from "@/lib/auth-client"
import { GitBranchIcon as GithubIcon } from "lucide-react"
import { useState } from "react"


const LoginUI =  () => {

    
  const [isLoading, setIsLoading] = useState(false);

  const handleGithubLogin = async () => {
    setIsLoading(true)
    try {
      await signIn.social({
        provider: "github"
      })
    } catch (error) {
      console.error("Login error:", error)
      setIsLoading(false)
    }
  }

  return (

    <div className="min-h-screen bg-linear-to-br from-zinc-950 via-black to-zinc-900 text-white dark flex flex-col lg:flex-row">
      {/* Left Section - Hero Content */}
      <div className="flex-1 flex flex-col justify-center px-8 py-12 sm:px-12 lg:px-16">
        <div className="max-w-2xl">
          {/* Logo */}
          <div className="mb-14">
            <div className="inline-flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-sm font-black text-black">
                RF
              </div>
              <div>
                <span className="block text-2xl font-bold tracking-wide">REVIEWFORGE</span>
                <span className="text-xs uppercase tracking-[0.25em] text-gray-500">AI code review</span>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <h1 className="mb-6 max-w-xl text-5xl font-bold leading-tight text-balance sm:text-6xl">
            Ship cleaner code with reviews that catch what humans miss.
          </h1>

          <p className="max-w-xl text-lg leading-relaxed text-gray-400">
            Turn every pull request into a sharper release: faster feedback, clearer fixes, and fewer bugs reaching production.
          </p>

          <div className="mt-10 flex flex-wrap gap-3 text-sm text-gray-300">
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">Instant PR summaries</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">Bug-risk signals</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">Cleaner team reviews</span>
          </div>
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div className="flex-1 flex flex-col justify-center items-center px-8 py-12 sm:px-12 lg:px-16">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.03] p-8 shadow-2xl shadow-black/40">
          <div className="mb-8">
            <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-gray-500">Secure access</p>
            <h2 className="mb-3 text-3xl font-bold">Welcome back</h2>
            <p className="text-sm leading-relaxed text-gray-400">
              Connect your GitHub account to open your ReviewForge workspace.
            </p>
          </div>

          {/* GitHub Login Button */}
          <button
            onClick={handleGithubLogin}
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 font-semibold text-black transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <GithubIcon size={20} />
            {isLoading ? "Signing in..." : "Continue with GitHub"}
          </button>

          {/* Footer Links */}
          <div className="mt-8 space-y-4 border-t border-white/10 pt-6 text-center text-sm text-gray-400">
            <div>
              New to ReviewForge?{" "}
              <a href="#" className="text-primary hover:text-primary font-semibold">
                Create an account
              </a>
            </div>
            <div>
              <a href="#" className="font-semibold text-orange-500 hover:text-orange-400">
                Explore self-hosted setup
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginUI;
