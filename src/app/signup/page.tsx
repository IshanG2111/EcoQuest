import { redirect } from 'next/navigation';

export default function SignupPage() {
  // Authentication is now unified in the chat interface at /login
  redirect('/login');
}
