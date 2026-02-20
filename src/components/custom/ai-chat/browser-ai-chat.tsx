import React, { useRef, useState, useEffect, useCallback, type FormEvent } from "react";
import { BrowserAI } from "@browserai/browserai";
import ReactMarkdown from "react-markdown";

// shadcn/ui components
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon"; // Our custom icon component using @iconify/react
import { cn } from "@client/utils"; // Utility for conditional class names

// Type Definitions
interface Message {
  role: "user" | "assistant";
  content: string;
}

interface BrowserAiChatProps {
  // No props needed for now based on the prompt, but good to have the interface
}

const BrowserAiChat: React.FC<BrowserAiChatProps> = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isModelLoaded, setIsModelLoaded] = useState<boolean>(false);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [systemContext, setSystemContext] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const browserAIInstanceRef = useRef<BrowserAI | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to the latest message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Initialization and Model Loading
  useEffect(() => {
    const initializeBrowserAI = async () => {
      try {
        // Fetch system context
        const contextResponse = await fetch("/api/ai-context.json");
        if (!contextResponse.ok) {
          throw new Error(`Failed to fetch AI context: ${contextResponse.statusText}`);
        }
        const { context } = await contextResponse.json();
        setSystemContext(context);

        browserAIInstanceRef.current = new BrowserAI();
        await browserAIInstanceRef.current.loadModel("llama-3.2-1b-instruct", {
          quantization: "q4f16_1",
          onProgress: (progress) => {
            setLoadingProgress(progress.progress);
          },
        });
        setIsModelLoaded(true);
        console.log("BrowserAI model loaded successfully.");
      } catch (e: any) {
        console.error("Failed to load BrowserAI model:", e);
        setError(
          `Failed to load AI model. Please ensure your browser supports WebGPU and try again. Error: ${e.message}`
        );
      }
    };

    initializeBrowserAI();
  }, []); // Run only once on mount

  // Handle message submission
  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!input.trim() || isGenerating || !isModelLoaded || !browserAIInstanceRef.current) return;

      const userMessage: Message = { role: "user", content: input };
      setMessages((prevMessages) => [...prevMessages, userMessage]);
      setInput("");
      setIsGenerating(true);

      try {
        const promptArray = [
          {
            role: "system",
            content: `You are the personal portfolio assistant for Stevan. Be concise, professional, and confident. Use the following context to answer questions: 

${systemContext}`,
          },
          ...messages, // Previous messages in the conversation
          userMessage, // Current user message
        ];

        const response = await browserAIInstanceRef.current.generateText(promptArray, {
          temperature: 0.3,
          max_tokens: 250,
        });

        const aiMessageContent = response.choices[0].message.content;
        setMessages((prevMessages) => [
          ...prevMessages,
          { role: "assistant", content: aiMessageContent },
        ]);
      } catch (e: any) {
        console.error("Error generating text:", e);
        setMessages((prevMessages) => [
          ...prevMessages,
          { role: "assistant", content: `Sorry, I encountered an error: ${e.message}` },
        ]);
      } finally {
        setIsGenerating(false);
      }
    },
    [input, isGenerating, isModelLoaded, systemContext, messages]
  );

  return (
    <div className="fixed right-4 bottom-4 z-50">
      {/* Minimized FAB */}
      {!isOpen && (
        <Button
          className="size-14 rounded-full shadow-lg"
          onClick={() => setIsOpen(true)}
          aria-label="Open AI Chat"
        >
          <Icon name="lucide:bot" className="size-6" />
        </Button>
      )}

      {isOpen && (
        <Card className="flex h-[500px] w-[350px] flex-col shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-semibold">AI Assistant</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              aria-label="Close AI Chat"
            >
              <Icon name="lucide:x" className="size-4" />
            </Button>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
            {error && (
              <div className="flex h-full items-center justify-center p-4 text-center text-red-500">
                <p>{error}</p>
              </div>
            )}
            {!isModelLoaded && !error && (
              <div className="flex h-full flex-col items-center justify-center rounded-b-lg bg-black p-4 font-mono text-green-400">
                <p className="mb-4 text-center">{"> Initializing Local AI Engine..."}</p>
                <Progress value={loadingProgress} className="mb-2 w-[80%]" />
                <p className="text-center text-xs text-gray-500">
                  Downloading a private, local AI model directly into your browser memory. No data
                  is sent to the cloud.
                </p>
              </div>
            )}

            {isModelLoaded && !error && (
              <ScrollArea className="h-full px-4 py-2">
                <div className="flex flex-col gap-3">
                  {messages.length === 0 && (
                    <div className="text-muted-foreground flex h-full flex-col items-center justify-center py-4 text-center">
                      <Icon name="lucide:message-circle" className="mb-2 size-8" />
                      <p>How can I help you today?</p>
                    </div>
                  )}
                  {messages.map((msg, index) => (
                    <div
                      key={index}
                      className={cn(
                        "flex gap-2",
                        msg.role === "user" ? "justify-end" : "justify-start"
                      )}
                    >
                      {msg.role === "assistant" && (
                        <Avatar className="size-8">
                          <AvatarImage src="/profile.jpeg" alt="AI Assistant" />
                          <AvatarFallback>AI</AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={cn(
                          "max-w-[70%] rounded-lg p-2 text-sm",
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                      {msg.role === "user" && (
                        <Avatar className="size-8">
                          <AvatarFallback>You</AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                  {isGenerating && (
                    <div className="flex justify-start gap-2">
                      <Avatar className="size-8">
                        <AvatarImage src="/profile.jpeg" alt="AI Assistant" />
                        <AvatarFallback>AI</AvatarFallback>
                      </Avatar>
                      <div className="bg-muted text-muted-foreground max-w-[70%] rounded-lg p-2 text-sm">
                        Thinking...
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            )}
          </CardContent>
          {isModelLoaded && !error && (
            <CardFooter className="border-t p-2">
              <form onSubmit={handleSubmit} className="flex w-full space-x-2">
                <Input
                  id="message"
                  placeholder="Type your message..."
                  className="flex-1"
                  autoComplete="off"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isGenerating}
                />
                <Button type="submit" size="icon" disabled={isGenerating}>
                  <Icon name="lucide:send" className="size-4" />
                  <span className="sr-only">Send message</span>
                </Button>
              </form>
            </CardFooter>
          )}
        </Card>
      )}
    </div>
  );
};

export default BrowserAiChat;
