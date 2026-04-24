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

    if (payload.type !== "INSERT") {
      return ok("not an insert");
    }

    const job = payload.record;
    if (!job?.id || !job?.title) return ok("invalid job record");

    console.log(`Nouveau job inséré : "${job.title}" (id: ${job.id})`);

    // Client Supabase admin
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // ── 1. Récupérer les alertes actives et les filtrer selon le job inséré ───
    const { data: alerts, error: alertsErr } = await supabase
      .from("alerts")
      .select("id, user_id, keyword, city, is_active")
      .eq("is_active", true);

    if (alertsErr) {
      console.error("Erreur récupération alerts :", alertsErr.message);
      return new Response("error", { status: 500 });
    }

    if (!alerts || alerts.length === 0) {
      console.log("Aucune alerte active.");
      return ok("no active alerts");
    }

    // Filtrage des alertes en fonction du job_id inséré (titre + ville)
    const titleLower   = job.title.toLowerCase();
    const cityLower    = (job.city    ?? "").toLowerCase();
    const communeLower = (job.commune ?? "").toLowerCase();

    const matched: Alert[] = (alerts as Alert[]).filter((alert) => {
      // Le mot-clé de l'alerte doit être présent dans le titre du job
      const keywordMatch = titleLower.includes(alert.keyword.toLowerCase());
      if (!keywordMatch) return false;

      // Si l'alerte a une ville, elle doit correspondre au job
      if (alert.city) {
        const alertCity = alert.city.toLowerCase();
        const cityMatch =
          cityLower.includes(alertCity) ||
          communeLower.includes(alertCity) ||
          alertCity.includes(cityLower);
        if (!cityMatch) return false;
      }

      return true;
    });

    if (matched.length === 0) {
      console.log(`Aucune alerte ne correspond au job "${job.title}".`);
      return ok("no match");
    }

    console.log(`${matched.length} alerte(s) correspondent au job id=${job.id}`);

    // ── 2. Regrouper par user_id (1 email par utilisateur max) ───────────────
    const byUser = new Map<string, Alert[]>();
    for (const alert of matched) {
      if (!byUser.has(alert.user_id)) byUser.set(alert.user_id, []);
      byUser.get(alert.user_id)!.push(alert);
    }

    // ── 3. Envoyer la notification à chaque utilisateur ───────────────────────
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    let sent = 0;

    for (const [userId, userAlerts] of byUser) {
      const { data: userData } = await supabase.auth.admin.getUserById(userId);
      const email = userData?.user?.email;
      const name  = userData?.user?.user_metadata?.full_name ?? "Candidat";

      if (!email) {
        console.warn(`user_id=${userId} — email introuvable, ignoré`);
        continue;
      }

      const keywords = userAlerts.map((a) => a.keyword).join(", ");

      if (RESEND_API_KEY) {
        const success = await sendEmail(RESEND_API_KEY, { to: email, name, job, keywords });
        if (success) sent++;
      } else {
        // Simulation — logs visibles dans Supabase Edge Functions → Logs
        console.log("─".repeat(52));
        console.log(`[SIMULATION] job_id : ${job.id}`);
        console.log(`Destinataire : ${email} (${name})`);
        console.log(`Objet        : 🔔 Nouvelle offre : ${job.title}`);
        console.log(`Lieu         : ${[job.commune, job.city].filter(Boolean).join(", ")}`);
        console.log(`Mots-clés    : ${keywords}`);
        console.log(`URL          : https://jobci.vercel.app/offres/${job.id}`);
        sent++;
      }
    }

    return new Response(
      JSON.stringify({ job_id: job.id, matched: matched.length, notified: sent }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );

  } catch (err) {
    console.error("Erreur non gérée :", err);
    return new Response("internal error", { status: 500 });
  }
});

// ── Envoi email via Resend ────────────────────────────────────────────────────

async function sendEmail(
  apiKey: string,
  { to, name, job, keywords }: { to: string; name: string; job: JobRecord; keywords: string },
): Promise<boolean> {
  const jobUrl = `https://jobci.vercel.app/offres/${job.id}`;
  const lieu   = [job.commune, job.city].filter(Boolean).join(", ") || "Non précisé";
  const salaire = job.salary_min
    ? `${job.salary_min.toLocaleString("fr-FR")}${job.salary_max ? ` – ${job.salary_max.toLocaleString("fr-FR")}` : "+"} FCFA/mois`
    : null;

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:Inter,system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0"
             style="background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;max-width:100%;">

        <!-- Header navy -->
        <tr>
          <td style="background:#0F2050;padding:24px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0"><tr>
              <td>
                <span style="display:inline-block;background:#F97316;color:#fff;font-weight:700;
                             font-size:17px;padding:7px 13px;border-radius:10px;">J</span>
                <span style="color:#fff;font-size:20px;font-weight:700;
                             margin-left:10px;vertical-align:middle;">JobCI</span>
              </td>
              <td align="right">
                <span style="background:rgba(249,115,22,0.18);color:#fb923c;font-size:12px;
                             font-weight:600;padding:4px 12px;border-radius:20px;">🔔 Alerte emploi</span>
              </td>
            </tr></table>
          </td>
        </tr>

        <!-- Corps -->
        <tr>
          <td style="padding:32px;">
            <p style="color:#6b7280;font-size:14px;margin:0 0 6px;">Bonjour ${name},</p>
            <p style="color:#111827;font-size:16px;font-weight:600;margin:0 0 24px;line-height:1.5;">
              Une nouvelle offre correspond à votre alerte
              <span style="color:#F97316;">${keywords}</span>
            </p>

            <!-- Carte offre -->
            <table width="100%" cellpadding="0" cellspacing="0"
                   style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;margin-bottom:28px;">
              <tr><td style="padding:20px 24px;">
                ${job.company_name
                  ? `<p style="color:#6b7280;font-size:13px;margin:0 0 4px;">${job.company_name}</p>`
                  : ""}
                <p style="color:#111827;font-size:19px;font-weight:700;margin:0 0 16px;line-height:1.3;">
                  ${job.title}
                </p>
                <table cellpadding="0" cellspacing="4"><tr>
                  <td style="padding-right:8px;">
                    <span style="font-size:12px;color:#6b7280;">📍 ${lieu}</span>
                  </td>
                  ${job.contract_type
                    ? `<td><span style="font-size:12px;background:#d1fae5;color:#065f46;
                                padding:3px 10px;border-radius:20px;font-weight:600;">
                                ${job.contract_type}</span></td>`
                    : ""}
                </tr></table>
                ${salaire
                  ? `<p style="color:#0F2050;font-size:14px;font-weight:700;margin:14px 0 0;">${salaire}</p>`
                  : ""}
              </td></tr>
            </table>

            <!-- Bouton CTA -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td align="center">
                <a href="${jobUrl}"
                   style="display:inline-block;background:#F97316;color:#fff;font-weight:700;
                          font-size:15px;padding:14px 36px;border-radius:12px;text-decoration:none;">
                  Voir l'offre &rarr;
                </a>
              </td></tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:18px 32px;">
            <p style="color:#9ca3af;font-size:12px;margin:0;text-align:center;line-height:1.6;">
              Vous recevez cet email car vous avez configuré une alerte emploi sur JobCI.<br>
              <a href="https://jobci.vercel.app/alertes"
                 style="color:#F97316;text-decoration:none;">Gérer mes alertes</a>
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
        from: "onboarding@resend.dev",
        to,
        subject: `🔔 Nouvelle offre : ${job.title}`,
        html,
      }),
    });

    if (!res.ok) {
      console.error("Resend error :", await res.text());
      return false;
    }

    console.log(`✅ Email envoyé → ${to} | job_id=${job.id}`);
    return true;

  } catch (err) {
    console.error("sendEmail error :", err);
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
