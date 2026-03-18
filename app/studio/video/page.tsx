"use client"

import type React from "react"

import { useState, useRef } from "react"
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
  Scissors,
  Layers,
  Film,
  Text,
  ImageIcon,
  Wand2,
  Sparkles,
  MessageSquare,
  Loader2,
} from "lucide-react"

export default function VideoStudioPage() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [aiPrompt, setAiPrompt] = useState("")
  const [aiResponse, setAiResponse] = useState("")
  const videoRef = useRef<HTMLVideoElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVideoFile(e.target.files[0])

      // Create object URL for preview
      const videoElement = videoRef.current
      if (videoElement) {
        videoElement.src = URL.createObjectURL(e.target.files[0])
      }
    }
  }

  const togglePlay = () => {
    const videoElement = videoRef.current
    if (!videoElement) return

    if (isPlaying) {
      videoElement.pause()
    } else {
      videoElement.play()
    }

    setIsPlaying(!isPlaying)
  }

  const handleAIProcess = () => {
    if (!aiPrompt.trim()) return

    setIsProcessing(true)

    // Simulate AI processing
    setTimeout(() => {
      setAiResponse(
        "I've analyzed your video and made the following adjustments: enhanced colors, stabilized shaky footage, and improved lighting. I've also generated captions based on the audio content and added them to the timeline.",
      )
      setIsProcessing(false)
    }, 2000)
  }

  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-black mb-6">VIDEO STUDIO</h2>

      <div className="grid lg:grid-cols-[1fr_350px] gap-6">
        <div className="space-y-6">
          {/* Video upload section */}
          <Card className="border-4 border-black rounded-xl p-4 sm:p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="text-xl font-bold mb-4">Video Source</h3>
            {videoFile ? (
              <div className="border-4 border-black rounded-xl overflow-hidden bg-black mb-4">
                <video ref={videoRef} className="w-full aspect-video" controls={false} />
              </div>
            ) : (
              <div className="border-4 border-dashed border-black rounded-xl p-4 sm:p-8 text-center mb-4 aspect-video flex flex-col items-center justify-center">
                <Film className="h-12 w-12 sm:h-16 sm:w-16 mb-4 opacity-50" />
                <p className="mb-4">Drop your video file here or</p>
                <Button
                  variant="outline"
                  className="border-2 border-black rounded-xl font-bold"
                  onClick={() => document.getElementById("video-upload")?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" /> Select Video
                </Button>
                <input id="video-upload" type="file" accept="video/*" className="hidden" onChange={handleFileChange} />
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Button variant="outline" className="border-2 border-black rounded-xl font-bold">
                <Film className="h-4 w-4 mr-2" /> Record
              </Button>
              <Button variant="outline" className="border-2 border-black rounded-xl font-bold">
                <Film className="h-4 w-4 mr-2" /> Stock Video
              </Button>
              <Button variant="outline" className="border-2 border-black rounded-xl font-bold">
                <Wand2 className="h-4 w-4 mr-2" /> Generate
              </Button>
              <Button variant="outline" className="border-2 border-black rounded-xl font-bold">
                <Sparkles className="h-4 w-4 mr-2" /> Enhance
              </Button>
            </div>
          </Card>

          {/* Timeline */}
          {videoFile && (
            <Card className="border-4 border-black rounded-xl p-4 sm:p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <h3 className="text-xl font-bold mb-4">Timeline</h3>
              <div className="bg-white/50 border-4 border-black rounded-xl p-4">
                <div className="bg-white border-2 border-black rounded-lg p-2 h-[80px] sm:h-[100px] mb-4">
                  {/* Timeline tracks would go here */}
                  <div className="flex h-full">
                    <div className="w-12 sm:w-16 h-full border-r-2 border-black flex flex-col justify-center items-center">
                      <Film className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="text-xs font-bold mt-1">Video</span>
                    </div>
                    <div className="flex-1 bg-gray-100 relative">
                      <div className="absolute top-0 left-[20%] bottom-0 w-[60%] bg-blue-200 border-2 border-blue-400 rounded-md flex items-center justify-center">
                        <span className="text-xs font-bold">Main Clip</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Playback controls */}
                <div className="flex items-center justify-center gap-2">
                  <Button variant="outline" className="border-2 border-black rounded-xl h-10 w-10 p-0">
                    <SkipBack className="h-4 w-4" />
                  </Button>
                  <Button
                    className="bg-black hover:bg-black/80 text-white rounded-xl border-2 border-black h-12 w-12 p-0"
                    onClick={togglePlay}
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
                  <Label className="font-bold mb-2 block">Playback Speed</Label>
                  <div className="flex items-center gap-2">
                    <Slider defaultValue={[100]} max={200} step={10} className="flex-1" />
                    <span className="w-12 text-right">100%</span>
                  </div>
                </div>

                <div>
                  <Label className="font-bold mb-2 block">Volume</Label>
                  <div className="flex items-center gap-2">
                    <Slider defaultValue={[80]} max={100} step={1} className="flex-1" />
                    <span className="w-8 text-right">80%</span>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* AI Video Processing */}
          <Card className="border-4 border-black rounded-xl p-4 sm:p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5" />
              <h3 className="text-xl font-bold">AI Video Assistant</h3>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="font-bold mb-2 block">What would you like to do with your video?</Label>
                <Textarea
                  placeholder="E.g., Enhance colors, stabilize footage, generate captions, create a highlight reel..."
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
            <div className="bg-gradient-to-br from-blue-500 to-purple-500 p-4 text-white">
              <h3 className="text-xl font-bold">Video Controls</h3>
            </div>
            <div className="p-4 bg-white">
              <Tabs defaultValue="edit">
                <TabsList className="bg-white/50 border-2 border-black rounded-xl p-1 mb-4 w-full">
                  <TabsTrigger
                    value="edit"
                    className="rounded-lg data-[state=active]:bg-black data-[state=active]:text-white font-bold"
                  >
                    Edit
                  </TabsTrigger>
                  <TabsTrigger
                    value="effects"
                    className="rounded-lg data-[state=active]:bg-black data-[state=active]:text-white font-bold"
                  >
                    Effects
                  </TabsTrigger>
                  <TabsTrigger
                    value="text"
                    className="rounded-lg data-[state=active]:bg-black data-[state=active]:text-white font-bold"
                  >
                    Text
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="edit" className="space-y-4">
                  <Button variant="outline" className="w-full border-2 border-black rounded-xl font-bold flex gap-2">
                    <Scissors className="h-4 w-4" /> Split Clip
                  </Button>

                  <Button variant="outline" className="w-full border-2 border-black rounded-xl font-bold flex gap-2">
                    <Layers className="h-4 w-4" /> Add Layer
                  </Button>

                  <div>
                    <Label className="font-bold mb-2 block">Crop</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" className="border-2 border-black rounded-xl font-bold">
                        16:9
                      </Button>
                      <Button variant="outline" className="border-2 border-black rounded-xl font-bold">
                        1:1
                      </Button>
                      <Button variant="outline" className="border-2 border-black rounded-xl font-bold">
                        4:5
                      </Button>
                      <Button variant="outline" className="border-2 border-black rounded-xl font-bold">
                        9:16
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="effects" className="space-y-4">
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

                  <div className="flex items-center justify-between">
                    <Label className="font-bold">Stabilization</Label>
                    <Switch defaultChecked />
                  </div>
                </TabsContent>

                <TabsContent value="text" className="space-y-4">
                  <Button variant="outline" className="w-full border-2 border-black rounded-xl font-bold flex gap-2">
                    <Text className="h-4 w-4" /> Add Title
                  </Button>

                  <Button variant="outline" className="w-full border-2 border-black rounded-xl font-bold flex gap-2">
                    <Text className="h-4 w-4" /> Add Caption
                  </Button>

                  <Button variant="outline" className="w-full border-2 border-black rounded-xl font-bold flex gap-2">
                    <ImageIcon className="h-4 w-4" /> Add Sticker
                  </Button>

                  <div>
                    <Label className="font-bold mb-2 block">Auto-Generate Captions</Label>
                    <Select defaultValue="english">
                      <SelectTrigger className="border-2 border-black rounded-xl">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="english">English</SelectItem>
                        <SelectItem value="spanish">Spanish</SelectItem>
                        <SelectItem value="french">French</SelectItem>
                        <SelectItem value="german">German</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </Card>

          <Card className="border-4 border-black rounded-xl overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="bg-gradient-to-br from-blue-500 to-purple-500 p-4 text-white">
              <h3 className="text-xl font-bold">Export Options</h3>
            </div>
            <div className="p-4 bg-white space-y-4">
              <div>
                <Label className="font-bold mb-2 block">File Format</Label>
                <Select defaultValue="mp4">
                  <SelectTrigger className="border-2 border-black rounded-xl">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mp4">MP4</SelectItem>
                    <SelectItem value="mov">MOV</SelectItem>
                    <SelectItem value="webm">WebM</SelectItem>
                    <SelectItem value="gif">GIF</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="font-bold mb-2 block">Resolution</Label>
                <Select defaultValue="1080p">
                  <SelectTrigger className="border-2 border-black rounded-xl">
                    <SelectValue placeholder="Select resolution" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="720p">720p</SelectItem>
                    <SelectItem value="1080p">1080p (Full HD)</SelectItem>
                    <SelectItem value="2k">2K</SelectItem>
                    <SelectItem value="4k">4K</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-2 space-y-3">
                <Button className="w-full bg-black hover:bg-black/80 text-white rounded-xl border-2 border-black font-bold">
                  <Save className="h-4 w-4 mr-2" /> Save Project
                </Button>
                <Button variant="outline" className="w-full border-2 border-black rounded-xl font-bold">
                  <Download className="h-4 w-4 mr-2" /> Export Video
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

