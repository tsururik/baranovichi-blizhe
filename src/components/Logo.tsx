// Brand mark: a route from a departure city (ring) to Baranovichi (filled dot).
export default function Logo({size=32}:{size?:number}){
 return <svg className="brand-mark" width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true"><circle cx="8" cy="7" r="3.25" stroke="currentColor" strokeWidth="2"/><path d="M8 10.5V13a6 6 0 0 0 6 6h4a6 6 0 0 1 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><circle className="brand-mark-finish" cx="24" cy="26.5" r="3.5"/></svg>;
}
