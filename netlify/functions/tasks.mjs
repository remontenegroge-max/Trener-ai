import { getStore } from "@netlify/blobs";

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });

export default async (req) => {
  if (req.method === "OPTIONS") return json({ ok: true });

  const store = getStore("trener-tasks");
  const KEY = "all";

  if (req.method === "GET") {
    const tasks = (await store.get(KEY, { type: "json" })) || [];
    return json(tasks);
  }

  if (req.method === "POST") {
    const body = await req.json();
    if (!body.subject || !body.description) {
      return json({ error: "Falta materia o descripcion" }, 400);
    }
    const tasks = (await store.get(KEY, { type: "json" })) || [];
    const newTask = {
      id: "task-" + Date.now() + "-" + Math.random().toString(36).slice(2, 11),
      type: body.type === "examen" ? "examen" : "tarea",
      subject: String(body.subject).trim(),
      description: String(body.description).trim(),
      dueDate: body.dueDate || "",
      grade: body.grade || "9no B",
      createdAt: new Date().toISOString(),
    };
    tasks.push(newTask);
    await store.setJSON(KEY, tasks);
    return json(newTask);
  }

  if (req.method === "DELETE") {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return json({ error: "Falta id" }, 400);
    const tasks = (await store.get(KEY, { type: "json" })) || [];
    await store.setJSON(KEY, tasks.filter((t) => t.id !== id));
    return json({ ok: true });
  }

  return json({ error: "Method not allowed" }, 405);
};

export const config = {
  path: "/api/tasks",
};
