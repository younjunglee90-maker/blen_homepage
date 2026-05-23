import { RouterProvider } from 'react-router-dom';

import { router } from '@/routes/router';

export function AppBootstrap() {
  return <RouterProvider router={router} />;
}
