"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log(formData)
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-[400px] shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">Register</CardTitle>
          <CardDescription>
            Enter your details below to create an account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-sm">First Name</label>
                <Input
                  name="firstName"
                  placeholder="Enter your first name..."
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="text-sm">Last Name</label>
                <Input
                  name="lastName"
                  placeholder="Enter your last name..."
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div>
              <label className="text-sm">Username</label>
              <Input
                name="username"
                placeholder="Enter your username..."
                value={formData.username}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="text-sm">E-mail address</label>
              <Input
                type="email"
                name="email"
                placeholder="Enter your e-mail address..."
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-sm">Password</label>
                <Input
                  type="password"
                  name="password"
                  placeholder="********"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="text-sm">Confirm Password</label>
                <Input
                  type="password"
                  name="confirmPassword"
                  placeholder="********"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button type="submit" className="w-full">Register</Button>
            <p className="text-sm text-muted-foreground">
              Do you have an account?{" "}
              <Link href="/login" className="underline">Login</Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
