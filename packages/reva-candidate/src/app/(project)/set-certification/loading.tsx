import { CardSkeleton } from "@/components/legacy/organisms/Card";

export default function CertificationLoading() {
  return (
    [1, 2, 3, 4, 5].map((i) => (
      <CardSkeleton key={`skeleton-${i}`} />
    ))
  )
}
