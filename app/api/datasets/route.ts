import { NextRequest, NextResponse } from "next/server";
import { verifyAuthToken } from "@/lib/auth-server";
import { getCollectionDocs, setDoc } from "@/lib/firestore";

export async function GET(req: NextRequest) {
  try {
    const user = await verifyAuthToken(req);
    const datasets = await getCollectionDocs("datasets", user.uid);
    return NextResponse.json({ datasets });
  } catch (err: any) {
    if (err.message.includes("UNAUTHORIZED")) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    return NextResponse.json({ error: err.message || "Failed to fetch datasets" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await verifyAuthToken(req);
    const body = await req.json();
    const { name, category = "Multi-document", rawData, format = "JSON", description } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: "Dataset name is required" }, { status: 400 });
    }

    if (!rawData || typeof rawData !== "string" || rawData.trim().length === 0) {
      return NextResponse.json({ error: "Raw dataset content is required" }, { status: 400 });
    }

    // Parse JSON or JSONL
    let parsedItems: any[] = [];
    const validationErrors: string[] = [];

    if (format === "JSONL" || rawData.trim().startsWith("{") && rawData.includes("\n{")) {
      const lines = rawData.trim().split("\n");
      lines.forEach((line, idx) => {
        if (!line.trim()) return;
        try {
          parsedItems.push(JSON.parse(line.trim()));
        } catch {
          validationErrors.push(`Line ${idx + 1}: Invalid JSON structure`);
        }
      });
    } else {
      try {
        const json = JSON.parse(rawData);
        parsedItems = Array.isArray(json) ? json : [json];
      } catch (err: any) {
        return NextResponse.json({ error: `JSON Syntax Error: ${err.message}` }, { status: 400 });
      }
    }

    const totalRecords = parsedItems.length;
    const validItems: any[] = [];
    const invalidItems: any[] = [];

    parsedItems.forEach((item, index) => {
      let question = item.question;
      let contextText = "";
      let groundTruth = item.ground_truth || item.expectedAnswer || "";

      if (Array.isArray(item.context)) {
        contextText = item.context.map((c: any) => (typeof c === "string" ? c : c.text || JSON.stringify(c))).join("\n\n");
      } else if (typeof item.context === "string") {
        contextText = item.context;
      }

      if (!question || typeof question !== "string" || question.trim().length === 0) {
        validationErrors.push(`Record #${index + 1}: Missing required 'question' string field`);
        invalidItems.push(item);
        return;
      }

      if (!contextText || contextText.trim().length === 0) {
        validationErrors.push(`Record #${index + 1}: Missing required 'context' text field`);
        invalidItems.push(item);
        return;
      }

      validItems.push({
        id: item.id || `item_${index + 1}`,
        question: question.trim(),
        context: contextText.trim(),
        ground_truth: groundTruth.trim(),
        category: item.category || category,
      });
    });

    if (validItems.length === 0) {
      return NextResponse.json(
        {
          error: "Dataset validation failed: Zero valid items found",
          totalRecords,
          validRecords: 0,
          invalidRecords: invalidItems.length,
          validationErrors,
        },
        { status: 400 }
      );
    }

    const datasetId = `ds_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newDataset = {
      id: datasetId,
      name: name.trim(),
      description: description || "Token-Diet context evaluation dataset.",
      category,
      itemCount: validItems.length,
      items: validItems,
      totalRecords,
      validRecords: validItems.length,
      invalidRecords: invalidItems.length,
      validationErrors,
      ownerUid: user.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await setDoc("datasets", datasetId, newDataset);

    return NextResponse.json(
      {
        dataset: newDataset,
        message: `Dataset validated and saved (${validItems.length}/${totalRecords} valid records)`,
      },
      { status: 201 }
    );
  } catch (err: any) {
    if (err.message.includes("UNAUTHORIZED")) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    return NextResponse.json({ error: err.message || "Failed to process dataset" }, { status: 500 });
  }
}
