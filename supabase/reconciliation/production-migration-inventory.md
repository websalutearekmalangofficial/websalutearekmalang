# Supabase Production Reconciliation Inventory

Generated from a read-only comparison on 2026-10-26.
Project ref: `yfhbokrybbcbxgafjdhi`
Repository baseline: `main` at `6d31aa72c5ae73dbd97f3590bd5d41300019955c`
Audit branch: `chore/supabase-reconciliation-validation`

## Safety decision

**Do not deploy migrations from this branch to production yet.** The production migration history and repository migration filenames are not a one-to-one match. Supabase's migration history lists versions/names, but does not expose the original SQL text for each applied migration. Missing SQL must be recovered from a trusted historical source or reconstructed from schema diff and reviewed as a new forward-only migration. Do not fabricate old migration files or mark applied versions as newly applied.

## Applied migration history reported by Supabase

| Version | Database migration name | Exact version file seen in repository listing? |
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
| 20261005022013 | add_user_dashboard_account_fields | No exact version (related file exists under a different version) |
| 20261005075545 | allow_admin_insert_sections | No exact version (related file exists under a different version) |
| 20261005080153 | allow_admin_insert_section_items | No exact version (related file exists under a different version) |
| 20261008185013 | duplicate_page_copies_homepage_template_and_hero_banners | Yes |
| 20261018165750 | restrict_duplicate_page_execution_to_authenticated_admins | Yes |
| 20261018180040 | disable_duplicate_page_function | Yes |
| 20261018180043 | revoke_duplicate_page_execution | Yes |
| 20261018223357 | setup_kemahasiswaan_editorial_cms_sections | No exact version (related file exists under a different version) |

"Yes" means a filename with that exact timestamp was visible in the inspected repository listing; it does not prove the SQL contents are identical to production. All SQL files still require content review.

## Edge Function source reconciliation

| Function | Production version | Repository state before audit | Audit branch action |
|---|---:|---|---|
| `send-whatsapp-registration` | 4 | Missing | Added exact active source |
| `submit-registration` | 1 | Present, content differed | Updated to exact active source |
| `create-registrant-account` | 4 | Present, content matched | No change needed |
| `manage-registrant-account` | 1 | Missing | Added exact active source |

The active functions' `verify_jwt` settings are: submit-registration=false; send-whatsapp-registration=false; create-registrant-account=true; manage-registrant-account=true. Those settings are recorded here for reconciliation; they are not changed by this branch.

## Next steps before production approval

1. Recover exact SQL for missing migration versions from a trusted backup, prior commits, or an authoritative schema/migration export.
2. Compare each SQL file's effects to current schema, policies, storage buckets, triggers, and functions.
3. For historical SQL that cannot be recovered, generate and review a new forward-only reconciliation migration from the live schema; do not backdate or fake history.
4. Validate in a non-production Supabase project.
5. Open a pull request and require human review before any production deployment.
6. Configure production secrets only in GitHub Actions/Vercel/Supabase secret stores; never commit credentials.

## Automation boundary

The accompanying GitHub Actions workflow is **validation-only**. It does not authenticate to Supabase, run migrations, deploy Edge Functions, or change production data.
