'use client';

import { useRouter } from 'next/navigation';
import { CustomerForm } from '@/components/partner/CustomerForm';
import type { CustomerInput } from '@/lib/validations/customer';

interface Props {
  customerId: string;
  initialValues: Partial<CustomerInput>;
}

/**
 * Thin client wrapper that provides the router-based onSuccess callback
 * to CustomerForm when used from a server component page (edit page).
 */
export function CustomerFormWrapper({ customerId, initialValues }: Props) {
  const router = useRouter();

  return (
    <CustomerForm
      customerId={customerId}
      initialValues={initialValues}
      onSuccess={() => router.push(`/partner/customers/${customerId}`)}
    />
  );
}
