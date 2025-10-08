"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { findMockUser } from "@/lib/mocks/users"

export default function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    const user = findMockUser(email, password)

    if (!user) {
      setError("E-mail atau password salah")
      setIsSubmitting(false)
      return
    }

    localStorage.setItem("token", `mock-token-${user.role}`)
    localStorage.setItem("role", user.role)
    localStorage.setItem("name", user.name)

    setIsSubmitting(false)
    router.push("/")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="w-[350px] shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">Login</CardTitle>
          <CardDescription>
            Masukkan kredensial dummy sesuai role (admin, owner, user)
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm">E-mail address</label>
              <Input
                type="email"
                autoComplete="email"
                placeholder="Enter your e-mail address..."
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="text-sm">Password</label>
              <Input
                type="password"
                autoComplete="current-password"
                placeholder="********"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={isSubmitting}
              />
            </div>
            {error ? (
              <p className="text-sm text-red-500">{error}</p>
            ) : null}
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Login"}
            </Button>
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="underline">Register</Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
