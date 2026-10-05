create policy "Admins can insert items"
on public.section_items
for insert
to authenticated
with check (private.has_role((select auth.uid()), 'admin'::app_role));
