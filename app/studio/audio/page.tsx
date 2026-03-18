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
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Upload,
  Save,
  Download,
  Mic,
  Music,
  Volume2,
  VolumeX,
  Wand2,
  Sparkles,
  MessageSquare,
  Loader2,
} from "lucide-react"

export default function AudioStudioPage() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(75)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [aiPrompt, setAiPrompt] = useState("")
  const [aiResponse, setAiResponse] = useState("")
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Simulate waveform visualization
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    ctx.clearRect(0, 0, width, height)
    ctx.fillStyle = "#000"

    // Draw a simulated waveform
    const barWidth = 3
    const gap = 2
    const bars = Math.floor(width / (barWidth + gap))

    for (let i = 0; i < bars; i++) {
      // Generate random heights for the waveform visualization
      const barHeight = Math.random() * (height * 0.8) + height * 0.1
      ctx.fillRect(i * (barWidth + gap), (height - barHeight) / 2, barWidth, barHeight)
    }
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAudioFile(e.target.files[0])
    }
  }

  const handleAIProcess = () => {
    if (!aiPrompt.trim()) return

    setIsProcessing(true)

    // Simulate AI processing
    setTimeout(() => {
      setAiResponse(
        "I've analyzed your audio and made the following adjustments: enhanced bass frequencies, reduced background noise, and improved vocal clarity. The processed audio has a more balanced EQ profile and sounds more professional.",
      )
      setIsProcessing(false)
    }, 2000)
  }

  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-black mb-6">AUDIO STUDIO</h2>

      <div className="grid lg:grid-cols-[1fr_350px] gap-6">
        <div className="space-y-6">
          {/* Audio upload section */}
          <Card className="border-4 border-black rounded-xl p-4 sm:p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="text-xl font-bold mb-4">Audio Source</h3>
            <div className="border-4 border-dashed border-black rounded-xl p-4 sm:p-8 text-center mb-4">
              {audioFile ? (
                <div>
                  <Music className="mx-auto h-8 w-8 sm:h-10 sm:w-10 mb-2" />
                  <p className="font-bold">{audioFile.name}</p>
                  <p className="text-sm text-gray-500">{(audioFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
              ) : (
                <>
                  <Music className="mx-auto h-8 w-8 sm:h-10 sm:w-10 mb-2 opacity-50" />
                  <p className="mb-2">Drop your audio file here or</p>
                  <Button
                    variant="outline"
                    className="border-2 border-black rounded-xl font-bold"
                    onClick={() => document.getElementById("audio-upload")?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" /> Select File
                  </Button>
                  <input
                    id="audio-upload"
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Button variant="outline" className="border-2 border-black rounded-xl font-bold">
                <Mic className="h-4 w-4 mr-2" /> Record
              </Button>
              <Button variant="outline" className="border-2 border-black rounded-xl font-bold">
                <Music className="h-4 w-4 mr-2" /> Stock Audio
              </Button>
              <Button variant="outline" className="border-2 border-black rounded-xl font-bold">
                <Wand2 className="h-4 w-4 mr-2" /> Generate
              </Button>
              <Button variant="outline" className="border-2 border-black rounded-xl font-bold">
                <Sparkles className="h-4 w-4 mr-2" /> Enhance
              </Button>
            </div>
          </Card>

          {/* Waveform visualization */}
          <Card className="border-4 border-black rounded-xl p-4 sm:p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="text-xl font-bold mb-4">Audio Editor</h3>
            <div className="bg-white/50 border-4 border-black rounded-xl p-4">
              <div className="bg-white border-2 border-black rounded-lg p-2">
                <canvas ref={canvasRef} width={800} height={150} className="w-full h-[100px] sm:h-[150px]" />
              </div>

              {/* Playback controls */}
              <div className="flex items-center justify-center gap-2 mt-4">
                <Button variant="outline" className="border-2 border-black rounded-xl h-10 w-10 p-0">
                  <SkipBack className="h-4 w-4" />
                </Button>
                <Button
                  className="bg-black hover:bg-black/80 text-white rounded-xl border-2 border-black h-12 w-12 p-0"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </Button>
                <Button variant="outline" className="border-2 border-black rounded-xl h-10 w-10 p-0">
                  <SkipForward className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="font-bold mb-2 block">Volume</Label>
                <div className="flex items-center gap-2">
                  {volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  <Slider
                    value={[volume]}
                    max={100}
                    step={1}
                    className="flex-1"
                    onValueChange={(value) => setVolume(value[0])}
                  />
                  <span className="w-8 text-right">{volume}%</span>
                </div>
              </div>

              <div>
                <Label className="font-bold mb-2 block">Playback Speed</Label>
                <div className="flex items-center gap-2">
                  <Slider defaultValue={[100]} max={200} step={10} className="flex-1" />
                  <span className="w-12 text-right">100%</span>
                </div>
              </div>
            </div>
          </Card>

          {/* AI Audio Processing */}
          <Card className="border-4 border-black rounded-xl p-4 sm:p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5" />
              <h3 className="text-xl font-bold">AI Audio Assistant</h3>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="font-bold mb-2 block">What would you like to do with your audio?</Label>
                <Textarea
                  placeholder="E.g., Remove background noise, enhance vocals, add reverb, make it sound more professional..."
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
            <div className="bg-gradient-to-br from-pink-500 to-orange-500 p-4 text-white">
              <h3 className="text-xl font-bold">Audio Controls</h3>
            </div>
            <div className="p-4 bg-white">
              <Tabs defaultValue="mixer">
                <TabsList className="bg-white/50 border-2 border-black rounded-xl p-1 mb-4 w-full">
                  <TabsTrigger
                    value="mixer"
                    className="rounded-lg data-[state=active]:bg-black data-[state=active]:text-white font-bold"
                  >
                    Mixer
                  </TabsTrigger>
                  <TabsTrigger
                    value="effects"
                    className="rounded-lg data-[state=active]:bg-black data-[state=active]:text-white font-bold"
                  >
                    Effects
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="mixer" className="space-y-4">
                  <div>
                    <Label className="font-bold mb-2 block">Bass</Label>
                    <Slider defaultValue={[50]} max={100} step={1} className="py-4" />
                  </div>

                  <div>
                    <Label className="font-bold mb-2 block">Mid</Label>
                    <Slider defaultValue={[50]} max={100} step={1} className="py-4" />
                  </div>

                  <div>
                    <Label className="font-bold mb-2 block">Treble</Label>
                    <Slider defaultValue={[50]} max={100} step={1} className="py-4" />
                  </div>

                  <div>
                    <Label className="font-bold mb-2 block">Gain</Label>
                    <Slider defaultValue={[50]} max={100} step={1} className="py-4" />
                  </div>
                </TabsContent>

                <TabsContent value="effects" className="space-y-4">
                  <div>
                    <Label className="font-bold mb-2 block">Reverb</Label>
                    <Slider defaultValue={[20]} max={100} step={1} className="py-4" />
                  </div>

                  <div>
                    <Label className="font-bold mb-2 block">Delay</Label>
                    <Slider defaultValue={[10]} max={100} step={1} className="py-4" />
                  </div>

                  <div>
                    <Label className="font-bold mb-2 block">Compression</Label>
                    <Slider defaultValue={[30]} max={100} step={1} className="py-4" />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="font-bold">Noise Reduction</Label>
                    <Switch defaultChecked />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </Card>

          <Card className="border-4 border-black rounded-xl overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="bg-gradient-to-br from-pink-500 to-orange-500 p-4 text-white">
              <h3 className="text-xl font-bold">Export Options</h3>
            </div>
            <div className="p-4 bg-white space-y-4">
              <div>
                <Label className="font-bold mb-2 block">File Format</Label>
                <Select defaultValue="mp3">
                  <SelectTrigger className="border-2 border-black rounded-xl">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mp3">MP3</SelectItem>
                    <SelectItem value="wav">WAV</SelectItem>
                    <SelectItem value="aac">AAC</SelectItem>
                    <SelectItem value="flac">FLAC</SelectItem>
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
                    <SelectItem value="low">Low (128kbps)</SelectItem>
                    <SelectItem value="medium">Medium (256kbps)</SelectItem>
                    <SelectItem value="high">High (320kbps)</SelectItem>
                    <SelectItem value="lossless">Lossless</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-2 space-y-3">
                <Button className="w-full bg-black hover:bg-black/80 text-white rounded-xl border-2 border-black font-bold">
                  <Save className="h-4 w-4 mr-2" /> Save Project
                </Button>
                <Button variant="outline" className="w-full border-2 border-black rounded-xl font-bold">
                  <Download className="h-4 w-4 mr-2" /> Export Audio
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

