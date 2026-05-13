Steps to migrate existing uploaded files to Supabase Storage

1. Create a public bucket in Supabase (e.g. "uploads").
2. Create or get a Service Role Key (SUPABASE_KEY) from Supabase Project Settings -> API (use with care).
3. In your local shell or CI, set env vars:

   SUPABASE_URL=https://<your-project>.supabase.co
   SUPABASE_KEY=<service-role-key>
   SUPABASE_BUCKET=uploads

4. Run the script from the demo folder:

   python tools/upload_to_supabase.py

5. The script will print public URLs for uploaded files. You can then:
   - Update DB records to point to those public URLs, or
   - Keep DB as-is; your backend will automatically use SUPABASE when env vars are present, so new uploads will use Supabase while old ones will stay local until migrated.

Security note: Do NOT commit the service role key. Use Render environment variables for production.
