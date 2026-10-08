// The single source of prices on the site: route cards, the map panel, the program, the calculator
// and the offer on the first screen all read from here. Student prices are derived, never typed in.
export const pricing = {
  enabled: true, // false hides all prices throughout the site.
  currency: 'BYN',
  // Starting price per person in BYN, by departure city.
  prices: { minsk: 125, grodno: 109, brest: 119, mogilev: 155, gomel: 279, vitebsk: 249 },
  // Student discount in whole percent: the student price is the starting price minus this share.
  studentDiscountPercent: 20,
  maxTravelers: 50,
  label: 'Starting price',
  note: 'Preliminary starting prices are calculated for organized groups of 35 people or more. The final price and the services included are confirmed when the trip is booked.',
};
