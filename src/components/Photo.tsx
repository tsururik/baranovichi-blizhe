import { useState } from 'react';
import { ImageOff } from 'lucide-react';
export default function Photo({src,alt,className='',eager=false}:{src:string;alt:string;className?:string;eager?:boolean}) {
 const [failed,setFailed]=useState(false);
 return failed ? <div className={`photo-fallback ${className}`} role="img" aria-label={alt}><ImageOff size={28}/><span>{alt}</span><small>Фотография появится здесь</small></div> : <img className={className} src={src} alt={alt} loading={eager?'eager':'lazy'} onError={()=>setFailed(true)}/>;
}
