import { DirectoryPageLoading } from "@/components/shared/directory-grid-skeleton";

export default function LocationsLoading() {
  return <DirectoryPageLoading cols={{ base: 2, sm: 3, lg: 5 }} count={10} />;
}
