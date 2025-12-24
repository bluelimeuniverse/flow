# 🔄 BlueLime Universe: Context for Next Session

**Use this summary to initialize the next chat session.**

## 1. Infrastructure (Hetzner VPS)
*   **Server IP (Dirty/Marketing)**: `91.98.163.193` (User: `root`, Pass: `BlueLime2025!Universe`)
*   **Floating IP (Clean/App)**: `49.13.39.75` (Configured via Netplan on `eth0`).
*   **Panel**: Coolify running on Port 8000.

## 2. Mailcow (Email Server)
*   **Status**: Installed & Running.
*   **Access**:
    *   ✅ **Direct IP (Working)**: `http://91.98.163.193:8081` (User: `admin`, Pass: `moohoo`).
    *   ⚠️ **Domain (`mail.bluelimeflow.com`)**: Returns 503. Issue identified as Port Mismatch (Traefik -> Internal 80 vs 8081).
    *   **Fix Plan**: See `debug_analysis_domain_fix.md`.
*   **DNS**: `bluelimeflow.com` -> `91.98.163.193`.

## 3. BlueLime Universe (Main App)
*   **Status**: created locally.
*   **Location**: `Desktop/BlueLimeUniverse/bluelimeuniverse` (User moving it to Desktop).
*   **Tech**: Next.js 14, App Router, Tailwind.
*   **Structure**: `/labs`, `/market`, `/editor`, `/leads`, `/ads`, `/sender`, `/analytics` (Placeholders created).
*   **DNS**: `bluelimeuniverse.com` -> `49.13.39.75` (Floating IP).

## 4. Next Immediate Steps
1.  **GitHub Push**: Initialize git in the new `bluelimeuniverse` folder and push to GitHub.
2.  **Coolify Deployment**:
    *   Deploy `BlueLimeUniverse` from GitHub to Coolify.
    *   **Crucial**: Bind it specifically to IP `49.13.39.75` to keep reputation clean.
3.  **Mailcow Domain Fix**: Apply the fix in `debug_analysis_domain_fix.md` to restore `https://mail.bluelimeflow.com`.

## 5. Active Artifacts (To Load)
*   `task.md` (Progress Tracking)
*   `unified_architecture_plan.md` (Master Plan)
*   `debug_analysis_domain_fix.md` (Mailcow Repair Manual)
