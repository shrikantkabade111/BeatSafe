"use client"

import { cn } from "@/lib/utils"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Loader2, Upload } from "lucide-react"
import { motion } from "framer-motion"

interface PatientFormProps {
  onSubmit: (formData: FormData) => Promise<void>
  isLoading: boolean
}

export function PatientForm({ onSubmit, isLoading }: PatientFormProps) {
  const [shortness, setShortness] = useState(false)
  const [fatigue, setFatigue] = useState([3])
  const [systolic, setSystolic] = useState("")
  const [diastolic, setDiastolic] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)

    // Add the values that aren't directly in form elements
    formData.append("shortnessOfBreath", shortness ? "yes" : "no")
    formData.append("fatigue", fatigue[0].toString())
    formData.append("systolic", systolic)
    formData.append("diastolic", diastolic)

    if (selectedFile) {
      formData.append("ecgFile", selectedFile)
    }

    await onSubmit(formData)
  }

  const formFields = [
    {
      id: "personal",
      title: "Personal Information",
      fields: [
        {
          id: "age",
          label: "Age",
          type: "number",
          placeholder: "Enter age",
          required: true,
          half: true,
        },
        {
          id: "gender",
          label: "Gender",
          type: "select",
          options: [
            { value: "male", label: "Male" },
            { value: "female", label: "Female" },
            { value: "other", label: "Other" },
          ],
          half: true,
        },
      ],
    },
    {
      id: "symptoms",
      title: "Symptoms",
      fields: [
        {
          id: "chestPain",
          label: "Chest Pain",
          type: "select",
          options: [
            { value: "none", label: "None" },
            { value: "mild", label: "Mild" },
            { value: "severe", label: "Severe" },
          ],
        },
        {
          id: "shortnessOfBreath",
          label: "Shortness of Breath",
          type: "switch",
          value: shortness,
          onChange: setShortness,
        },
        {
          id: "fatigue",
          label: "Fatigue (Scale 1-5)",
          type: "slider",
          value: fatigue,
          onChange: setFatigue,
          min: 1,
          max: 5,
          step: 1,
        },
      ],
    },
    {
      id: "vitals",
      title: "Vital Signs",
      fields: [
        {
          id: "heartRate",
          label: "Heart Rate (bpm)",
          type: "number",
          placeholder: "Enter heart rate",
          required: true,
        },
        {
          id: "bloodPressure",
          label: "Blood Pressure (mmHg)",
          type: "bloodPressure",
          systolic: systolic,
          diastolic: diastolic,
          onChangeSystolic: setSystolic,
          onChangeDiastolic: setDiastolic,
        },
        {
          id: "oxygenSaturation",
          label: "Oxygen Saturation (SpO2%)",
          type: "number",
          placeholder: "Enter SpO2 percentage",
          min: "0",
          max: "100",
          required: true,
        },
      ],
    },
    {
      id: "ecg",
      title: "ECG Data",
      fields: [
        {
          id: "ecgFile",
          label: "Upload ECG File",
          type: "file",
          onChange: handleFileChange,
          selectedFile: selectedFile,
        },
      ],
    },
  ]

  return (
    <Card className="border border-border bg-card shadow-lg dark:shadow-primary/5 transition-all duration-300">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl text-foreground">Patient Information</CardTitle>
        <CardDescription className="text-muted-foreground">
          Enter patient symptoms and vitals for cardiac analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="patient-form" onSubmit={handleSubmit} className="space-y-6">
          {formFields.map((section, sectionIndex) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: sectionIndex * 0.1, duration: 0.5 }}
              className="space-y-4"
            >
              <h3 className="text-sm font-medium text-muted-foreground">{section.title}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {section.fields.map((field, fieldIndex) => (
                  <div
                    key={field.id}
                    className={cn(
                      "space-y-2",
                      field.half ? "" : "md:col-span-2",
                      field.type === "switch" ? "flex items-center justify-between space-y-0" : "",
                    )}
                  >
                    {field.type !== "switch" && <Label htmlFor={field.id}>{field.label}</Label>}

                    {field.type === "number" && (
                      <Input
                        id={field.id}
                        name={field.id}
                        type="number"
                        placeholder={field.placeholder}
                        min={field.min}
                        max={field.max}
                        required={field.required}
                        className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                      />
                    )}

                    {field.type === "select" && (
                      <Select name={field.id} defaultValue="">
                        <SelectTrigger
                          id={field.id}
                          className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                        >
                          <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options?.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}

                    {field.type === "switch" && (
                      <>
                        <Label htmlFor={field.id}>{field.label}</Label>
                        <Switch
                          id={field.id}
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="data-[state=checked]:bg-primary"
                        />
                      </>
                    )}

                    {field.type === "slider" && (
                      <>
                        <div className="flex justify-between">
                          <Label htmlFor={field.id}>{field.label}</Label>
                          <span className="text-sm text-muted-foreground">{field.value?.[0]}</span>
                        </div>
                        <Slider
                          id={field.id}
                          min={field.min}
                          max={field.max}
                          step={field.step}
                          value={field.value}
                          onValueChange={field.onChange}
                          className="py-2"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Mild</span>
                          <span>Moderate</span>
                          <span>Severe</span>
                        </div>
                      </>
                    )}

                    {field.type === "bloodPressure" && (
                      <>
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            id="systolic"
                            placeholder="Systolic"
                            type="number"
                            value={field.systolic}
                            onChange={(e) => field.onChangeSystolic(e.target.value)}
                            className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                            required
                          />
                          <Input
                            id="diastolic"
                            placeholder="Diastolic"
                            type="number"
                            value={field.diastolic}
                            onChange={(e) => field.onChangeDiastolic(e.target.value)}
                            className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                            required
                          />
                        </div>
                      </>
                    )}

                    {field.type === "file" && (
                      <>
                        <div className="flex items-center justify-center w-full">
                          <label
                            htmlFor={field.id}
                            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors duration-200"
                          >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                              <p className="mb-2 text-sm text-muted-foreground">
                                <span className="font-semibold">Click to upload</span> or drag and drop
                              </p>
                              <p className="text-xs text-muted-foreground">PDF, PNG, JPG, or CSV (MAX. 10MB)</p>
                            </div>
                            <Input
                              id={field.id}
                              type="file"
                              className="hidden"
                              accept=".pdf,.png,.jpg,.jpeg,.csv"
                              onChange={field.onChange}
                            />
                          </label>
                        </div>
                        {field.selectedFile && (
                          <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-sm text-muted-foreground mt-2"
                          >
                            Selected file: {field.selectedFile.name}
                          </motion.p>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </form>
      </CardContent>
      <CardFooter>
        <Button
          type="submit"
          form="patient-form"
          className="w-full bg-primary hover:bg-primary/90 transition-all duration-300"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-center"
            >
              Get Prediction
            </motion.span>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
