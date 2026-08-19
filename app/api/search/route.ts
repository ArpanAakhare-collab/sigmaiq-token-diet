import { NextRequest, NextResponse } from "next/server";
import { verifyAuthToken } from "@/lib/auth-server";
import { getCollectionDocs } from "@/lib/firestore";

export async function GET(req: NextRequest) {
  try {
    const user = await verifyAuthToken(req);
    const q = req.nextUrl.searchParams.get("q")?.toLowerCase().trim() || "";

    if (!q || q.length === 0) {
      return NextResponse.json({ results: [] });
    }

    const projects = await getCollectionDocs("projects", user.uid);
    const datasets = await getCollectionDocs("datasets", user.uid);
    const runs = await getCollectionDocs("runs", user.uid);
    const alerts = await getCollectionDocs("normalized_alerts", user.uid);
    const incidents = await getCollectionDocs("incidents", user.uid);

    const results: any[] = [];

    projects.forEach((p) => {
      if (p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)) {
        results.push({ type: "Project", title: p.name, subtitle: p.description, url: `/app/projects/${p.id}` });
      }
    });

    datasets.forEach((d) => {
      if (d.name.toLowerCase().includes(q) || d.category?.toLowerCase().includes(q)) {
        results.push({ type: "Dataset", title: d.name, subtitle: `${d.itemCount || 0} items (${d.category})`, url: `/app/datasets` });
      }
    });

    runs.forEach((r) => {
      if (r.id.toLowerCase().includes(q) || r.datasetName?.toLowerCase().includes(q) || r.mode?.toLowerCase().includes(q)) {
        results.push({ type: "Run", title: `Run ${r.id.slice(0, 12)}`, subtitle: `${r.mode} • Status: ${r.status}`, url: `/app/runs/${r.id}` });
      }
    });

    alerts.forEach((a) => {
      if (a.title.toLowerCase().includes(q) || a.service.toLowerCase().includes(q) || a.source.toLowerCase().includes(q)) {
        results.push({ type: "Alert", title: a.title, subtitle: `${a.source} • ${a.service} (${a.severity})`, url: `/app/alerts` });
      }
    });

    incidents.forEach((i) => {
      if (i.title.toLowerCase().includes(q) || i.affectedServices?.some((s: string) => s.toLowerCase().includes(q))) {
        results.push({ type: "Incident", title: i.title, subtitle: `${i.alertCount} alerts • Status: ${i.status}`, url: `/app/incidents/${i.id}` });
      }
    });

    return NextResponse.json({ results: results.slice(0, 15) });
  } catch (err: any) {
    if (err.message.includes("UNAUTHORIZED")) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    return NextResponse.json({ error: err.message || "Search failed" }, { status: 500 });
  }
}
