create policy "Admins can insert sections"
on public.sections
for insert
to authenticated
with check (private.has_role((select auth.uid()), 'admin'::app_role));
