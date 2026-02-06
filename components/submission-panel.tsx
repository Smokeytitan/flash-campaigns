"use client"

import { useState } from "react"
import { CheckCircle2, ExternalLink } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

type SubmissionState = "idle" | "submitting" | "success"

export function SubmissionPanel() {
  const [url, setUrl] = useState("")
  const [state, setState] = useState<SubmissionState>("idle")
  const [error, setError] = useState("")

  const validate = (value: string) => {
    if (!value.trim()) return "Please enter a URL"
    if (
      !value.match(
        /^https?:\/\/(x\.com|twitter\.com)\/\w+\/status\/\d+/
      )
    ) {
      return "Please enter a valid X post URL (e.g. https://x.com/user/status/123)"
    }
    return ""
  }

  const handleSubmit = () => {
    const validationError = validate(url)
    if (validationError) {
      setError(validationError)
      return
    }
    setError("")
    setState("submitting")
    setTimeout(() => {
      setState("success")
    }, 1200)
  }

  if (state === "success") {
    return (
      <div className="rounded-xl border border-success/30 bg-success/5 p-6">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">
              Submitted successfully
            </p>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-primary underline underline-offset-2 hover:text-primary/80"
            >
              View your post
              <ExternalLink className="h-3 w-3" />
            </a>
            <p className="text-xs text-muted-foreground">
              Status: Under review
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border bg-card p-6">
      <Label htmlFor="post-url" className="text-sm font-semibold text-foreground">
        Submit your X post
      </Label>
      <p className="mb-4 mt-1 text-xs text-muted-foreground">
        Paste the URL of your tweet to enter this campaign.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <Input
            id="post-url"
            placeholder="https://x.com/you/status/..."
            value={url}
            onChange={(e) => {
              setUrl(e.target.value)
              if (error) setError(validate(e.target.value))
            }}
            className={error ? "border-destructive focus-visible:ring-destructive" : ""}
            aria-invalid={!!error}
            aria-describedby={error ? "url-error" : undefined}
          />
          {error && (
            <p id="url-error" className="mt-1.5 text-xs text-destructive">
              {error}
            </p>
          )}
        </div>
        <Button
          onClick={handleSubmit}
          disabled={state === "submitting"}
          className="shrink-0"
        >
          {state === "submitting" ? "Submitting..." : "Submit"}
        </Button>
      </div>
    </div>
  )
}
