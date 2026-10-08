import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { calculatePrice, studentPrice, money } from '../src/lib/pricing';
import { routes, getStops } from '../src/data/routes';
import { attractions } from '../src/data/attractions';
import { validGeometry } from '../src/lib/routing';
import { validateApplication, applicationAdapter } from '../src/lib/application';
import { pricing } from '../src/config/pricing';
test('Starting prices come from the config and student prices are 20% lower',()=>{
 assert.deepEqual(pricing.prices,{minsk:125,grodno:109,brest:119,mogilev:155,gomel:279,vitebsk:249});
 assert.equal(pricing.studentDiscountPercent,20);
 assert.deepEqual(routes.map(r=>studentPrice(r.demoBasePrice)),[100,87.2,95.2,124,223.2,199.2]);
 assert.deepEqual(routes.map(r=>money(studentPrice(r.demoBasePrice))),['100','87.20','95.20','124','223.20','199.20']);
 assert.equal(money(9765),'9,765');
});
test('Group price: regular travelers pay the starting price, students pay 20% less',()=>{
 // The example from the brief: Minsk, 5 travelers, 3 of them students.
 assert.deepEqual(calculatePrice(125,5,3),{count:5,students:3,regular:2,basePrice:125,studentPrice:100,regularCost:250,studentCost:300,total:550,saving:75});
 assert.equal(calculatePrice(109,3,3).total,261.6);
 assert.equal(calculatePrice(119,7,3).total,761.6);
 assert.equal(calculatePrice(109,10,10).total,872);
 assert.equal(calculatePrice(279,35,35).total,7812);
 assert.equal(calculatePrice(249,3,0).saving,0);
 assert.equal(calculatePrice(155,4,4).saving,124);
});
test('Participant bounds and invalid numbers are normalized',()=>{
 assert.equal(calculatePrice(125,2,5).students,2);
 assert.equal(calculatePrice(125,0,-1).total,125);
 assert.equal(calculatePrice(125,NaN,NaN).count,1);
 assert.equal(calculatePrice(125,2.8,1.9).students,1);
 assert.equal(calculatePrice(125,80,0).count,pricing.maxTravelers);
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
