import cron from "node-cron";
import pool from "../data/db.js";

async function checkLink(link) {
  try {
    let response = await fetch(link.url, {
      method: "HEAD",
      redirect: "manual",
      signal: AbortSignal.timeout(8000),
    });

    // Some websites don't support HEAD requests
    if (response.status === 405) {
      response = await fetch(link.url, {
        method: "GET",
        redirect: "manual",
        signal: AbortSignal.timeout(8000),
      });
    }

    let status = "healthy";
    let redirectUrl = null;

    if ([301, 302, 307, 308].includes(response.status)) {
      status = "redirected";
      redirectUrl = response.headers.get("location");
    } else if (response.status >= 400) {
      status = "broken";
    }

    await pool.query(
      `UPDATE links
       SET status = $1,
           status_code = $2,
           redirect_url = $3,
           last_checked_at = NOW()
       WHERE id = $4`,
      [status, response.status, redirectUrl, link.id],
    );

    console.log(`✔ ${link.url} → ${status} (${response.status})`);
  } catch (err) {
    console.error(`❌ Failed to check ${link.url}:`, err.message);

    try {
      await pool.query(
        `UPDATE links
         SET status = 'broken',
             status_code = NULL,
             redirect_url = NULL,
             last_checked_at = NOW()
         WHERE id = $1`,
        [link.id],
      );
    } catch (dbErr) {
      console.error(`Database update failed for ${link.url}:`, dbErr.message);
    }
  }
}

export function scheduleLinkHealthCheck() {
  cron.schedule(
    "0 */12 * * *", // Every 12 minutes
    async () => {
      console.log("🔗 Running link health check...");

      try {
        const { rows } = await pool.query("SELECT id, url FROM links");

        for (const link of rows) {
          await checkLink(link);
        }

        console.log(" Link health check complete.");
      } catch (err) {
        console.error("Link health check job failed:", err);
      }
    },
    {
      timezone: "Africa/Kigali",
    },
  );

  console.log("Link health checker scheduled.");
}
