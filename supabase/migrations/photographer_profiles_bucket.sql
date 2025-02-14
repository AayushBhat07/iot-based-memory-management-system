
-- Create the photographer-profiles storage bucket
insert into storage.buckets (id, name)
values ('photographer-profiles', 'photographer-profiles');

-- Set up security policies
create policy "Users can view their own profile images"
  on storage.objects for select
  using ( bucket_id = 'photographer-profiles' );

create policy "Users can upload profile images"
  on storage.objects for insert
  with check (
    bucket_id = 'photographer-profiles' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can update their profile images"
  on storage.objects for update
  using (
    bucket_id = 'photographer-profiles' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
