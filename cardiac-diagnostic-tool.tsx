"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { Sidebar } from "./sidebar"
import { PatientForm } from "./patient-form"
import { ResultCard } from "./result-card"
import { motion, AnimatePresence } from "framer-motion"
import { ThemeToggle } from "./theme-toggle"

type PredictionResult = {
  condition: "Heart Attack" | "Heart Failure" | "Cardiac Arrest" | null
  confidence: number
  recommendation: string
  riskLevel: "low" | "medium" | "high"
}

export function CardiacDiagnosticTool() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<PredictionResult | null>(null)
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Mock response - in a real app, this would come from the API
      const mockResult: PredictionResult = {
        condition: ["Heart Attack", "Heart Failure", "Cardiac Arrest"][
          Math.floor(Math.random() * 3)
        ] as PredictionResult["condition"],
        confidence: Math.round(Math.random() * 40 + 60),
        recommendation:
          "Based on the symptoms and vitals, recommend immediate consultation with a cardiologist. Consider additional tests including a comprehensive ECG analysis and cardiac enzyme tests.",
        riskLevel: ["low", "medium", "high"][Math.floor(Math.random() * 3)] as "low" | "medium" | "high",
      }

      setResult(mockResult)
      toast({
        title: "Analysis Complete",
        description: "Cardiac diagnostic prediction has been generated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate prediction. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!mounted) return null

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background transition-colors duration-300">
      <Sidebar />
      <div className="flex-1 p-4 md:p-8 md:ml-64">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                AI Cardiac Diagnostic Tool
              </span>
            </h1>
            <ThemeToggle />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <PatientForm onSubmit={handleSubmit} isLoading={isLoading} />
            </motion.div>

            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-full p-12 bg-card rounded-lg shadow-md dark:shadow-primary/5"
                >
                  <div className="relative">
                    <div className="h-24 w-24 rounded-full border-4 border-primary/30 border-t-primary animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="h-12 w-12 text-primary" viewBox="0 0 100 100">
                        <path
                          fill="currentColor"
                          d="M50,20 L50,80 M20,50 L80,50"
                          stroke="currentColor"
                          strokeWidth="8"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-center mt-6">
                    Analyzing patient data and generating prediction...
                  </p>
                </motion.div>
              ) : result ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <ResultCard result={result} />
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-full p-12 bg-card rounded-lg shadow-md dark:shadow-primary/5 text-center"
                >
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <svg
                      className="w-12 h-12 text-primary"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M3.5 12H6.5L9.5 3L15.5 21L18.5 12H21.5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <p className="text-foreground mb-2">No prediction results yet.</p>
                  <p className="text-muted-foreground text-sm">
                    Fill out the patient information form and click "Get Prediction" to analyze cardiac risk.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
