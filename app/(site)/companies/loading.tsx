import { DirectoryPageLoading } from "@/components/shared/directory-grid-skeleton";

export default function CompaniesLoading() {
  return <DirectoryPageLoading cols={{ base: 2, sm: 3, lg: 4 }} count={8} />;
}
