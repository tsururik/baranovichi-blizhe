export type Application = { name:string;contact:string;origin:string;date:string;total:number;students:number;discount:boolean;comment:string;optionalMuseum:boolean; };
export function localDate(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
export function validateApplication(a:Application):string|null {
 if(a.name.trim().length<2)return 'Укажите имя — не менее двух символов.';
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a.contact.trim()) && !/^\+?[\d\s()\-]{7,22}$/.test(a.contact.trim()))return 'Укажите электронную почту или телефон для связи.';
 if(!a.date||a.date<localDate())return 'Выберите сегодняшнюю или будущую дату.';
 if(!Number.isInteger(a.total)||a.total<1||a.total>50)return 'Количество путешественников: от 1 до 50.';
 if(!Number.isInteger(a.students)||a.students<0||a.students>a.total)return 'Число студентов не может превышать число путешественников.';
 return null;
}
export interface ApplicationAdapter { prepare(application:Application):Promise<{mode:'preview';text:string}> }
export const applicationAdapter:ApplicationAdapter={async prepare(a){const error=validateApplication(a);if(error)throw new Error(error);return {mode:'preview',text:[`ПРЕДПРОСМОТР ЗАЯВКИ · Барановичи ближе`,`Имя: ${a.name.trim()}`,`Контакт: ${a.contact.trim()}`,`Отправление: ${a.origin}`,`Предпочтительная дата: ${a.date}`,`Путешественники: ${a.total}`,`Студенты: ${a.students}`,`Студенческая скидка: ${a.discount?'применить':'не применять'}`,`Музей железнодорожной техники: ${a.optionalMuseum?'добавить по согласованию':'не выбран'}`,`Комментарий: ${a.comment.trim()||'—'}`,'Это локальный предпросмотр. Заявка не отправлена, бронирование не подтверждено.'].join('\n')}}};
