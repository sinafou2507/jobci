import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ── Types ─────────────────────────────────────────────────────────────────────

interface JobRecord {
  id: string;
  title: string;
  company_name: string | null;
  city: string | null;
  commune: string | null;
  contract_type: string | null;
  sector: string | null;
  salary_min: number | null;
  salary_max: number | null;
}

interface WebhookPayload {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  record: JobRecord;
  old_record: JobRecord | null;
}

interface Alert {
  id: string;
  user_id: string;
  keyword: string;
  city: string | null;
  is_active: boolean;
}

// ── Handler principal ─────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  try {
    const payload: WebhookPayload = await req.json();

    // Uniquement les nouvelles offres actives
    if (payload.type !== "INSERT") {
      return ok("not an insert");
    }

    const job = payload.record;
    if (!job?.title) return ok("no title");

    // Client Supabase admin (accès complet, ignore RLS)
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // ── 1. Charger toutes les alertes actives ─────────────────────────────────
    const { data: alerts, error: alertsErr } = await supabase
      .from("alerts")
      .select("id, user_id, keyword, city, is_active")
      .eq("is_active", true);

    if (alertsErr) {
      console.error("alerts fetch error:", alertsErr.message);
      return new Response("error", { status: 500 });
    }

    if (!alerts || alerts.length === 0) {
      return ok("no active alerts");
    }

    // ── 2. Filtrer les alertes qui correspondent à l'offre ────────────────────
    const titleLower   = job.title.toLowerCase();
    const cityLower    = (job.city    ?? "").toLowerCase();
    const communeLower = (job.commune ?? "").toLowerCase();

    const matched: Alert[] = (alerts as Alert[]).filter((alert) => {
      // Mot-clé présent dans le titre ?
      if (!titleLower.includes(alert.keyword.toLowerCase())) return false;

      // Ville : si l'alerte a une contrainte de ville, vérifier la correspondance
      if (alert.city) {
        const ac = alert.city.toLowerCase();
        if (!cityLower.includes(ac) && !communeLower.includes(ac) && !ac.includes(cityLower)) {
          return false;
        }
      }

      return true;
    });

    if (matched.length === 0) {
      console.log(`"${job.title}" — aucune alerte correspondante`);
      return ok("no match");
    }

    console.log(`"${job.title}" — ${matched.length} alerte(s) trouvée(s)`);

    // ── 3. Regrouper par user_id ──────────────────────────────────────────────
    const byUser = new Map<string, Alert[]>();
    for (const alert of matched) {
      if (!byUser.has(alert.user_id)) byUser.set(alert.user_id, []);
      byUser.get(alert.user_id)!.push(alert);
    }

    // ── 4. Envoyer une notification par utilisateur ───────────────────────────
    const RESEND_KEY = Deno.env.get("RESEND_API_KEY");
    let sent = 0;

    for (const [userId, userAlerts] of byUser) {
      const { data: userData } = await supabase.auth.admin.getUserById(userId);
      const email = userData?.user?.email;
      const name  = userData?.user?.user_metadata?.full_name ?? "Candidat";

      if (!email) continue;

      const keywords = userAlerts.map((a) => a.keyword).join(", ");

      if (RESEND_KEY) {
        const ok = await sendResendEmail(RESEND_KEY, { to: email, name, job, keywords });
        if (ok) sent++;
      } else {
        // Mode simulation — visible dans les logs Supabase
        console.log("─".repeat(50));
        console.log(`[EMAIL SIMULÉ] destinataire : ${email}`);
        console.log(`Objet  : 🔔 Nouvelle offre correspondant à votre alerte`);
        console.log(`Titre  : ${job.title}`);
        console.log(`Lieu   : ${[job.commune, job.city].filter(Boolean).join(", ")}`);
        console.log(`Mots-clés déclencheurs : ${keywords}`);
        console.log(`Lien   : https://jobci.vercel.app/offres/${job.id}`);
        sent++;
      }
    }

    return new Response(
      JSON.stringify({ matched: matched.length, notified: sent }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );

  } catch (err) {
    console.error("Unhandled error:", err);
    return new Response("internal error", { status: 500 });
  }
});

// ── Envoi email via Resend ────────────────────────────────────────────────────

async function sendResendEmail(
  apiKey: string,
  { to, name, job, keywords }: { to: string; name: string; job: JobRecord; keywords: string },
): Promise<boolean> {
  const jobUrl  = `https://jobci.vercel.app/offres/${job.id}`;
  const lieu    = [job.commune, job.city].filter(Boolean).join(", ") || "Non précisé";
  const salaire = job.salary_min
    ? `${job.salary_min.toLocaleString("fr-FR")}${job.salary_max ? ` – ${job.salary_max.toLocaleString("fr-FR")}` : "+"} FCFA`
    : null;

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:Inter,system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">

        <!-- Header -->
        <tr>
          <td style="background:#0F2050;padding:24px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <span style="display:inline-block;background:#F97316;color:#fff;font-weight:700;
                               font-size:18px;padding:8px 14px;border-radius:10px;">J</span>
                  <span style="color:#fff;font-weight:700;font-size:20px;margin-left:10px;vertical-align:middle;">JobCI</span>
                </td>
                <td align="right">
                  <span style="background:rgba(249,115,22,0.15);color:#fb923c;font-size:12px;
                               font-weight:600;padding:4px 12px;border-radius:20px;">🔔 Alerte emploi</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px;">
            <p style="color:#6b7280;font-size:14px;margin:0 0 8px;">Bonjour ${name},</p>
            <p style="color:#111827;font-size:16px;font-weight:600;margin:0 0 24px;">
              Une nouvelle offre correspond à votre alerte <strong style="color:#F97316;">${keywords}</strong>
            </p>

            <!-- Carte offre -->
            <table width="100%" cellpadding="0" cellspacing="0"
                   style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin-bottom:24px;">
              <tr>
                <td style="padding:20px;">
                  <p style="color:#6b7280;font-size:13px;margin:0 0 4px;">${job.company_name ?? ""}</p>
                  <p style="color:#111827;font-size:18px;font-weight:700;margin:0 0 16px;">${job.title}</p>
                  <table cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding-right:16px;">
                        <span style="color:#6b7280;font-size:12px;">📍 ${lieu}</span>
                      </td>
                      ${job.contract_type ? `<td><span style="font-size:12px;background:#d1fae5;color:#065f46;padding:2px 10px;border-radius:20px;font-weight:600;">${job.contract_type}</span></td>` : ""}
                    </tr>
                  </table>
                  ${salaire ? `<p style="color:#0F2050;font-size:14px;font-weight:600;margin:12px 0 0;">${salaire}/mois</p>` : ""}
                </td>
              </tr>
            </table>

            <!-- CTA -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center">
                  <a href="${jobUrl}" style="display:inline-block;background:#F97316;color:#fff;
                             font-weight:700;font-size:15px;padding:14px 32px;border-radius:12px;
                             text-decoration:none;">Voir l'offre →</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;padding:20px 32px;border-top:1px solid #e5e7eb;">
            <p style="color:#9ca3af;font-size:12px;margin:0;text-align:center;">
              Vous recevez cet email car vous avez une alerte active sur JobCI.<br>
              <a href="https://jobci.vercel.app/alertes" style="color:#F97316;">Gérer mes alertes</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "JobCI Alertes <alertes@jobci.ci>",
        to,
        subject: `🔔 Nouvelle offre : ${job.title}`,
        html,
      }),
    });

    if (!res.ok) {
      console.error("Resend error:", await res.text());
      return false;
    }

    console.log(`Email envoyé à ${to} — "${job.title}"`);
    return true;
  } catch (err) {
    console.error("sendResendEmail error:", err);
    return false;
  }
}

// ── Utilitaire ────────────────────────────────────────────────────────────────

function ok(msg: string): Response {
  return new Response(JSON.stringify({ status: "ok", msg }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
