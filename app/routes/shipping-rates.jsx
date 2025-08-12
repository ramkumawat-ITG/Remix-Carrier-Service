import { json } from '@remix-run/node';

// Origin coordinates (same as your original code)
const origin = {
  lat: 23.4733,
  lon: 77.947998,
};

// State coordinates (same as your original code)
const stateCoordinates = {
  AN: { lat: 11.7401, lon: 92.6586 },
  AP: { lat: 15.9129, lon: 79.7400 },
  AR: { lat: 27.5829, lon: 93.9368 },
  AS: { lat: 26.2006, lon: 92.9376 },
  BR: { lat: 25.0961, lon: 85.3131 },
  CH: { lat: 30.7333, lon: 76.7794 },
  CT: { lat: 21.2787, lon: 81.8661 },
  DN: { lat: 20.1809, lon: 73.0169 },
  DL: { lat: 28.7041, lon: 77.1025 },
  GA: { lat: 15.2993, lon: 74.1240 },
  GJ: { lat: 22.2587, lon: 71.1924 },
  HR: { lat: 29.0588, lon: 76.0856 },
  HP: { lat: 31.1048, lon: 77.1734 },
  JK: { lat: 33.7782, lon: 76.5762 },
  JH: { lat: 23.6102, lon: 85.2799 },
  KA: { lat: 15.3173, lon: 75.7139 },
  KL: { lat: 10.8505, lon: 76.2711 },
  LA: { lat: 34.1526, lon: 77.5770 },
  LD: { lat: 10.5593, lon: 72.6358 },
  MP: { lat: 23.4733, lon: 77.947998 },
  MH: { lat: 19.7515, lon: 75.7139 },
  MN: { lat: 24.6637, lon: 93.9063 },
  ML: { lat: 25.4670, lon: 91.3662 },
  MZ: { lat: 23.1645, lon: 92.9376 },
  NL: { lat: 26.1584, lon: 94.5624 },
  OR: { lat: 20.9517, lon: 85.0985 },
  PY: { lat: 11.9416, lon: 79.8083 },
  PB: { lat: 31.1471, lon: 75.3412 },
  RJ: { lat: 27.0238, lon: 74.2179 },
  SK: { lat: 27.5330, lon: 88.5122 },
  TN: { lat: 11.1271, lon: 78.6569 },
  TG: { lat: 17.1232, lon: 78.3408 },
  TR: { lat: 23.9408, lon: 91.9882 },
  UP: { lat: 26.8467, lon: 80.9462 },
  UT: { lat: 30.0668, lon: 79.0193 },
  WB: { lat: 22.9868, lon: 87.8550 },
};

// OpenRouteService Distance Matrix API
async function getRoadDistance(origin, dest) {
  try {
    const response = await fetch(
      'https://api.openrouteservice.org/v2/matrix/driving-car',
      {
        method: 'POST',
        headers: {
          Authorization: process.env.OPENROUTESERVICE_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          locations: [
            [origin.lon, origin.lat],
            [dest.lon, dest.lat],
          ],
          metrics: ['distance'],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    const distanceInMeters = data.distances[0][1];
    return distanceInMeters / 1000;
  } catch (error) {
    console.error('OpenRouteService API error:', error.message);
    return getDistance(origin.lat, origin.lon, dest.lat, dest.lon);
  }
}

// Haversine formula (as fallback)
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Remix action to handle POST requests
export async function action({ request }) {
  const body = await request.json();
  console.log('Shopify callback body:', JSON.stringify(body, null, 2));

  const country = body?.rate?.destination?.country;
  const province = (body?.rate?.destination?.province_code || body?.rate?.destination?.province)?.toUpperCase();

  if (!country || !province) {
    return json({ rates: [] });
  }

  if (country !== 'IN') {
    return json({ rates: [] });
  }

  // Get product weight (in kg)
  const items = body?.rate?.items || [];
  if (!items.length) {
    return json({ rates: [] });
  }

  let totalWeightKg = 0;
  for (let item of items) {
    if (!item.grams || item.grams <= 0) {
      console.log('Missing or zero weight detected → No shipping');
      return json({ rates: [] });
    }
    totalWeightKg += (item.grams / 1000) * item.quantity;
  }

  // Weight-based cost
  let weightCost = 0;
  if (totalWeightKg <= 5) weightCost = 10;
  else if (totalWeightKg <= 10) weightCost = 25;
  else if (totalWeightKg <= 25) weightCost = 50;
  else weightCost = 100; // fallback if > 25kg

  const dest = stateCoordinates[province];
  if (!dest) {
    return json({ rates: [] });
  }

  const distance = await getRoadDistance(origin, dest);

  // Fixed values
  const perKmInInr = 1.0;

  // Calculate cost based on distance and weight
  const baseTransportCostInInr = distance * perKmInInr;
  const totalCostInInr = baseTransportCostInInr + weightCost;

  const services = [
    { key: 'EXPRESS', name: 'Express Shipping', multiplier: 1.25, minDays: 1, maxDays: 2 },
    { key: 'STANDARD', name: 'Standard Shipping', multiplier: 1.0, minDays: 2, maxDays: 5 },
    { key: 'ECONOMY', name: 'Economy Shipping', multiplier: 0.85, minDays: 4, maxDays: 8 },
  ];

  const now = Date.now();
  const minimumChargeInInr = 30;

  const rates = services.map((svc) => {
    const finalInInr = Math.max(minimumChargeInInr, totalCostInInr * svc.multiplier);
    return {
      service_name: `${svc.name} (${province})`,
      service_code: `${province}_${svc.key}`,
      total_price: Math.round(finalInInr * 100),
      currency: 'INR',
      min_delivery_date: new Date(now).toISOString(),
      max_delivery_date: new Date(now + svc.maxDays * 24 * 60 * 60 * 1000).toISOString(),
    };
  });

  console.log('Origin:', origin);
  console.log('Destination:', dest);
  console.log('Distance:', distance.toFixed(2), 'km');
  console.log('Weight Cost:', weightCost.toFixed(2), 'INR');
  console.log('Base Transport Cost:', baseTransportCostInInr.toFixed(2), 'INR');
  console.log('Calculated rates:', JSON.stringify(rates, null, 2));

  return json({ rates });
}