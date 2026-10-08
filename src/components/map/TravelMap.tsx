import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Tooltip, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Expand, MapPin } from 'lucide-react';
import { routes,getStops } from '../../data/routes';
import type { TravelRoute } from '../../data/routes';
import { attractions,destination } from '../../data/attractions';
import { getWaypoints } from '../../lib/routing';
import type { RoadGeometry } from '../../lib/routing';
import { site } from '../../config/site';
import Photo from '../Photo';
const stopIcon=(label:string,color:string,finish=false)=>L.divIcon({className:'custom-map-marker',html:`<span class="map-pin ${finish?'finish':''}" style="--pin-color:${color}">${label}</span>`,iconSize:[34,34],iconAnchor:[17,17]});
const allPoints=routes.flatMap(getWaypoints);
function Controller({route,overview,focused,presentation}:{route:TravelRoute;overview:boolean;focused:string|null;presentation:boolean}){
 const map=useMap();
 useEffect(()=>{const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;map.closePopup();const id=setTimeout(()=>{map.invalidateSize();if(focused){const s=attractions[focused];map.flyTo([s.latitude,s.longitude],12,{animate:!reduced,duration:.7});}else{map.flyToBounds(overview?allPoints:getWaypoints(route),{padding:[45,45],maxZoom:10,animate:!reduced,duration:.8});}},80);return()=>clearTimeout(id);},[map,route,overview,focused,presentation]);
 useEffect(()=>{const observer=new ResizeObserver(()=>map.invalidateSize());observer.observe(map.getContainer());return()=>observer.disconnect();},[map]);return null;
}
export default function TravelMap({route,overview,setOverview,focused,onFocus,onSelect,presentation,geometries,optional}:{route:TravelRoute;overview:boolean;setOverview:(v:boolean)=>void;focused:string|null;onFocus:(id:string)=>void;onSelect:(route:TravelRoute)=>void;presentation:boolean;geometries:Record<string,RoadGeometry|null>;optional:boolean}){
 const [tileError,setTileError]=useState(false); const markerRefs=useRef<Record<string,L.Marker|null>>({});
 useEffect(()=>{if(!focused)return;const id=setTimeout(()=>markerRefs.current[focused]?.openPopup(),850);return()=>clearTimeout(id)},[focused,route]);
 const stops=getStops(route); if(optional)stops.push({...attractions.railway,order:stops.length+1});
 return <div className="map-shell"><MapContainer center={[53.6,27.5]} zoom={7} minZoom={5} maxZoom={18} scrollWheelZoom={false} fadeAnimation={false} className="travel-map" aria-label="Интерактивная карта маршрутов по Беларуси"><TileLayer url={site.tileUrl} attribution={site.tileAttribution} eventHandlers={{tileerror:()=>setTileError(true),tileload:()=>setTileError(false)}}/><Controller route={route} overview={overview} focused={focused} presentation={presentation}/>{[...routes.filter(r=>r.id!==route.id),route].map(r=><Polyline key={r.id} positions={geometries[r.id]?.geometry.coordinates.map(([lon,lat])=>[lat,lon] as [number,number])??getWaypoints(r)} pathOptions={{color:r.color,weight:r.id===route.id?5:3,opacity:r.id===route.id?.95:.28,dashArray:geometries[r.id]?undefined:'8 9'}} eventHandlers={{click:()=>onSelect(r)}}/>)}{routes.map(r=><Marker key={r.id} position={r.originCoordinates} icon={stopIcon('•',r.color)} eventHandlers={{click:()=>onSelect(r)}} title={`Маршрут из города ${r.origin}`}><Tooltip permanent direction="top" offset={[0,-16]} className="city-label">{r.origin}</Tooltip></Marker>)}<Marker position={[destination.latitude,destination.longitude]} icon={stopIcon('Б','#244a38',true)} title="Барановичи — финиш"><Tooltip permanent direction="bottom" offset={[0,17]} className="destination-label">Барановичи</Tooltip><Popup><b>Барановичи — мы приехали!</b><p>Музей железнодорожной техники — дополнительная экскурсия по желанию.</p></Popup></Marker>{stops.map(s=><Marker key={s.id} ref={ref=>{markerRefs.current[s.id]=ref}} position={[s.latitude,s.longitude]} icon={stopIcon(s.id==='railway'?'+':String(s.order),route.color)} title={s.name} eventHandlers={{click:()=>onFocus(s.id)}}><Popup minWidth={245} maxWidth={280}><Photo src={s.image} alt={s.name} className="popup-photo"/><b>{s.name}</b><p>{s.description}</p><span className="popup-duration">◷ {s.visitDuration}</span></Popup></Marker>)}</MapContainer><button className="map-overview" onClick={()=>setOverview(true)}><Expand size={16}/>Показать все маршруты</button><div className="map-key"><MapPin size={15}/>{geometries[route.id]?'Автомобильный маршрут':'Пунктир — схема маршрута'}</div>{tileError&&<div className="map-error" role="status">Подложка карты недоступна. Проверьте интернет; остановки и программа сохранены.</div>}</div>;
}
