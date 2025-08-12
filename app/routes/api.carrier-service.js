// import { json } from '@remix-run/node';
// import { authenticate } from '~/shopify.server';

// export const action = async ({ request }) => {
//   const { admin } = await authenticate.admin(request);
//   const callbackUrl = 'https://ctrl-ws-desirable-ruling.trycloudflare.com/shipping-rates';

//   const response = await admin.graphql(CREATE_CARRIER_SERVICE, {
//     variables: {
//       name: 'My Custom Shipping',
//       callbackUrl,
//     }
//   });

//   const jsonData = await response.json();
//   return json(jsonData);
// };
