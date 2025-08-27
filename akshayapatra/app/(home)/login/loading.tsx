import { Skeleton } from '@/components/ui/skeleton'
import PageLoader from '../../components/general/PageLoader';

export default function LoadingFile() {
  return <PageLoader text="L O G I N" duration={1.5} />;
}
