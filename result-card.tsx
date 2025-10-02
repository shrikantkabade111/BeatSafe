"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

type PredictionResult = {
  condition: "Heart Attack" | "Heart Failure" | "Cardiac Arrest" | null
  confidence: number
  recommendation: string
  riskLevel: "low" | "medium" | "high"
}

interface ResultCardProps {
  result: PredictionResult
}

export function ResultCard({ result }: ResultCardProps) {
  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "low":
        return "bg-green-50 border-green-200 text-green-700 dark:bg-green-950/30 dark:border-green-900 dark:text-green-400"
      case "medium":
        return "bg-yellow-50 border-yellow-200 text-yellow-700 dark:bg-yellow-950/30 dark:border-yellow-900 dark:text-yellow-400"
      case "high":
        return "bg-red-50 border-red-200 text-red-700 dark:bg-red-950/30 dark:border-red-900 dark:text-red-400"
      default:
        return "bg-gray-50 border-gray-200 text-gray-700 dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-400"
    }
  }

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case "low":
        return <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />
      case "medium":
        return <AlertCircle className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />
      case "high":
        return <XCircle className="h-5 w-5 text-red-500 dark:text-red-400" />
      default:
        return null
    }
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <Card className="border border-border bg-card shadow-lg dark:shadow-primary/5 transition-all duration-300 h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl text-foreground">Diagnostic Results</CardTitle>
        <CardDescription className="text-muted-foreground">
          AI-powered analysis of patient cardiac health
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
          <motion.div
            variants={item}
            className={cn("p-4 rounded-lg border transition-colors duration-300", getRiskColor(result.riskLevel))}
          >
            <div className="flex items-center gap-2 mb-2">
              {getRiskIcon(result.riskLevel)}
              <h3 className="text-lg font-semibold">{result.condition}</h3>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm">Confidence:</span>
              <div className="w-full bg-background/50 rounded-full h-2.5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${result.confidence}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={cn(
                    "h-2.5 rounded-full",
                    result.riskLevel === "low"
                      ? "bg-green-500 dark:bg-green-400"
                      : result.riskLevel === "medium"
                        ? "bg-yellow-500 dark:bg-yellow-400"
                        : "bg-red-500 dark:bg-red-400",
                  )}
                ></motion.div>
              </div>
              <span className="text-sm font-medium">{result.confidence}%</span>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Risk Level:</h4>
              <div className="flex gap-2">
                <span
                  className={cn(
                    "px-2.5 py-0.5 rounded-full text-xs font-medium",
                    result.riskLevel === "low"
                      ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
                      : result.riskLevel === "medium"
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300"
                        : "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300",
                  )}
                >
                  {result.riskLevel.charAt(0).toUpperCase() + result.riskLevel.slice(1)} Risk
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div variants={item}>
            <h3 className="text-lg font-semibold mb-2">AI Recommendation</h3>
            <p className="text-muted-foreground">{result.recommendation}</p>
          </motion.div>

          <motion.div variants={item} className="border-t border-border pt-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Next Steps</h3>
            <ul className="space-y-2">
              <motion.li
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-start gap-2"
              >
                <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs mt-0.5">
                  1
                </div>
                <span className="text-sm text-foreground">Review diagnostic results with patient</span>
              </motion.li>
              <motion.li
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-start gap-2"
              >
                <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs mt-0.5">
                  2
                </div>
                <span className="text-sm text-foreground">Schedule follow-up tests as recommended</span>
              </motion.li>
              <motion.li
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="flex items-start gap-2"
              >
                <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs mt-0.5">
                  3
                </div>
                <span className="text-sm text-foreground">Document findings in patient record</span>
              </motion.li>
            </ul>
          </motion.div>
        </motion.div>
      </CardContent>
    </Card>
  )
}
