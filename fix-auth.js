const fs = require('fs');
const files = [
"apps/web/app/api/tenant/dashboard/route.ts",
"apps/web/app/api/landlord/settings/route.ts",
"apps/web/app/api/landlord/tenants/route.ts",
"apps/web/app/api/landlord/units/route.ts",
"apps/web/app/api/landlord/units/[id]/route.ts",
"apps/web/app/api/landlord/invite-codes/route.ts",
"apps/web/app/api/landlord/building/route.ts",
"apps/web/app/api/landlord/building/[id]/route.ts",
"apps/web/app/api/payments/route.ts",
"apps/web/app/api/leases/route.ts",
"apps/web/app/api/leases/[id]/route.ts",
"apps/web/app/api/notifications/route.ts"
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  if (content.includes('req.nextUrl.searchParams.get("landlordId")')) {
    content = content.replace(/const landlordId = req\.nextUrl\.searchParams\.get\("landlordId"\);/g, 'const session = await getSession();\n    const landlordId = session?.id;');
    changed = true;
  }
  
  if (content.includes('req.nextUrl.searchParams.get("tenantId")')) {
    content = content.replace(/const tenantId = req\.nextUrl\.searchParams\.get\("tenantId"\);/g, 'const session = await getSession();\n        const tenantId = session?.id;');
    changed = true;
  }
  
  if (content.includes('req.nextUrl.searchParams.get("userId")')) {
    content = content.replace(/const userId = req\.nextUrl\.searchParams\.get\("userId"\);/g, 'const session = await getSession();\n        const userId = session?.id;');
    changed = true;
  }

  
  if (content.includes('validation.data') && content.includes('landlordId')) {
    content = content.replace(/const {([^}]*)landlordId([^}]*)} = validation\.data;/, 'const session = await getSession();\n        const landlordId = session?.id;\n        const {$1 $2} = validation.data;');
    changed = true;
  }

  if (changed) {
    if (!content.includes('import { getSession }')) {
      content = 'import { getSession } from "@/lib/auth";\n' + content;
    }
    fs.writeFileSync(file, content, 'utf8');
    
  }
}
