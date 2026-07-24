import { requireAuth } from '@/module/auth/utils/auth-utils';
import { redirect } from 'next/navigation';

async function page() {

  await requireAuth();

  redirect('/dashboard')
}

export default page;
