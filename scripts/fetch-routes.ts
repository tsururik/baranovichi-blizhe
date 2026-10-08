import { mkdir, writeFile } from 'node:fs/promises';
import { routes } from '../src/data/routes';
import { fetchRoadGeometry } from '../src/lib/routing';
const base=process.env.ROUTING_BASE_URL;
if(!base){console.error('Укажите ROUTING_BASE_URL — адрес собственного или согласованного OSRM-совместимого сервиса. Без него сайт использует пунктирную схему.');process.exit(1);}
await mkdir('public/routes',{recursive:true});
for(const route of routes){try {const data=await fetchRoadGeometry(route,base,process.env.ROUTING_DEMO_ONLY==='true');await writeFile(`public/routes/${route.id}.geojson`,JSON.stringify(data));console.log(`${route.id}: ${Math.round(data.properties.distanceMeters/1000)} km`);}catch(error){console.error(`${route.id}: оставлена схематическая линия.`,error instanceof Error?error.message:error);}await new Promise(resolve=>setTimeout(resolve,1100));}
