import { CardSkeleton } from "@/components/legacy/organisms/Card";

export default function CertificationLoading() {
  return (
    <div className="flex flex-wrap flex-row gap-4">
    {
      [1, 2, 3, 4, 5, 6].map((i) => (
        <CardSkeleton key={`skeleton-${i}`} />
      ))
    }
  </div>
  )
}
