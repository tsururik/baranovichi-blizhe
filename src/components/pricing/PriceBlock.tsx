import { GraduationCap } from 'lucide-react';
import { pricing } from '../../config/pricing';
import { money, studentPrice } from '../../lib/pricing';
// Starting price and student price of one route; both come from the pricing config.
export default function PriceBlock({base,large=false}:{base:number;large?:boolean}){
 if(!pricing.enabled)return <p className="price-pending">Price to be confirmed</p>;
 return <div className={large?'price-block large':'price-block'}><p className="price-label">{pricing.label}</p><p className="price-base"><b>{money(base)}</b> {pricing.currency} <span>per person</span></p><p className="price-student"><GraduationCap size={16}/>Students −{pricing.studentDiscountPercent}% <b>{money(studentPrice(base))} {pricing.currency}</b></p></div>;
}
