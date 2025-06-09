import { Suspense } from 'react';
import OrdersContent from './OrdersContent';

export default function OrdersPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OrdersContent />
    </Suspense>
  );
} 