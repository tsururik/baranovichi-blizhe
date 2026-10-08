import { destination } from '../data/attractions';
import { getStops } from '../data/routes';
import type { TravelRoute } from '../data/routes';
export type RoadGeometry = { type: 'Feature'; geometry: { type: 'LineString'; coordinates: [number,number][] }; properties: { routeId: string; source: string; fetchedAt: string; distanceMeters: number; durationSeconds: number; demoOnly: boolean; } };
export const getWaypoints = (route: TravelRoute): [number,number][] => [route.originCoordinates,...getStops(route).map(s=>[s.latitude,s.longitude] as [number,number]),[destination.latitude,destination.longitude]];
export function validGeometry(value: unknown, id: string): value is RoadGeometry {
 const g=value as RoadGeometry;
 return !!g && g.type==='Feature' && g.geometry?.type==='LineString' && g.properties?.routeId===id && Number.isFinite(g.properties.distanceMeters) && g.properties.distanceMeters>0 && Number.isFinite(g.properties.durationSeconds) && g.properties.durationSeconds>0 && Array.isArray(g.geometry.coordinates) && g.geometry.coordinates.length>2 && g.geometry.coordinates.every(p=>Array.isArray(p)&&p.length===2&&p.every(Number.isFinite)&&p[0]>=22&&p[0]<=33&&p[1]>=51&&p[1]<=57);
}
export async function loadRoadGeometry(route: TravelRoute, signal?: AbortSignal): Promise<RoadGeometry|null> {
 try {const response=await fetch(`routes/${route.id}.geojson`,{signal});if(!response.ok)return null;const data:unknown=await response.json();return validGeometry(data,route.id)?data:null;}catch{return null;}
}
// This adapter runs in the preparation script, never against a public routing demo on page load.
export async function fetchRoadGeometry(route: TravelRoute, baseUrl: string, demoOnly = false): Promise<RoadGeometry> {
 const points=getWaypoints(route).map(([lat,lon])=>`${lon},${lat}`).join(';');
 const response=await fetch(`${baseUrl.replace(/\/$/,'')}/route/v1/driving/${points}?overview=full&geometries=geojson&steps=false`,{signal:AbortSignal.timeout(25000)});
 if(!response.ok)throw new Error(`Routing HTTP ${response.status}`);
 const data=await response.json(); const road=data.routes?.[0];
 if(data.code!=='Ok'||!road)throw new Error('No road geometry');
 const result:RoadGeometry={type:'Feature',geometry:road.geometry,properties:{routeId:route.id,source:baseUrl,fetchedAt:new Date().toISOString(),distanceMeters:road.distance,durationSeconds:road.duration,demoOnly}};
 if(!validGeometry(result,route.id))throw new Error('Invalid road geometry');return result;
}
export const roadLabel = (geometry: RoadGeometry|null|undefined) => geometry ? `${Math.round(geometry.properties.distanceMeters/1000)} km · ≈ ${Math.floor(geometry.properties.durationSeconds/3600)} h ${Math.round(geometry.properties.durationSeconds%3600/60)} min driving` : 'Route outline · distance to be confirmed';
