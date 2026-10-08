import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { calculatePrice } from '../src/lib/pricing';
import { routes, getStops } from '../src/data/routes';
import { attractions } from '../src/data/attractions';
import { validGeometry } from '../src/lib/routing';
import { validateApplication, applicationAdapter } from '../src/lib/application';
import { pricing } from '../src/config/pricing';
test('Student discount applies only to students, never all participants',()=>{
 assert.deepEqual(calculatePrice(69,4,2,true),{count:4,students:2,base:276,saving:27.6,total:248.4});
 assert.equal(calculatePrice(69,4,2,false).total,276);
 assert.equal(calculatePrice(129,3,0,true).saving,0);
 assert.equal(calculatePrice(129,3,3,true).total,309.6);
});
test('Participant bounds and invalid numbers are normalized',()=>{
 assert.equal(calculatePrice(69,2,5,true).students,2);
 assert.equal(calculatePrice(69,0,-1,true).total,69);
 assert.equal(calculatePrice(69,NaN,NaN,true).count,1);
 assert.equal(calculatePrice(69,2.8,1.9,true).students,1);
});
test('All route orders match the brief and each attraction has an image and source',()=>{
 const expected=[['mir','nesvizh'],['lida','navahrudak','svityaz'],['pruzhany','ruzhany','kosava'],['babruysk','kopyl','nesvizh'],['krasny','zhilichi','babruysk','nesvizh'],['orsha','brilevo','mir']];
 assert.equal(routes.length,6);
 routes.forEach((r,i)=>{assert.deepEqual(getStops(r).map(s=>s.id),expected[i]);assert.equal(r.demoBasePrice,pricing.prices[r.id]);assert.deepEqual(r.stops.map(s=>s.order),r.stops.map((_,i)=>i+1));assert.ok(!r.stops.some(s=>s.attractionId==='railway'))});
 Object.values(attractions).forEach(a=>{assert.ok(existsSync(`public/${a.image}`));assert.ok(a.coordinateSource.startsWith('https://'));assert.ok(a.latitude>51&&a.latitude<57);assert.ok(a.longitude>23&&a.longitude<33)});
});
test('Each locally cached road has valid metric values and geographic shape',()=>{
 routes.forEach(r=>{const g=JSON.parse(readFileSync(`public/routes/${r.id}.geojson`,'utf8'));assert.ok(validGeometry(g,r.id));assert.ok(g.geometry.coordinates.length>50);assert.equal(g.properties.demoOnly,true)});
 assert.equal(validGeometry({},'minsk'),false);
});
test('Application is local, validates contact/date and student count',async()=>{
 const input={name:'Anna',contact:'anna@example.com',origin:'Minsk',date:'2099-01-01',total:2,students:1,discount:true,comment:'Test',optionalMuseum:false};
 assert.equal(validateApplication(input),null);
 assert.match(validateApplication({...input,students:3})!,/students/);
 assert.match(validateApplication({...input,date:'2000-01-01'})!,/date/);
 assert.match(validateApplication({...input,contact:'not a contact'})!,/email/);
 const result=await applicationAdapter.prepare(input);assert.equal(result.mode,'preview');assert.match(result.text,/not been sent/);
});
