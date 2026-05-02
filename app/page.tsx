import { redirect } from 'next/navigation';

// Root path redirects to the dashboard.
// The proxy handles auth before this ever executes, but redirect is kept
// here as an explicit routing declaration for clarity.
export default function RootPage() {
  redirect('/dashboard');
}
