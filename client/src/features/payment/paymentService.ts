// src/features/payment/paymentService.ts
import { postAuthJSON } from '../../configapi/api';

type Delivery = {
  district: string;
  block: string;
  city: string;
  homeLodgeName: string;
  name: string;
  phone: string;
};

export async function createRzpOrder(
  menuId: string,
  subscriptionType: 'monthly'|'trial',
  delivery: Delivery
) {
  let token = localStorage.getItem('access_token');
  if (!token) throw new Error('Please login first');

  // raw token (kabhi kabhi stringify ki wajah se quotes aa jate)
  token = token.replace(/^"+|"+$/g, '');

  return postAuthJSON(
    '/payment/create-order',
    { menuId, subscriptionType, delivery },
    token
  );
}
