import { LoadingSkeleton } from "../../../components/ui/LoadingSkeleton";

export function LoadingMessage() {
  return <LoadingSkeleton className="max-w-xl" lines={3} />;
}
