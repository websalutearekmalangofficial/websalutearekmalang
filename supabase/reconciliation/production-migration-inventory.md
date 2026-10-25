# Supabase Production Reconciliation Inventory

Generated from read-only inspection on 2026-10-26.
Project ref: `yfhbokrybbcbxgafjdhi`
Repository baseline: `main` at `6d31aa72c5ae73dbd97f3590bd5d41300019955c`
Audit branch: `chore/supabase-reconciliation-validation`

## Safety decision

**Production Supabase migration/function deployment remains blocked pending review.** This branch has no database deployment commands. The current schema, RLS policies, storage buckets, and function metadata were inspected read-only. No confirmed schema delta has yet been established that justifies a new DDL migration; creating a speculative migration could alter applicant data access or storage security.

## Applied migration history reported by Supabase

| Version | Database migration name | Exact-version SQL file present in GitHub main? |
|---|---|---|
| 20260908050226 | 88741e57-9d85-49fd-9b32-ee47a0380cc0 | Yes |
| 20260908050253 | f2a271ad-0a64-4924-8b6f-92a8d5a8bf0f | Yes |
| 20260908050351 | ca11bfad-0590-43d8-8980-e0fcc045c2a0 | Yes |
| 20260909001141 | 7e77eaed-5247-490d-9bf6-78db6a7efa27 | No |
| 20260921124323 | enforce_registration_rate_limit | No |
| 20260921124459 | move_registration_rate_limit_private | No |
| 20260921124629 | optimize_media_library_policy | No |
| 20260921171453 | optimize_registration_rate_limit | No |
| 20260921180000 | enforce_single_admin | No |
| 20260921181500 | harden_has_role | No |
| 20260921183000 | create_cms_media_bucket | No |
| 20260921184432 | add_whatsapp_registration_messaging | No |
| 20260921184500 | harden_media_library | No |
| 20260927000613 | enable_cms_realtime | No |
| 20260927085404 | admin_settings_center | No |
| 20260927085408 | enable_admin_settings_realtime | No |
| 20261001180757 | create_dokumen_pendaftaran_storage_bucket | No |
| 20261001183349 | allow_public_registration_document_uploads | No |
| 20261001185407 | grant_has_role_to_authenticated | No |
| 20261001185754 | restore_public_registration_insert_policy | No |
| 20261001234432 | add_public_site_logo_setting | No |
| 20261002144238 | add_footer_content_setting | No |
| 20261005022013 | add_user_dashboard_account_fields | No exact-version file; historical commit contains similar SQL under a different timestamp |
| 20261005075545 | allow_admin_insert_sections | No exact-version file |
| 20261005080153 | allow_admin_insert_section_items | No exact-version file |
| 20261008185013 | duplicate_page_copies_homepage_template_and_hero_banners | Yes |
| 20261018165750 | restrict_duplicate_page_execution_to_authenticated_admins | Yes |
| 20261018180040 | disable_duplicate_page_function | Yes |
| 20261018180043 | revoke_duplicate_page_execution | Yes |
| 20261018223357 | setup_kemahasiswaan_editorial_cms_sections | No exact-version file; similarly named file has a different timestamp |

Supabase's migration-history listing exposes version/name metadata, not the original SQL text. A filename with an exact timestamp does not by itself prove the SQL is identical to what was applied in production.

## Historical SQL recovery results

- Recovered the SQL body for `duplicate_page` from commit [9d7167c](https://github.com/websalutearekmalangofficial/websalutearekmalang/commit/9d7167cd476adbb4f0a7cc64efec17c5dd13bb71). The body matches the migration file recorded at version `20261008185013`; it checks admin role, validates slug/title, clones page sections/items, and copies hero banners. Later applied migrations disable/revoke this function, so do not redeploy this older function migration independently.
- Found the user-dashboard schema/policy SQL in historical commit [ca79c4c](https://github.com/websalutearekmalangofficial/websalutearekmalang/commit/ca79c4c1313d922f833142a28186e897eb539cdd), but its file timestamp is `20261005030000`, not the production history version `20261005022013`. Treat it as historical evidence, not as proof of exact original SQL for that applied version. It adds profile username/password-change fields, a lower(username) unique index, registration user_id uniqueness, and applicant/profile select/update policies.
- The remaining missing SQL has not yet been recovered from a source that proves exact version/content. Do not fabricate historical migration files or mark them as newly applied.

## Production schema / RLS / Storage observations

- Public application tables observed with RLS enabled include `user_roles`, `profiles`, `pages`, `sections`, `section_items`, `nav_items`, `media_library`, `registrations`, `whatsapp_templates`, `whatsapp_messages`, `admin_settings`, `hero_banners`, and `announcements`.
- Storage buckets: `cms-media` is public with a 50 MiB file limit; `dokumen-pendaftaran` is private with a 10 MiB limit and allowed MIME types PDF/JPEG/JPG. Do not change these policies or visibility without a separate security review.
- RLS policy inventory was queried directly from `pg_policies`. Public read policies are intentionally limited to active/published CMS content and selected public settings; admin management policies generally check `private.has_role(auth.uid(), 'admin'::app_role)`. Applicant registration/profile policies include own-record restrictions. The complete policy output remains in the audit execution, not this summary.
- Four active Edge Functions are tracked in this branch: `submit-registration` (production version 1, `verify_jwt=false`), `send-whatsapp-registration` (version 4, `verify_jwt=false`), `create-registrant-account` (version 4, `verify_jwt=true`), and `manage-registrant-account` (version 1, `verify_jwt=true`). Active source has been copied/reconciled in the audit branch; it has not been deployed.
- Security advisor findings still need separate review: mutable search_path on `set_hero_banners_updated_at` and `generate_registration_reference`; authenticated execution of SECURITY DEFINER functions `claim_first_admin()` and `has_role(...)`; leaked-password protection disabled. Do not silently modify these while restoring migrations because that changes security behavior.

## Edge Function source reconciliation

| Function | Production version | Audit branch action |
|---|---:|---|
| `send-whatsapp-registration` | 4 | Added exact active source |
| `submit-registration` | 1 | Updated to match active source |
| `create-registrant-account` | 4 | Existing source matched |
| `manage-registrant-account` | 1 | Added exact active source |

## Validation and deployment status

- The repository-structure validation passed on the first workflow run.
- The Edge Function type-check then failed because the workflow had not installed npm dependencies; it reported that `@supabase/supabase-js` could not be found in `node_modules`. The workflow was updated to install project dependencies before running `deno check`. A new validation run is queued; do not claim CI has passed until its result is green.
- Vercel preview deployment is separate from a Supabase migration/function deployment. The branch has not been merged to `main`, and no production database migration, Edge Function deployment, or production Vercel deployment was performed during this audit.

## Forward-only migration decision

A forward-only reconciliation migration should be created only after a reviewed schema diff identifies specific missing columns, constraints, indexes, policies, triggers, functions, or bucket configuration. The current evidence documents live schema and security state but does not yet establish a safe, complete delta for DDL. Therefore no speculative migration has been added or applied. Next: export a trusted schema snapshot (including policy definitions, triggers, function definitions, and Storage policies), compare it against version-controlled SQL, recover remaining SQL from trusted backups/commits, then validate the reviewed forward-only migration in a non-production Supabase project.

## Automation boundary

The GitHub Actions workflow is **validation-only**. It does not authenticate to Supabase, run migrations, deploy Edge Functions, or change production data.
