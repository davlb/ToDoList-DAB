import { NextResponse } from "next/server";

interface AiRequestBody {
  title: string;
  description?: string;
  prompt: string;
  todoId?: string;
}

export async function POST(req: Request) {
  try {
    const body: AiRequestBody = await req.json();

    // Validate required fields
    if (!body.title || !body.prompt) {
      return NextResponse.json(
        { error: "Title and prompt are required" },
        { status: 400 }
      );
    }

    // Use your n8n webhook (or any AI backend)
    const webhook = process.env.N8N_WEBHOOK_URL;
    if (!webhook) {
      return NextResponse.json(
        { error: "N8N_WEBHOOK_URL is not set" },
        { status: 500 }
      );
    }

    // Send to AI / n8n webhook
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: body.title,
        description: body.description || "",
        prompt: body.prompt,
        todoId: body.todoId || null,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: text }, { status: 500 });
    }

    const data = await res.json();

    // Expected n8n output: { enhancedTitle, output }
    return NextResponse.json({
      enhancedTitle: data.enhancedTitle ?? "",
      output: data.output ?? "",
    });
  } catch (err) {
    console.error("AI route error:", err);
    return NextResponse.json(
      { error: "Failed to process AI request" },
      { status: 500 }
    );
  }
}
