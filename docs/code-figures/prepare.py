import json,textwrap
from pathlib import Path
spec=[('01-client','src/services/supabase.ts',1,19),('02-schema','supabase/migrations/20261021062416_create_daily_checkins.sql',1,30),('03-checkin','src/services/dailyCheckins.ts',25,43),('04-diary','src/services/cloudData.ts',100,118),('05-context','src/context/AppContext.tsx',109,132)]
items=[]
for name,path,a,b in spec:
 lines=Path(path).read_text().splitlines();rows=[]
 for n in range(a,min(b,len(lines))+1):
  line=lines[n-1];chunks=textwrap.wrap(line,width=78,replace_whitespace=False,drop_whitespace=False) or ['']
  for j,chunk in enumerate(chunks):rows.append({'number':str(n) if j==0 else '↳','text':chunk})
 items.append({'name':name,'path':path,'range':f'{a}–{min(b,len(lines))}','rows':rows})
Path('docs/code-figures/snippets.json').write_text(json.dumps(items,ensure_ascii=False))
