"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, Download, Wand2, Sparkles, MessageSquare, Loader2, Check, Copy, RotateCcw } from "lucide-react"
import { toast } from "sonner"

export default function TextStudioPage() {
  const [textContent, setTextContent] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [aiPrompt, setAiPrompt] = useState("")
  const [aiResponse, setAiResponse] = useState("")
  const [generationPrompt, setGenerationPrompt] = useState("")
  const [generatedText, setGeneratedText] = useState("")
  const [tone, setTone] = useState("professional")
  const [length, setLength] = useState("medium")
  const [textStats, setTextStats] = useState({
    words: 0,
    characters: 0,
    sentences: 0,
    readingTime: "0 min",
  })
  const [textHistory, setTextHistory] = useState<string[]>([])

  const updateTextStats = (text: string) => {
    const words = text.trim().split(/\s+/).filter(Boolean).length
    const characters = text.length
    const sentences = text.split(/[.!?]+/).filter(Boolean).length
    const readingTime = Math.ceil(words / 200)

    setTextStats({
      words,
      characters,
      sentences,
      readingTime: `${readingTime} min`,
    })
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value
    setTextContent(newText)
    updateTextStats(newText)
  }

  const handleUndo = () => {
    if (textHistory.length > 0) {
      const previous = textHistory[textHistory.length - 1]
      setTextHistory((prev) => prev.slice(0, -1))
      setTextContent(previous)
      updateTextStats(previous)
    }
  }

  const saveToHistory = useCallback((text: string) => {
    setTextHistory((prev) => [...prev.slice(-9), text])
  }, [])

  const handleAIProcess = useCallback(async () => {
    if (!aiPrompt.trim() || !textContent.trim()) return

    setIsProcessing(true)
    saveToHistory(textContent)

    try {
      const response = await fetch("/api/studio/text/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textContent, instruction: aiPrompt }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Processing failed")
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error("No response body")

      let improvedText = ""
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        const chunk = decoder.decode(value, { stream: true })
        // Parse the streaming response (AI SDK format)
        const lines = chunk.split("\n").filter(Boolean)
        for (const line of lines) {
          if (line.startsWith("0:")) {
            try {
              const text = JSON.parse(line.slice(2))
              improvedText += text
            } catch {
              // Skip non-JSON lines
            }
          }
        }
      }

      setTextContent(improvedText)
      updateTextStats(improvedText)
      setAiResponse(`Text improved based on your instruction: "${aiPrompt}"`)
      toast.success("Text processed successfully")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to process text"
      setAiResponse(`Error: ${message}`)
      toast.error(message)
    } finally {
      setIsProcessing(false)
    }
  }, [aiPrompt, textContent, saveToHistory])

  const handleAIGenerate = useCallback(async () => {
    if (!generationPrompt.trim()) return

    setIsProcessing(true)

    try {
      const response = await fetch("/api/studio/text/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: generationPrompt, tone, length }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Generation failed")
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error("No response body")

      let generated = ""
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split("\n").filter(Boolean)
        for (const line of lines) {
          if (line.startsWith("0:")) {
            try {
              const text = JSON.parse(line.slice(2))
              generated += text
              setGeneratedText(generated)
              updateTextStats(generated)
            } catch {
              // Skip non-JSON lines
            }
          }
        }
      }

      setAiResponse("Text generated successfully! You can copy it or continue editing.")
      toast.success("Text generated")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to generate text"
      setAiResponse(`Error: ${message}`)
      toast.error(message)
    } finally {
      setIsProcessing(false)
    }
  }, [generationPrompt, tone, length])

  const handleCopyText = useCallback(() => {
    const textToCopy = textContent || generatedText
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy)
      toast.success("Copied to clipboard")
    }
  }, [textContent, generatedText])

  const handleEnhance = useCallback(async () => {
    if (!textContent.trim()) {
      toast.error("Enter some text first")
      return
    }
    setAiPrompt("Improve clarity, fix grammar, and enhance readability while maintaining the original tone and meaning")
    // Trigger processing with the enhancement prompt
    setTimeout(() => {
      const processButton = document.querySelector('[data-process-button]') as HTMLButtonElement
      processButton?.click()
    }, 100)
  }, [textContent])

  const handleExport = useCallback((format: string) => {
    const textToExport = textContent || generatedText
    if (!textToExport) {
      toast.error("No text to export")
      return
    }

    let blob: Blob
    let filename: string

    switch (format) {
      case "txt":
        blob = new Blob([textToExport], { type: "text/plain" })
        filename = "content.txt"
        break
      case "md":
        blob = new Blob([textToExport], { type: "text/markdown" })
        filename = "content.md"
        break
      default:
        blob = new Blob([textToExport], { type: "text/plain" })
        filename = "content.txt"
    }

    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`Exported as ${filename}`)
  }, [textContent, generatedText])

  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-black mb-6">TEXT STUDIO</h2>

      <div className="grid lg:grid-cols-[1fr_350px] gap-6">
        <div className="space-y-6">
          {/* Text editor section */}
          <Card className="border-4 border-black rounded-xl p-4 sm:p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <Tabs defaultValue="edit">
              <TabsList className="bg-white/50 border-2 border-black rounded-xl p-1 mb-4 w-full">
                <TabsTrigger
                  value="edit"
                  className="rounded-lg data-[state=active]:bg-black data-[state=active]:text-white font-bold"
                >
                  Edit Text
                </TabsTrigger>
                <TabsTrigger
                  value="generate"
                  className="rounded-lg data-[state=active]:bg-black data-[state=active]:text-white font-bold"
                >
                  Generate Text
                </TabsTrigger>
              </TabsList>

              <TabsContent value="edit">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">Text Editor</h3>
                  <div className="flex items-center gap-2 text-sm">
                    <span>Words: {textStats.words}</span>
                    <span>-</span>
                    <span>Reading time: {textStats.readingTime}</span>
                  </div>
                </div>

                <Textarea
                  className="min-h-[300px] border-2 border-black rounded-xl p-4 text-lg mb-4"
                  placeholder="Enter or paste your text here..."
                  value={textContent}
                  onChange={handleTextChange}
                />

                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    className="border-2 border-black rounded-xl font-bold"
                    onClick={handleUndo}
                    disabled={textHistory.length === 0}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" /> Undo
                  </Button>
                  <Button
                    variant="outline"
                    className="border-2 border-black rounded-xl font-bold"
                    onClick={handleCopyText}
                  >
                    <Copy className="h-4 w-4 mr-2" /> Copy
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-2 border-black rounded-xl font-bold"
                    onClick={handleEnhance}
                    disabled={isProcessing || !textContent.trim()}
                  >
                    <Sparkles className="h-4 w-4 mr-2" /> Enhance
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="generate">
                <h3 className="text-xl font-bold mb-4">AI Text Generation</h3>
                <div className="space-y-4">
                  <div>
                    <Label className="font-bold mb-2 block">What would you like to create?</Label>
                    <Textarea
                      placeholder="E.g., Write a professional email to schedule a meeting, create a product description for a new smartphone..."
                      className="min-h-[100px] border-2 border-black rounded-xl"
                      value={generationPrompt}
                      onChange={(e) => setGenerationPrompt(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="font-bold mb-2 block">Tone</Label>
                      <Select value={tone} onValueChange={setTone}>
                        <SelectTrigger className="border-2 border-black rounded-xl">
                          <SelectValue placeholder="Select tone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="professional">Professional</SelectItem>
                          <SelectItem value="casual">Casual</SelectItem>
                          <SelectItem value="friendly">Friendly</SelectItem>
                          <SelectItem value="formal">Formal</SelectItem>
                          <SelectItem value="persuasive">Persuasive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="font-bold mb-2 block">Length</Label>
                      <Select value={length} onValueChange={setLength}>
                        <SelectTrigger className="border-2 border-black rounded-xl">
                          <SelectValue placeholder="Select length" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="short">Short (~100 words)</SelectItem>
                          <SelectItem value="medium">Medium (~300 words)</SelectItem>
                          <SelectItem value="long">Long (~500 words)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      className="bg-black hover:bg-black/80 text-white rounded-xl border-2 border-black font-bold"
                      onClick={handleAIGenerate}
                      disabled={isProcessing || !generationPrompt.trim()}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...
                        </>
                      ) : (
                        <>
                          <Wand2 className="h-4 w-4 mr-2" /> Generate Text
                        </>
                      )}
                    </Button>
                  </div>

                  {generatedText && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold">Generated Text</h4>
                        <div className="flex items-center gap-2 text-sm">
                          <span>Words: {textStats.words}</span>
                          <span>-</span>
                          <span>Reading time: {textStats.readingTime}</span>
                        </div>
                      </div>
                      <div className="border-2 border-black rounded-xl p-4 bg-white/50 whitespace-pre-wrap">
                        {generatedText}
                      </div>
                      <div className="flex justify-end mt-2 gap-2">
                        <Button
                          variant="outline"
                          className="border-2 border-black rounded-xl font-bold"
                          onClick={() => {
                            setTextContent(generatedText)
                            toast.success("Moved to editor")
                          }}
                        >
                          <Check className="h-4 w-4 mr-2" /> Use in Editor
                        </Button>
                        <Button
                          variant="outline"
                          className="border-2 border-black rounded-xl font-bold"
                          onClick={handleCopyText}
                        >
                          <Copy className="h-4 w-4 mr-2" /> Copy
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </Card>

          {/* AI Text Processing */}
          <Card className="border-4 border-black rounded-xl p-4 sm:p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5" />
              <h3 className="text-xl font-bold">AI Text Assistant</h3>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="font-bold mb-2 block">What would you like to do with your text?</Label>
                <Textarea
                  placeholder="E.g., Improve grammar, make it more concise, change the tone to be more professional..."
                  className="min-h-[80px] border-2 border-black rounded-xl"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                />
              </div>

              <div className="flex justify-end">
                <Button
                  data-process-button
                  className="bg-black hover:bg-black/80 text-white rounded-xl border-2 border-black font-bold"
                  onClick={handleAIProcess}
                  disabled={isProcessing || !aiPrompt.trim() || !textContent.trim()}
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
                    <MessageSquare className="h-5 w-5 mt-0.5 shrink-0" />
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
            <div className="bg-gradient-to-br from-yellow-500 to-amber-500 p-4 text-white">
              <h3 className="text-xl font-bold">Text Controls</h3>
            </div>
            <div className="p-4 bg-white">
              <Tabs defaultValue="format">
                <TabsList className="bg-white/50 border-2 border-black rounded-xl p-1 mb-4 w-full">
                  <TabsTrigger
                    value="format"
                    className="rounded-lg data-[state=active]:bg-black data-[state=active]:text-white font-bold"
                  >
                    Format
                  </TabsTrigger>
                  <TabsTrigger
                    value="analyze"
                    className="rounded-lg data-[state=active]:bg-black data-[state=active]:text-white font-bold"
                  >
                    Analyze
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="format" className="space-y-4">
                  <div>
                    <Label className="font-bold mb-2 block">Text Style</Label>
                    <Select defaultValue="paragraph">
                      <SelectTrigger className="border-2 border-black rounded-xl">
                        <SelectValue placeholder="Select style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="paragraph">Paragraph</SelectItem>
                        <SelectItem value="bullet">Bullet Points</SelectItem>
                        <SelectItem value="numbered">Numbered List</SelectItem>
                        <SelectItem value="heading">Headings</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="font-bold">Bold Important Points</Label>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="font-bold">Auto-Capitalize</Label>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="font-bold">Smart Quotes</Label>
                    <Switch defaultChecked />
                  </div>

                  <div>
                    <Label className="font-bold mb-2 block">Text Case</Label>
                    <Select defaultValue="sentence">
                      <SelectTrigger className="border-2 border-black rounded-xl">
                        <SelectValue placeholder="Select case" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sentence">Sentence case</SelectItem>
                        <SelectItem value="lowercase">lowercase</SelectItem>
                        <SelectItem value="UPPERCASE">UPPERCASE</SelectItem>
                        <SelectItem value="Title Case">Title Case</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>

                <TabsContent value="analyze" className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-bold">Words</span>
                      <span>{textStats.words}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold">Characters</span>
                      <span>{textStats.characters}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold">Sentences</span>
                      <span>{textStats.sentences}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold">Reading Time</span>
                      <span>{textStats.readingTime}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <Label className="font-bold mb-2 block">Readability</Label>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 transition-all" 
                        style={{ 
                          width: `${Math.min(100, Math.max(20, 100 - (textStats.words > 0 ? (textStats.characters / textStats.words - 4) * 10 : 0)))}%` 
                        }}
                      />
                    </div>
                    <div className="flex justify-between mt-1 text-sm">
                      <span>Easy</span>
                      <span>Medium</span>
                      <span>Complex</span>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </Card>

          <Card className="border-4 border-black rounded-xl overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="bg-gradient-to-br from-yellow-500 to-amber-500 p-4 text-white">
              <h3 className="text-xl font-bold">Export Options</h3>
            </div>
            <div className="p-4 bg-white space-y-4">
              <div className="pt-2 space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full border-2 border-black rounded-xl font-bold"
                  onClick={() => handleExport("txt")}
                >
                  <Download className="h-4 w-4 mr-2" /> Export as .txt
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full border-2 border-black rounded-xl font-bold"
                  onClick={() => handleExport("md")}
                >
                  <Download className="h-4 w-4 mr-2" /> Export as .md
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-2 border-black rounded-xl font-bold"
                  onClick={handleCopyText}
                >
                  <Copy className="h-4 w-4 mr-2" /> Copy to Clipboard
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
