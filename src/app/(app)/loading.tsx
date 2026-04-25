import { AppLoader } from '@/components/ui/app-loader';

export default function AppSectionLoading() {
  return (
    <AppLoader
      title="Loading your mission control"
      subtitle="Fetching latest points, badges, and leaderboard updates..."
    />
  );
}
