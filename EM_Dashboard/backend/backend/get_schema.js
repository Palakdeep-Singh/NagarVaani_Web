import { createClient } from " @supabase/supabase-js\;
dotenv.config();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
async function main() { const { data } = await supabase.rpc(\get_table_columns\, { table_name: \complaints\ }); console.log(JSON.stringify(data, null, 2)); process.exit(0); }
main();
