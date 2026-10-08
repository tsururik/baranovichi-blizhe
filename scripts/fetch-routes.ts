import { mkdir, writeFile } from 'node:fs/promises';
import { routes } from '../src/data/routes';
import { fetchRoadGeometry } from '../src/lib/routing';
const base=process.env.ROUTING_BASE_URL;
if(!base){console.error('Set ROUTING_BASE_URL to your own or an approved OSRM-compatible service. Without it, the site uses the dashed route outline.');process.exit(1);}
await mkdir('public/routes',{recursive:true});
for(const route of routes){try {const data=await fetchRoadGeometry(route,base,process.env.ROUTING_DEMO_ONLY==='true');await writeFile(`public/routes/${route.id}.geojson`,JSON.stringify(data));console.log(`${route.id}: ${Math.round(data.properties.distanceMeters/1000)} km`);}catch(error){console.error(`${route.id}: keeping the schematic line.`,error instanceof Error?error.message:error);}await new Promise(resolve=>setTimeout(resolve,1100));}
