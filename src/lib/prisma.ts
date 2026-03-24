// src/lib/prisma.ts — Custom SQLite shim (Node 22 node:sqlite)
// Implements the Prisma API subset used by eWheelz for local development.
// Production uses Neon PostgreSQL (real PrismaClient).

import { DatabaseSync } from "node:sqlite";
import path from "path";
import crypto from "crypto";

// ─── Database singleton ───────────────────────────────────────────────────────

const DB_PATH = path.join(process.cwd(), "prisma", "dev.db");
let _db: DatabaseSync | null = null;

function db(): DatabaseSync {
  if (!_db) _db = new DatabaseSync(DB_PATH);
  return _db;
}

// ─── Utilities ────────────────────────────────────────────────────────────────

// Convert a snake_case SQLite row → camelCase object (with Date parsing)
function row2obj(row: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) {
    const key = k.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    // Convert ISO datetime strings → Date objects
    if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}T/.test(v)) {
      out[key] = new Date(v);
    } else {
      out[key] = v;
    }
  }
  return out;
}

// camelCase field name → snake_case column name
function toSnake(s: string): string {
  return s.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
}

// Build a WHERE fragment from a conditions object { field: value, ... }
function buildConditions(
  cond: Record<string, unknown>,
  tableAlias: string
): { sql: string; params: unknown[] } {
  const parts: string[] = [];
  const params: unknown[] = [];

  for (const [k, v] of Object.entries(cond)) {
    if (v === undefined) continue;
    const col = `${tableAlias}.${toSnake(k)}`;

    if (v === null) {
      parts.push(`${col} IS NULL`);
    } else if (typeof v === "object" && !Array.isArray(v)) {
      const ops = v as Record<string, unknown>;
      if ("gte" in ops) { parts.push(`${col} >= ?`); params.push(ops.gte); }
      if ("gt"  in ops) { parts.push(`${col} > ?`);  params.push(ops.gt); }
      if ("lte" in ops) { parts.push(`${col} <= ?`); params.push(ops.lte); }
      if ("lt"  in ops) { parts.push(`${col} < ?`);  params.push(ops.lt); }
      if ("in" in ops && Array.isArray(ops.in)) {
        if ((ops.in as unknown[]).length === 0) {
          parts.push("0=1"); // empty IN → no results
        } else {
          parts.push(`${col} IN (${(ops.in as unknown[]).map(() => "?").join(",")})`);
          params.push(...(ops.in as unknown[]));
        }
      }
      if ("contains"   in ops) { parts.push(`${col} LIKE ?`); params.push(`%${ops.contains}%`); }
      if ("startsWith" in ops) { parts.push(`${col} LIKE ?`); params.push(`${ops.startsWith}%`); }
    } else {
      parts.push(`${col} = ?`);
      params.push(v === true ? 1 : v === false ? 0 : v);
    }
  }

  return { sql: parts.join(" AND "), params };
}

// Build ORDER BY from { field: "asc"|"desc" } or array thereof
function buildOrderBy(orderBy: unknown, tableAlias?: string): string {
  if (!orderBy) return "";
  const orders = Array.isArray(orderBy) ? orderBy : [orderBy];
  const parts = (orders as Record<string, string>[]).flatMap((o) =>
    Object.entries(o).map(([k, dir]) => {
      const col = tableAlias ? `${tableAlias}.${toSnake(k)}` : toSnake(k);
      return `${col} ${dir.toUpperCase()}`;
    })
  );
  return parts.length ? `ORDER BY ${parts.join(", ")}` : "";
}

// Apply a Prisma select spec to a camelCase result object (mutates in place)
function applySelect(
  obj: Record<string, unknown>,
  sel: Record<string, unknown>
): void {
  for (const k of Object.keys(obj)) {
    if (!sel[k]) delete obj[k];
  }
}

// ─── EvModel includes loader ───────────────────────────────────────────────────

function loadEvModelIncludes(
  result: Record<string, unknown>,
  include: Record<string, unknown>
): void {
  const id = result.id as string;

  if (include.specs) {
    const r = db().prepare("SELECT * FROM ev_specs WHERE ev_model_id = ? LIMIT 1").get(id);
    result.specs = r ? row2obj(r as Record<string, unknown>) : null;
    if (result.specs && typeof include.specs === "object" && (include.specs as Record<string,unknown>).select) {
      applySelect(result.specs as Record<string, unknown>, (include.specs as Record<string,unknown>).select as Record<string,unknown>);
    }
  }

  if (include.battery) {
    const r = db().prepare("SELECT * FROM ev_batteries WHERE ev_model_id = ? LIMIT 1").get(id);
    result.battery = r ? row2obj(r as Record<string, unknown>) : null;
  }

  if (include.charging) {
    const rows = db().prepare("SELECT * FROM ev_charging WHERE ev_model_id = ?").all(id);
    result.charging = rows.map((r) => row2obj(r as Record<string, unknown>));
  }

  if (include.listings) {
    const rows = db().prepare("SELECT * FROM listings WHERE ev_model_id = ?").all(id);
    result.listings = rows.map((r) => row2obj(r as Record<string, unknown>));
  }

  if (include.reviews) {
    const opts =
      typeof include.reviews === "object" && include.reviews !== true
        ? (include.reviews as Record<string, unknown>)
        : ({} as Record<string, unknown>);
    const qParams: unknown[] = [id];
    let q = "SELECT * FROM reviews WHERE ev_model_id = ?";
    if (opts.orderBy) q += ` ${buildOrderBy(opts.orderBy)}`;
    if (opts.take) { q += " LIMIT ?"; qParams.push(opts.take); }
    const rows = db().prepare(q).all(...qParams);
    result.reviews = rows.map((r) => row2obj(r as Record<string, unknown>));

    // Nested author include
    if ((opts as Record<string,unknown>).include) {
      const nestedInc = (opts as Record<string,unknown>).include as Record<string,unknown>;
      if (nestedInc.author) {
        const authorSel = (nestedInc.author as Record<string,unknown>).select as Record<string,unknown> | undefined;
        for (const rev of result.reviews as Record<string, unknown>[]) {
          const ar = db().prepare("SELECT * FROM users WHERE id = ? LIMIT 1").get(rev.authorId as string);
          rev.author = ar ? row2obj(ar as Record<string, unknown>) : null;
          if (rev.author && authorSel) applySelect(rev.author as Record<string, unknown>, authorSel);
        }
      }
    }
  }

  if (include._count) {
    result._count = {} as Record<string, unknown>;
    const countSel = ((include._count as Record<string,unknown>).select ?? {}) as Record<string, unknown>;
    if (countSel.listings) {
      const r = db().prepare("SELECT COUNT(*) AS n FROM listings WHERE ev_model_id = ?").get(id);
      (result._count as Record<string, unknown>).listings = Number((r as Record<string,unknown>).n);
    }
    if (countSel.reviews) {
      const r = db().prepare("SELECT COUNT(*) AS n FROM reviews WHERE ev_model_id = ?").get(id);
      (result._count as Record<string, unknown>).reviews = Number((r as Record<string,unknown>).n);
    }
  }
}

// ─── Model delegates ──────────────────────────────────────────────────────────

const evModel = {
  async findUnique(args: Record<string, unknown>): Promise<Record<string, unknown> | null> {
    const w = buildConditions((args.where ?? {}) as Record<string,unknown>, "ev_models");
    const row = db().prepare(`SELECT * FROM ev_models ${w.sql ? `WHERE ${w.sql}` : ""} LIMIT 1`).get(...w.params);
    if (!row) return null;
    const result = row2obj(row as Record<string, unknown>);
    if (args.select) { applySelect(result, args.select as Record<string,unknown>); return result; }
    if (args.include) loadEvModelIncludes(result, args.include as Record<string,unknown>);
    return result;
  },

  async findMany(args: Record<string, unknown> = {}): Promise<Record<string, unknown>[]> {
    const parts: string[] = [];
    const params: unknown[] = [];
    if (args.where) {
      const w = buildConditions(args.where as Record<string,unknown>, "ev_models");
      if (w.sql) parts.push(w.sql);
      params.push(...w.params);
    }
    const where = parts.length ? `WHERE ${parts.join(" AND ")}` : "";
    const order = buildOrderBy(args.orderBy, "ev_models");
    const limit = args.take ? `LIMIT ${args.take}` : "";
    const rows = db().prepare(`SELECT ev_models.* FROM ev_models ${where} ${order} ${limit}`).all(...params);
    const results = rows.map((r) => row2obj(r as Record<string, unknown>));
    if (args.select) { results.forEach((r) => applySelect(r, args.select as Record<string,unknown>)); return results; }
    if (args.include) results.forEach((r) => loadEvModelIncludes(r, args.include as Record<string,unknown>));
    return results;
  },
};

const evBattery = {
  async findMany(args: Record<string, unknown> = {}): Promise<Record<string, unknown>[]> {
    const w = buildConditions((args.where ?? {}) as Record<string,unknown>, "ev_batteries");
    const where = w.sql ? `WHERE ${w.sql}` : "";
    const order = buildOrderBy(args.orderBy, "ev_batteries");
    const limit = args.take ? `LIMIT ${args.take}` : "";
    const rows = db().prepare(`SELECT * FROM ev_batteries ${where} ${order} ${limit}`).all(...w.params);
    const results = rows.map((r) => row2obj(r as Record<string, unknown>));
    if (args.include) {
      const inc = args.include as Record<string,unknown>;
      if (inc.evModel) {
        for (const r of results) {
          const em = db().prepare("SELECT * FROM ev_models WHERE id = ? LIMIT 1").get(r.evModelId as string);
          r.evModel = em ? row2obj(em as Record<string, unknown>) : null;
          if (r.evModel && typeof inc.evModel === "object" && (inc.evModel as Record<string,unknown>).select) {
            applySelect(r.evModel as Record<string, unknown>, (inc.evModel as Record<string,unknown>).select as Record<string,unknown>);
          }
        }
      }
    }
    return results;
  },
};

const listing = {
  async findMany(args: Record<string, unknown> = {}): Promise<Record<string, unknown>[]> {
    const parts: string[] = [];
    const params: unknown[] = [];
    const { evModel: evModelFilter, ...mainCond } = (args.where ?? {}) as Record<string, unknown>;
    if (Object.keys(mainCond).length) {
      const w = buildConditions(mainCond, "l");
      if (w.sql) parts.push(w.sql);
      params.push(...w.params);
    }
    if (evModelFilter && typeof evModelFilter === "object") {
      const w = buildConditions(evModelFilter as Record<string,unknown>, "em");
      if (w.sql) parts.push(w.sql);
      params.push(...w.params);
    }
    const where = parts.length ? `WHERE ${parts.join(" AND ")}` : "";
    const order = buildOrderBy(args.orderBy, "l");
    const limit = args.take ? `LIMIT ${args.take}` : "";
    const rows = db().prepare(
      `SELECT l.* FROM listings l JOIN ev_models em ON l.ev_model_id = em.id ${where} ${order} ${limit}`
    ).all(...params);
    const results = rows.map((r) => row2obj(r as Record<string, unknown>));
    if (args.include) {
      const inc = args.include as Record<string,unknown>;
      for (const r of results) {
        if (inc.evModel) {
          const em = db().prepare("SELECT * FROM ev_models WHERE id = ? LIMIT 1").get(r.evModelId as string);
          r.evModel = em ? row2obj(em as Record<string, unknown>) : null;
          if (r.evModel && typeof inc.evModel === "object" && (inc.evModel as Record<string,unknown>).select) {
            applySelect(r.evModel as Record<string, unknown>, (inc.evModel as Record<string,unknown>).select as Record<string,unknown>);
          }
        }
        if (inc.user) {
          const u = db().prepare("SELECT * FROM users WHERE id = ? LIMIT 1").get(r.userId as string);
          r.user = u ? row2obj(u as Record<string, unknown>) : null;
          if (r.user && typeof inc.user === "object" && (inc.user as Record<string,unknown>).select) {
            applySelect(r.user as Record<string, unknown>, (inc.user as Record<string,unknown>).select as Record<string,unknown>);
          }
        }
      }
    }
    return results;
  },

  async count(args: Record<string, unknown> = {}): Promise<number> {
    const parts: string[] = [];
    const params: unknown[] = [];
    const { evModel: evModelFilter, ...mainCond } = (args.where ?? {}) as Record<string, unknown>;
    if (Object.keys(mainCond).length) {
      const w = buildConditions(mainCond, "l");
      if (w.sql) parts.push(w.sql);
      params.push(...w.params);
    }
    if (evModelFilter && typeof evModelFilter === "object") {
      const w = buildConditions(evModelFilter as Record<string,unknown>, "em");
      if (w.sql) parts.push(w.sql);
      params.push(...w.params);
    }
    const where = parts.length ? `WHERE ${parts.join(" AND ")}` : "";
    const r = db().prepare(
      `SELECT COUNT(*) AS n FROM listings l JOIN ev_models em ON l.ev_model_id = em.id ${where}`
    ).get(...params);
    return Number((r as Record<string,unknown>).n);
  },

  async create(args: Record<string, unknown>): Promise<Record<string, unknown>> {
    const data = args.data as Record<string, unknown>;
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    db().prepare(
      `INSERT INTO listings (id,user_id,ev_model_id,price,year,mileage,city,battery_health,condition,description,status,created_at,updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`
    ).run(
      id, data.userId, data.evModelId, data.price, data.year,
      data.mileage ?? null, data.city, data.batteryHealth ?? null,
      data.condition ?? "USED", data.description ?? null,
      data.status ?? "ACTIVE", now, now
    );
    const row = db().prepare("SELECT * FROM listings WHERE id = ?").get(id);
    return row2obj(row as Record<string, unknown>);
  },
};

const article = {
  async findMany(args: Record<string, unknown> = {}): Promise<Record<string, unknown>[]> {
    const w = buildConditions((args.where ?? {}) as Record<string,unknown>, "articles");
    const where = w.sql ? `WHERE ${w.sql}` : "";
    const order = buildOrderBy(args.orderBy, "articles");
    const limit = args.take ? `LIMIT ${args.take}` : "";
    const rows = db().prepare(`SELECT * FROM articles ${where} ${order} ${limit}`).all(...w.params);
    return rows.map((r) => row2obj(r as Record<string, unknown>));
  },

  async findUnique(args: Record<string, unknown>): Promise<Record<string, unknown> | null> {
    const w = buildConditions((args.where ?? {}) as Record<string,unknown>, "articles");
    const row = db().prepare(`SELECT * FROM articles ${w.sql ? `WHERE ${w.sql}` : ""} LIMIT 1`).get(...w.params);
    return row ? row2obj(row as Record<string, unknown>) : null;
  },
};

const chargingStation = {
  async findMany(args: Record<string, unknown> = {}): Promise<Record<string, unknown>[]> {
    const w = buildConditions((args.where ?? {}) as Record<string,unknown>, "charging_stations");
    const where = w.sql ? `WHERE ${w.sql}` : "";
    const order = buildOrderBy(args.orderBy, "charging_stations");
    const limit = args.take ? `LIMIT ${args.take}` : "";
    const rows = db().prepare(`SELECT * FROM charging_stations ${where} ${order} ${limit}`).all(...w.params);
    return rows.map((r) => row2obj(r as Record<string, unknown>));
  },
};

// ─── Export ───────────────────────────────────────────────────────────────────

export const prisma = { evModel, evBattery, listing, article, chargingStation };
export default prisma;
