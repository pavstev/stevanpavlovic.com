import { BrowserAI } from "@browserai/browserai";
import { cn } from "@client/utils.ts";
import React, { type FormEvent, useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";

interface BrowserAiChatProps {}

interface Message {
  content: string;
  role: "assistant" | "user";
}

const BrowserAiChat: React.FC<BrowserAiChatProps> = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isModelLoaded, setIsModelLoaded] = useState<boolean>(false);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [systemContext, setSystemContext] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<null | string>(null);

  const browserAIInstanceRef = useRef<BrowserAI | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    const initializeBrowserAI = async () => {
      try {
        const contextResponse = await fetch("/api/ai-context.json");
        if (!contextResponse.ok) {
          throw new Error(`Failed to fetch AI context: ${contextResponse.statusText}`);
        }
        const { context } = await contextResponse.json();
        setSystemContext(context);

        browserAIInstanceRef.current = new BrowserAI();
        await browserAIInstanceRef.current.loadModel("llama-3.2-1b-instruct", {
          onProgress: (progress) => {
            setLoadingProgress(progress.progress);
          },
          quantization: "q4f16_1",
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
  }, []);

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!input.trim() || isGenerating || !isModelLoaded || !browserAIInstanceRef.current) return;

      const userMessage: Message = { content: input, role: "user" };
      setMessages((prevMessages) => [...prevMessages, userMessage]);
      setInput("");
      setIsGenerating(true);

      try {
        const promptArray = [
          {
            content: `You are the personal portfolio assistant for Stevan. Be concise, professional, and confident. Use the following context to answer questions: 

${systemContext}`,
            role: "system",
          },
          ...messages,
          userMessage,
        ];

        const response = await browserAIInstanceRef.current.generateText(promptArray, {
          max_tokens: 250,
          temperature: 0.3,
        });

        const aiMessageContent = response.choices[0].message.content;
        setMessages((prevMessages) => [
          ...prevMessages,
          { content: aiMessageContent, role: "assistant" },
        ]);
      } catch (e: any) {
        console.error("Error generating text:", e);
        setMessages((prevMessages) => [
          ...prevMessages,
          { content: `Sorry, I encountered an error: ${e.message}`, role: "assistant" },
        ]);
      } finally {
        setIsGenerating(false);
      }
    },
    [input, isGenerating, isModelLoaded, systemContext, messages]
  );

  return (
    <div className="fixed right-4 bottom-4 z-50">
      {}
      {!isOpen && (
        <Button
          aria-label="Open AI Chat"
          className="size-14 rounded-full shadow-lg"
          onClick={() => setIsOpen(true)}
        >
          <Icon className="size-6" name="lucide:bot" />
        </Button>
      )}

      {isOpen && (
        <Card className="flex h-[500px] w-[350px] flex-col shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-semibold">AI Assistant</CardTitle>
            <Button
              aria-label="Close AI Chat"
              onClick={() => setIsOpen(false)}
              size="icon"
              variant="ghost"
            >
              <Icon className="size-4" name="lucide:x" />
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
                <Progress className="mb-2 w-[80%]" value={loadingProgress} />
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
                      <Icon className="mb-2 size-8" name="lucide:message-circle" />
                      <p>How can I help you today?</p>
                    </div>
                  )}
                  {messages.map((msg, index) => (
                    <div
                      className={cn(
                        "flex gap-2",
                        msg.role === "user" ? "justify-end" : "justify-start"
                      )}
                      key={index}
                    >
                      {msg.role === "assistant" && (
                        <Avatar className="size-8">
                          <AvatarImage alt="AI Assistant" src="/profile.jpeg" />
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
                        <AvatarImage alt="AI Assistant" src="/profile.jpeg" />
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
              <form className="flex w-full space-x-2" onSubmit={handleSubmit}>
                <Input
                  autoComplete="off"
                  className="flex-1"
                  disabled={isGenerating}
                  id="message"
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  value={input}
                />
                <Button disabled={isGenerating} size="icon" type="submit">
                  <Icon className="size-4" name="lucide:send" />
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