
-- Create the photographer-uploads storage bucket
insert into storage.buckets (id, name)
values ('photographer-uploads', 'photographer-uploads');

-- Set up security policies
create policy "Anyone can view photographer uploads"
  on storage.objects for select
  using ( bucket_id = 'photographer-uploads' );

create policy "Authenticated users can upload photos"
  on storage.objects for insert
  with check ( bucket_id = 'photographer-uploads' AND auth.role() = 'authenticated' );
