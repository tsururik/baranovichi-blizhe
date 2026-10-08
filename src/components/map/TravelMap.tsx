import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Tooltip, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Expand, Route as RouteIcon, Clock3 } from 'lucide-react';
import { routes,getStops } from '../../data/routes';
import type { TravelRoute } from '../../data/routes';
import { attractions,destination } from '../../data/attractions';
import { getWaypoints } from '../../lib/routing';
import type { RoadGeometry } from '../../lib/routing';
import { site } from '../../config/site';
import Photo from '../Photo';
// Marker glyphs are inline SVG (Lucide paths) so they stay crisp and match the rest of the icons.
const svg=(paths:string,size:number)=>`<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
const flag='<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/>';
const train='<path d="M8 3.1V7a4 4 0 0 0 8 0V3.1"/><path d="m9 15-1-1"/><path d="m15 15 1-1"/><path d="M9 19c-2.8 0-5-2.2-5-5v-4a8 8 0 0 1 16 0v4c0 2.8-2.2 5-5 5Z"/><path d="m8 19-2 3"/><path d="m16 19 2 3"/>';
const pin=(kind:'origin'|'stop'|'extra'|'finish',color:string,size:number,content='')=>L.divIcon({className:'custom-map-marker',html:`<span class="map-pin ${kind}" style="--pin-color:${color}">${content}</span>`,iconSize:[size,size],iconAnchor:[size/2,size/2]});
const finishIcon=pin('finish','#22463a',34,svg(flag,16));
const allPoints=routes.flatMap(getWaypoints);
function Controller({route,overview,focused,presentation}:{route:TravelRoute;overview:boolean;focused:string|null;presentation:boolean}){
 const map=useMap(); const first=useRef(true);
 // The first fit happens without animation: the map should simply open on the route.
 useEffect(()=>{map.closePopup();const id=setTimeout(()=>{const animate=!first.current&&!matchMedia('(prefers-reduced-motion: reduce)').matches;first.current=false;map.invalidateSize();if(focused){const s=attractions[focused];map.flyTo([s.latitude,s.longitude],12,{animate,duration:.7});}else{map.flyToBounds(overview?allPoints:getWaypoints(route),{padding:[45,45],maxZoom:10,animate,duration:.8});}},80);return()=>clearTimeout(id);},[map,route,overview,focused,presentation]);
 useEffect(()=>{const observer=new ResizeObserver(()=>map.invalidateSize());observer.observe(map.getContainer());return()=>observer.disconnect();},[map]);
 useEffect(()=>{map.attributionControl?.setPrefix('<a href="https://leafletjs.com">Leaflet</a>')},[map]);return null;
}
export default function TravelMap({route,overview,setOverview,focused,onFocus,onSelect,presentation,geometries,optional}:{route:TravelRoute;overview:boolean;setOverview:(v:boolean)=>void;focused:string|null;onFocus:(id:string)=>void;onSelect:(route:TravelRoute)=>void;presentation:boolean;geometries:Record<string,RoadGeometry|null>;optional:boolean}){
 const [tileError,setTileError]=useState(false); const markerRefs=useRef<Record<string,L.Marker|null>>({});
 useEffect(()=>{if(!focused)return;const id=setTimeout(()=>markerRefs.current[focused]?.openPopup(),850);return()=>clearTimeout(id)},[focused,route]);
 const stops=getStops(route); if(optional)stops.push({...attractions.railway,order:stops.length+1});
 return <div className="map-shell"><MapContainer center={[53.6,27.5]} zoom={7} minZoom={5} maxZoom={18} zoomSnap={0.25} scrollWheelZoom={false} fadeAnimation={false} className="travel-map" aria-label="Interactive map of routes across Belarus"><TileLayer url={site.tileUrl} attribution={site.tileAttribution} eventHandlers={{tileerror:()=>setTileError(true),tileload:()=>setTileError(false)}}/><Controller route={route} overview={overview} focused={focused} presentation={presentation}/>{[...routes.filter(r=>r.id!==route.id),route].map(r=><Polyline key={r.id} positions={geometries[r.id]?.geometry.coordinates.map(([lon,lat])=>[lat,lon] as [number,number])??getWaypoints(r)} pathOptions={{color:r.color,weight:r.id===route.id?5:3,opacity:r.id===route.id?.95:.28,dashArray:geometries[r.id]?undefined:'8 9'}} eventHandlers={{click:()=>onSelect(r)}}/>)}{routes.map(r=><Marker key={r.id} position={r.originCoordinates} icon={pin('origin',r.color,16)} eventHandlers={{click:()=>onSelect(r)}} title={`Route from ${r.origin}`}><Tooltip permanent direction="top" offset={[0,-10]} className="city-label">{r.origin}</Tooltip></Marker>)}<Marker position={[destination.latitude,destination.longitude]} icon={finishIcon} title="Baranovichi, the finish"><Tooltip permanent direction="bottom" offset={[0,19]} className="destination-label">Baranovichi</Tooltip><Popup><b>Baranovichi</b><p>The finish of every route. The Railway Equipment Museum is an optional extra tour.</p></Popup></Marker>{stops.map(s=><Marker key={s.id} ref={ref=>{markerRefs.current[s.id]=ref}} position={[s.latitude,s.longitude]} icon={s.id==='railway'?pin('extra',route.color,30,svg(train,15)):pin('stop',route.color,28,String(s.order))} title={s.name} eventHandlers={{click:()=>onFocus(s.id)}}><Popup minWidth={245} maxWidth={280}><Photo src={s.image} alt={s.name} className="popup-photo"/><b>{s.name}</b><p>{s.description}</p><span className="popup-duration"><Clock3 size={14}/>{s.visitDuration}</span></Popup></Marker>)}</MapContainer><button className="map-overview" onClick={()=>setOverview(true)}><Expand size={16}/>Show all routes</button><div className="map-key"><RouteIcon size={15}/>{geometries[route.id]?'Driving route':'Dashed line: route outline'}</div>{tileError&&<div className="map-error" role="status">The base map is unavailable. Check your internet connection; the stops and the program are still here.</div>}</div>;
}
