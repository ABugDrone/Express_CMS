import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
const t = await p.theme.findFirst({where:{isActive:true}});
console.log('cssContent starts with:', JSON.stringify(t.cssContent).substring(0, 80));
await p.$disconnect();
