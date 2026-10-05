-- Allow an authenticated registrant to view only documents
-- stored under their own registration UUID folder.
create policy "Users can view own registration documents"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'dokumen-pendaftaran'
  and exists (
    select 1
    from public.registrations r
    where r.id::text = (storage.foldername(name))[1]
      and r.user_id = (select auth.uid())
  )
);
