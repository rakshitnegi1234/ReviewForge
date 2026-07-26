import { getReviews } from "@/module/reviews/actions";
import { ReviewsList } from "@/module/reviews/components/reviews-list";

export default async function ReviewsPage() {
  const reviews = await getReviews();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reviews</h1>
        <p className="text-muted-foreground">
          View completed and failed pull request reviews
        </p>
      </div>

      <ReviewsList reviews={reviews} />
    </div>
  );
}
