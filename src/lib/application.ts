export type Application = { name:string;contact:string;origin:string;date:string;total:number;students:number;discount:boolean;comment:string;optionalMuseum:boolean; };
export function localDate(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
export function validateApplication(a:Application):string|null {
 if(a.name.trim().length<2)return 'Please enter a name of at least two characters.';
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a.contact.trim()) && !/^\+?[\d\s()\-]{7,22}$/.test(a.contact.trim()))return 'Please enter an email address or phone number.';
 if(!a.date||a.date<localDate())return 'Please choose today or a future date.';
 if(!Number.isInteger(a.total)||a.total<1||a.total>50)return 'Number of travelers: from 1 to 50.';
 if(!Number.isInteger(a.students)||a.students<0||a.students>a.total)return 'The number of students cannot exceed the number of travelers.';
 return null;
}
export interface ApplicationAdapter { prepare(application:Application):Promise<{mode:'preview';text:string}> }
export const applicationAdapter:ApplicationAdapter={async prepare(a){const error=validateApplication(a);if(error)throw new Error(error);return {mode:'preview',text:[`REQUEST PREVIEW · Baranovichi Closer`,`Name: ${a.name.trim()}`,`Contact: ${a.contact.trim()}`,`Departure: ${a.origin}`,`Preferred date: ${a.date}`,`Travelers: ${a.total}`,`Students: ${a.students}`,`Student discount: ${a.discount?'apply':'do not apply'}`,`Railway Equipment Museum: ${a.optionalMuseum?'add, subject to confirmation':'not selected'}`,`Comment: ${a.comment.trim()||'—'}`,'This is a local preview. The request has not been sent and no booking is confirmed.'].join('\n')}}};
