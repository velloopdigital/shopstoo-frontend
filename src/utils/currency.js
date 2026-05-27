export const COUNTRIES = {
  TZ: {
    name: 'Tanzania',
    flag: '🇹🇿',
    currency: 'TSh',
    code: 'TZS',
    phone_prefix: '+255',
    payment: 'M-Pesa (Vodacom)',
    cities: ['Dar es Salaam','Arusha','Mwanza','Dodoma','Mbeya','Zanzibar']
  },
  KE: {
    name: 'Kenya',
    flag: '🇰🇪',
    currency: 'KSh',
    code: 'KES',
    phone_prefix: '+254',
    payment: 'M-Pesa (Safaricom)',
    cities: ['Nairobi','Mombasa','Kisumu','Nakuru','Eldoret','Thika']
  }
};

export const formatPrice = (amount, country) => {
  const c = COUNTRIES[country] || COUNTRIES.TZ;
  return `${c.currency} ${Number(amount).toLocaleString()}`;
};

export const getCountry = (code) => COUNTRIES[code] || COUNTRIES.TZ;
