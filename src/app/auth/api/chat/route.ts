import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import jwt from 'jsonwebtoken';
import connectDB from '@/app/lib/db';
import Chat from '@/app/model/Chat';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const token = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    const userId = decoded.userId || decoded.id;

    const chats = await Chat.find({ userId, isActive: true })
      .sort({ lastUpdated: -1 })
      .limit(10); // Fetch top 10 recent chats

    return NextResponse.json({ success: true, chats });
  } catch (error) {
    console.error('Error fetching chats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chats' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const token = req.headers.get('Authorization')?.replace('Bearer ', '');
    let userId = null;
    
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
        userId = decoded.userId || decoded.id;
      } catch (err) {
        console.error("JWT Verify Error", err);
      }
    }

    const genAi = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    const data = await req.json();
    const { messages, courseContent, chatId } = data;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages are required and must be an array' },
        { status: 400 }
      );
    }

    const lastMessage = messages[messages.length - 1]?.content || 'Hello';
    const prompt = `You are a helpful AI tutor for an online learning platform. 
Be educational, patient, and explain concepts clearly.
${courseContent ? `Course content context: ${courseContent}` : ''}

Here is the conversation history:
${messages.slice(0, -1).map((m: any) => `${m.role}: ${m.content}`).join('\n')}

User says: "${lastMessage}"

Respond as a helpful tutor:`;

    // Step 1: List available models
    let textModelName = 'gemini-1.5-flash'; // default
    try {
      const listRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`
      );
      const modelsData = await listRes.json();
      const availableModels = modelsData.models || [];
      const textModel = availableModels.find((m: any) =>
        m.name.includes("gemini") && !m.name.toLowerCase().includes("embedding")
      );
      if (textModel) textModelName = textModel.name;
    } catch (err) {
      console.error("Failed to list models, using default:", err);
    }

    const encoder = new TextEncoder();
    
    const stream = new ReadableStream({
      async start(controller) {
        let fullOutput = '';
        
        try {
          const model = genAi.getGenerativeModel({ model: textModelName });
          const resultStream = await model.generateContentStream(prompt);
          
          for await (const chunk of resultStream.stream) {
            const chunkText = chunk.text();
            fullOutput += chunkText;
            
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ text: chunkText })}\n\n`)
            );
          }
        } catch (err: any) {
          console.error(`Model ${textModelName} stream failed:`, err.message);
          // Fallback if failed
          if (!fullOutput) {
             const fallbackText = "I'm here to help you with your learning! What would you like to know about the course?";
             fullOutput = fallbackText;
             controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: fallbackText })}\n\n`));
          }
        }

        // Save to DB when the stream is fully finished
        let savedChatId = chatId;
        if (userId) {
          try {
            const assistantMessage = { role: 'assistant', content: fullOutput, timestamp: new Date() };
            
            if (chatId) {
              const userMessage = messages[messages.length - 1];
              await Chat.findByIdAndUpdate(chatId, {
                $push: { messages: { $each: [
                  { role: 'user', content: userMessage.content, timestamp: new Date() },
                  assistantMessage
                ]} },
                lastUpdated: new Date()
              });
            } else {
              const userMessage = messages[messages.length - 1];
              const newChat = new Chat({
                userId,
                title: userMessage.content.substring(0, 30) + '...',
                messages: [
                   { role: 'user', content: userMessage.content, timestamp: new Date() },
                   assistantMessage
                ],
                lastUpdated: new Date()
              });
              const saved = await newChat.save();
              savedChatId = saved._id.toString();
            }
          } catch (dbErr) {
            console.error("DB Save chat error:", dbErr);
          }
        }

        // Send final chunk with the saved id
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ done: true, chatId: savedChatId })}\n\n`)
        );
        controller.close();
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error: any) {
    console.error("Error generating content:", error);

    return NextResponse.json(
      {
        message:
          "I'm here to help you learn! What questions do you have about the course material?",
        timestamp: new Date().toISOString(),
        error: error.message,
        note: "Using fallback response due to API error",
      },
      { status: 500 }
    );
  }
}
