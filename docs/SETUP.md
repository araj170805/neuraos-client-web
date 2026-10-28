# NeuraOS alpha: setup runbook

Deploys from `swaindhruti/neuraos-client-web`, branch `alpha-launch`. The company repo is not involved.
Cloud commands run in **Cloud Shell** (Google Cloud console, `>_` icon), never on a laptop.

## Done
- [x] Google sign-in enabled, `localhost` authorized
- [x] Storage bucket `neuraos.firebasestorage.app` (asia-south1)
- [x] APIs enabled, admin key can call Gemini (`roles/aiplatform.user`)
- [x] Bucket CORS for `http://localhost:3000`
- [x] Budget alerts
- [x] Repo: `.env.local`, key in `.secrets/` (both gitignored), database id `neuraos` wired in

## Before any local testing (once, in this order)
Nothing reads correctly until these three are done: a new database denies every read, the app expects `config/app`, and the account and admin queries need composite indexes.

1. **Publish the rules.** Firebase console:
   - Firestore → database **neuraos** → **Rules** → paste `firestore.rules` → **Publish**
   - Storage → **Rules** → paste `storage.rules` → **Publish**
2. **Create the config document:** `bun run seed:config` in the repo (uses `.env.local`). Or by hand: Firestore → **neuraos** → **Data** → collection `config`, document `app`:

   | Field | Type | Value |
   | --- | --- | --- |
   | `aiEnabled` | boolean | `true` |
   | `groupsEnabled` | boolean | `false` (turn on when groups are merged and tested) |
   | `contributionsEnabled` | boolean | `true` |
   | `dailySpendCapUsd` | number | `15` |

3. **Create the 4 composite indexes** (same as `firestore.indexes.json`). Firestore → database **neuraos** → **Indexes** → **Composite** → **Create index**, scope *Collection*:

   | Collection | Field 1 | Field 2 |
   | --- | --- | --- |
   | `verificationApplications` | `status` Ascending | `submittedAt` Descending |
   | `contributions` | `status` Ascending | `submittedAt` Descending |
   | `contributions` | `contributorUid` Ascending | `createdAt` Descending |
   | `chats` | `memberIds` Arrays | `lastMessageAt` Descending |

   Each takes a few minutes to build. A query that still lacks an index fails with "The query requires an index": browser queries log the create link in the browser console, server queries (admin lists) in the `bun run dev` terminal. Add any new index to `firestore.indexes.json` too.

## Local test
Setup per machine: README "Local setup with real Firebase". Then `bun run dev`:
- Sign in with Google once, run `bun run set-admin <your-email>`, sign out and back in.
- Run the launch criteria in `docs/SPEC.md` section 1 and the checklists in section 16.

## Deploy (after local testing passes)
1. **apphosting.yaml** in the repo with all env values from `.env.local` except `GOOGLE_APPLICATION_CREDENTIALS`. Push `alpha-launch` to origin.
2. **Firebase console → App Hosting → Create backend**: GitHub repo `swaindhruti/neuraos-client-web`, live branch `alpha-launch`, nearest region offered. Wait for the first rollout.
3. **Cloud Shell**, give the app's service account its roles:

   ```bash
   gcloud config set project neuraos
   SA=firebase-app-hosting-compute@neuraos.iam.gserviceaccount.com
   gcloud projects add-iam-policy-binding neuraos --member=serviceAccount:$SA --role=roles/aiplatform.user
   gcloud projects add-iam-policy-binding neuraos --member=serviceAccount:$SA --role=roles/datastore.user
   gcloud projects add-iam-policy-binding neuraos --member=serviceAccount:$SA --role=roles/firebaseauth.admin
   gcloud storage buckets add-iam-policy-binding gs://neuraos.firebasestorage.app --member=serviceAccount:$SA --role=roles/storage.objectAdmin
   gcloud iam service-accounts add-iam-policy-binding $SA --member=serviceAccount:$SA --role=roles/iam.serviceAccountTokenCreator
   ```

4. **Live domain**:
   - Authentication → Settings → Authorized domains → add the App Hosting URL (`*.hosted.app`).
   - Cloud Shell, CORS with the live URL added (replace `<APP_URL>`):

     ```bash
     cat > cors.json <<'JSON'
     [{"origin":["http://localhost:3000","https://<APP_URL>"],"method":["GET","PUT"],"responseHeader":["Content-Type"],"maxAgeSeconds":3600}]
     JSON
     gcloud storage buckets update gs://neuraos.firebasestorage.app --cors-file=cors.json
     ```

5. App Hosting → **Rollouts** → start a new rollout so the roles apply. Run the launch criteria again on the live URL.

## Later (optional)
App Check enforcement, Model Armor floor setting.
