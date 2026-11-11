export const products = [
  { slug: 'static-loop', shelf: '01', name: 'Static Loop', type: 'Bracelet', price: 180 },
  { slug: 'moon-dial', shelf: '01', name: 'Moon Dial', type: 'Bracelet', price: 220 },
  { slug: 'soft-signal', shelf: '02', name: 'Soft Signal', type: 'Bracelet', price: 190 },
  { slug: 'tiny-orbit', shelf: '02', name: 'Tiny Orbit', type: 'Bracelet', price: 240 },
  { slug: 'pocket-noise', shelf: '03', name: 'Pocket Noise', type: 'Keychain', price: 160 },
  { slug: 'lost-satellite', shelf: '03', name: 'Lost Satellite', type: 'Keychain', price: 200 },
] as const;
export const peso = (amount: number) => `₱${amount}`;
