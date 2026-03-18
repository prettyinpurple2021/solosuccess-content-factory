"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Upload,
  Save,
  Download,
  Crop,
  Move,
  Layers,
  ImageIcon,
  Paintbrush,
  Eraser,
  RotateCcw,
  Wand2,
  Sparkles,
  MessageSquare,
  Loader2,
} from "lucide-react"

export default function ImageStudioPage() {
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [aiPrompt, setAiPrompt] = useState("")
  const [aiResponse, setAiResponse] = useState("")
  const [activeFilter, setActiveFilter] = useState("none")
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImageFile(file)

      // Create preview URL
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          setImagePreview(e.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  // Apply filter effect to canvas when filter changes
  useEffect(() => {
    if (!imagePreview || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      // Set canvas dimensions to match image
      canvas.width = img.width
      canvas.height = img.height

      // Draw original image
      ctx.drawImage(img, 0, 0)

      // Apply filter based on selection
      switch (activeFilter) {
        case "grayscale":
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const data = imageData.data
          for (let i = 0; i < data.length; i += 4) {
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3
            data[i] = avg // red
            data[i + 1] = avg // green
            data[i + 2] = avg // blue
          }
          ctx.putImageData(imageData, 0, 0)
          break

        case "sepia":
          const sepiaData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const sepiaPixels = sepiaData.data
          for (let i = 0; i < sepiaPixels.length; i += 4) {
            const r = sepiaPixels[i]
            const g = sepiaPixels[i + 1]
            const b = sepiaPixels[i + 2]

            sepiaPixels[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189)
            sepiaPixels[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168)
            sepiaPixels[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131)
          }
          ctx.putImageData(sepiaData, 0, 0)
          break

        case "invert":
          const invertData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const invertPixels = invertData.data
          for (let i = 0; i < invertPixels.length; i += 4) {
            invertPixels[i] = 255 - invertPixels[i] // red
            invertPixels[i + 1] = 255 - invertPixels[i + 1] // green
            invertPixels[i + 2] = 255 - invertPixels[i + 2] // blue
          }
          ctx.putImageData(invertData, 0, 0)
          break

        case "none":
        default:
          // No filter, already drawn original image
          break
      }
    }
    img.src = imagePreview
  }, [imagePreview, activeFilter])

  const handleAIProcess = () => {
    if (!aiPrompt.trim()) return

    setIsProcessing(true)

    // Simulate AI processing
    setTimeout(() => {
      setAiResponse(
        "I've analyzed your image and made the following adjustments: enhanced colors, removed background distractions, and improved overall clarity. I've also applied a subtle vignette effect to draw focus to the main subject.",
      )
      setIsProcessing(false)
    }, 2000)
  }

  const handleAIGenerate = () => {
    if (!aiPrompt.trim()) return

    setIsProcessing(true)

    // Simulate AI processing
    setTimeout(() => {
      setAiResponse(
        "I've generated a new image based on your prompt. The image features the elements you described with a cohesive style and composition. You can now edit this image further using the tools in the Image Studio.",
      )
      setIsProcessing(false)

      // Here we would normally set the generated image, but for this demo we'll just use a placeholder
      // In a real implementation, this would be the result from an image generation API
    }, 2000)
  }

  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-black mb-6">IMAGE STUDIO</h2>

      <div className="grid lg:grid-cols-[1fr_350px] gap-6">
        <div className="space-y-6">
          {/* Image upload/generation section */}
          <Card className="border-4 border-black rounded-xl p-4 sm:p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <Tabs defaultValue="upload">
              <TabsList className="bg-white/50 border-2 border-black rounded-xl p-1 mb-4 w-full">
                <TabsTrigger
                  value="upload"
                  className="rounded-lg data-[state=active]:bg-black data-[state=active]:text-white font-bold"
                >
                  Upload
                </TabsTrigger>
                <TabsTrigger
                  value="generate"
                  className="rounded-lg data-[state=active]:bg-black data-[state=active]:text-white font-bold"
                >
                  Generate
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upload">
                <h3 className="text-xl font-bold mb-4">Image Source</h3>
                {imagePreview ? (
                  <div className="border-4 border-black rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center mb-4">
                    <canvas ref={canvasRef} className="max-w-full max-h-[300px] sm:max-h-[400px] object-contain" />
                  </div>
                ) : (
                  <div className="border-4 border-dashed border-black rounded-xl p-4 sm:p-8 text-center mb-4 aspect-video flex flex-col items-center justify-center">
                    <ImageIcon className="h-12 w-12 sm:h-16 sm:w-16 mb-4 opacity-50" />
                    <p className="mb-4">Drop your image here or</p>
                    <Button
                      variant="outline"
                      className="border-2 border-black rounded-xl font-bold"
                      onClick={() => document.getElementById("image-upload")?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" /> Select Image
                    </Button>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <Button variant="outline" className="border-2 border-black rounded-xl font-bold">
                    <ImageIcon className="h-4 w-4 mr-2" /> Stock Images
                  </Button>
                  <Button variant="outline" className="border-2 border-black rounded-xl font-bold">
                    <Crop className="h-4 w-4 mr-2" /> Crop
                  </Button>
                  <Button variant="outline" className="border-2 border-black rounded-xl font-bold">
                    <RotateCcw className="h-4 w-4 mr-2" /> Rotate
                  </Button>
                  <Button variant="outline" className="border-2 border-black rounded-xl font-bold">
                    <Sparkles className="h-4 w-4 mr-2" /> Enhance
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="generate">
                <h3 className="text-xl font-bold mb-4">AI Image Generation</h3>
                <div className="space-y-4">
                  <div>
                    <Label className="font-bold mb-2 block">Describe the image you want to create</Label>
                    <Textarea
                      placeholder="E.g., A serene mountain landscape at sunset with a lake reflecting the colorful sky..."
                      className="min-h-[100px] border-2 border-black rounded-xl"
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="font-bold mb-2 block">Style</Label>
                      <Select defaultValue="realistic">
                        <SelectTrigger className="border-2 border-black rounded-xl">
                          <SelectValue placeholder="Select style" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="realistic">Realistic</SelectItem>
                          <SelectItem value="cartoon">Cartoon</SelectItem>
                          <SelectItem value="abstract">Abstract</SelectItem>
                          <SelectItem value="digital-art">Digital Art</SelectItem>
                          <SelectItem value="oil-painting">Oil Painting</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="font-bold mb-2 block">Aspect Ratio</Label>
                      <Select defaultValue="square">
                        <SelectTrigger className="border-2 border-black rounded-xl">
                          <SelectValue placeholder="Select ratio" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="square">1:1 (Square)</SelectItem>
                          <SelectItem value="portrait">4:5 (Portrait)</SelectItem>
                          <SelectItem value="landscape">16:9 (Landscape)</SelectItem>
                          <SelectItem value="wide">21:9 (Widescreen)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      className="bg-black hover:bg-black/80 text-white rounded-xl border-2 border-black font-bold"
                      onClick={handleAIGenerate}
                      disabled={isProcessing || !aiPrompt.trim()}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...
                        </>
                      ) : (
                        <>
                          <Wand2 className="h-4 w-4 mr-2" /> Generate Image
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </Card>

          {/* Quick tools */}
          {imagePreview && (
            <Card className="border-4 border-black rounded-xl p-4 sm:p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <h3 className="text-xl font-bold mb-4">Quick Tools</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Button variant="outline" className="border-2 border-black rounded-xl font-bold">
                  <Crop className="h-4 w-4 mr-2" /> Crop
                </Button>
                <Button variant="outline" className="border-2 border-black rounded-xl font-bold">
                  <RotateCcw className="h-4 w-4 mr-2" /> Rotate
                </Button>
                <Button variant="outline" className="border-2 border-black rounded-xl font-bold">
                  <Paintbrush className="h-4 w-4 mr-2" /> Draw
                </Button>
                <Button variant="outline" className="border-2 border-black rounded-xl font-bold">
                  <Eraser className="h-4 w-4 mr-2" /> Erase
                </Button>
                <Button variant="outline" className="border-2 border-black rounded-xl font-bold">
                  <Layers className="h-4 w-4 mr-2" /> Layers
                </Button>
                <Button variant="outline" className="border-2 border-black rounded-xl font-bold">
                  <Move className="h-4 w-4 mr-2" /> Move
                </Button>
                <Button variant="outline" className="border-2 border-black rounded-xl font-bold">
                  <ImageIcon className="h-4 w-4 mr-2" /> Filters
                </Button>
                <Button variant="outline" className="border-2 border-black rounded-xl font-bold">
                  <Sparkles className="h-4 w-4 mr-2" /> Enhance
                </Button>
              </div>
            </Card>
          )}

          {/* AI Image Processing */}
          <Card className="border-4 border-black rounded-xl p-4 sm:p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5" />
              <h3 className="text-xl font-bold">AI Image Assistant</h3>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="font-bold mb-2 block">What would you like to do with your image?</Label>
                <Textarea
                  placeholder="E.g., Remove the background, enhance colors, make it look more professional..."
                  className="min-h-[80px] border-2 border-black rounded-xl"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                />
              </div>

              <div className="flex justify-end">
                <Button
                  className="bg-black hover:bg-black/80 text-white rounded-xl border-2 border-black font-bold"
                  onClick={handleAIProcess}
                  disabled={isProcessing || !aiPrompt.trim()}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" /> Process with AI
                    </>
                  )}
                </Button>
              </div>

              {aiResponse && (
                <div className="mt-4 p-4 bg-white/50 border-2 border-black rounded-xl">
                  <div className="flex items-start gap-3">
                    <MessageSquare className="h-5 w-5 mt-0.5" />
                    <div>
                      <p className="font-bold mb-1">AI Assistant</p>
                      <p>{aiResponse}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Controls panel */}
        <div className="space-y-6">
          <Card className="border-4 border-black rounded-xl overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="bg-gradient-to-br from-green-500 to-teal-500 p-4 text-white">
              <h3 className="text-xl font-bold">Image Controls</h3>
            </div>
            <div className="p-4 bg-white">
              <Tabs defaultValue="adjust">
                <TabsList className="bg-white/50 border-2 border-black rounded-xl p-1 mb-4 w-full">
                  <TabsTrigger
                    value="adjust"
                    className="rounded-lg data-[state=active]:bg-black data-[state=active]:text-white font-bold"
                  >
                    Adjust
                  </TabsTrigger>
                  <TabsTrigger
                    value="filters"
                    className="rounded-lg data-[state=active]:bg-black data-[state=active]:text-white font-bold"
                  >
                    Filters
                  </TabsTrigger>
                  <TabsTrigger
                    value="resize"
                    className="rounded-lg data-[state=active]:bg-black data-[state=active]:text-white font-bold"
                  >
                    Resize
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="adjust" className="space-y-4">
                  <div>
                    <Label className="font-bold mb-2 block">Brightness</Label>
                    <Slider defaultValue={[50]} max={100} step={1} className="py-4" />
                  </div>

                  <div>
                    <Label className="font-bold mb-2 block">Contrast</Label>
                    <Slider defaultValue={[50]} max={100} step={1} className="py-4" />
                  </div>

                  <div>
                    <Label className="font-bold mb-2 block">Saturation</Label>
                    <Slider defaultValue={[50]} max={100} step={1} className="py-4" />
                  </div>

                  <div>
                    <Label className="font-bold mb-2 block">Sharpness</Label>
                    <Slider defaultValue={[30]} max={100} step={1} className="py-4" />
                  </div>
                </TabsContent>

                <TabsContent value="filters" className="space-y-4">
                  <div>
                    <Label className="font-bold mb-2 block">Filter</Label>
                    <Select value={activeFilter} onValueChange={setActiveFilter}>
                      <SelectTrigger className="border-2 border-black rounded-xl">
                        <SelectValue placeholder="Select a filter" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="grayscale">Grayscale</SelectItem>
                        <SelectItem value="sepia">Sepia</SelectItem>
                        <SelectItem value="invert">Invert</SelectItem>
                        <SelectItem value="vintage">Vintage</SelectItem>
                        <SelectItem value="hdr">HDR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="font-bold mb-2 block">Intensity</Label>
                    <Slider defaultValue={[100]} max={100} step={1} className="py-4" />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="font-bold">Vignette</Label>
                    <Switch />
                  </div>
                </TabsContent>

                <TabsContent value="resize" className="space-y-4">
                  <div>
                    <Label className="font-bold mb-2 block">Width</Label>
                    <div className="flex items-center gap-2">
                      <Slider defaultValue={[100]} max={200} step={1} className="flex-1 py-4" />
                      <span className="min-w-[40px] text-right">100%</span>
                    </div>
                  </div>

                  <div>
                    <Label className="font-bold mb-2 block">Height</Label>
                    <div className="flex items-center gap-2">
                      <Slider defaultValue={[100]} max={200} step={1} className="flex-1 py-4" />
                      <span className="min-w-[40px] text-right">100%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="font-bold">Lock Aspect Ratio</Label>
                    <Switch defaultChecked />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </Card>

          <Card className="border-4 border-black rounded-xl overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="bg-gradient-to-br from-green-500 to-teal-500 p-4 text-white">
              <h3 className="text-xl font-bold">Export Options</h3>
            </div>
            <div className="p-4 bg-white space-y-4">
              <div>
                <Label className="font-bold mb-2 block">File Format</Label>
                <Select defaultValue="png">
                  <SelectTrigger className="border-2 border-black rounded-xl">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="png">PNG</SelectItem>
                    <SelectItem value="jpg">JPG</SelectItem>
                    <SelectItem value="webp">WebP</SelectItem>
                    <SelectItem value="svg">SVG</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="font-bold mb-2 block">Quality</Label>
                <Select defaultValue="high">
                  <SelectTrigger className="border-2 border-black rounded-xl">
                    <SelectValue placeholder="Select quality" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="max">Maximum</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-2 space-y-3">
                <Button className="w-full bg-black hover:bg-black/80 text-white rounded-xl border-2 border-black font-bold">
                  <Save className="h-4 w-4 mr-2" /> Save Project
                </Button>
                <Button variant="outline" className="w-full border-2 border-black rounded-xl font-bold">
                  <Download className="h-4 w-4 mr-2" /> Export Image
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

