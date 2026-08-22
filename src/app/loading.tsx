import { PageTransitionLoader } from '@/components/ui/page-transition-loader';

export default function Loading() {
  return <PageTransitionLoader message="INITIALIZING SUBSYSTEMS..." />;
}
