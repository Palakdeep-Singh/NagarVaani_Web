import os, traceback
from dotenv import load_dotenv
load_dotenv()
from supabase import create_client
sb = create_client(os.getenv('SUPABASE_URL'), os.getenv('SUPABASE_SERVICE_KEY'))

try:
    result = sb.table('users').upsert({
        'phone': '7388975628',
        'full_name': 'Test User',
        'gender': 'Male',
        'profile_complete': True,
    }, on_conflict='phone').execute()
    print(f"SUCCESS: {len(result.data)} rows")
except Exception as e:
    print(f"ERROR: {e}")
    traceback.print_exc()
