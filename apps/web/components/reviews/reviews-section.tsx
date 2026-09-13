'use client';

import {
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  apiFetch,
  authApiFetch,
} from '@/lib/api';

type Review = {
  id: number;
  userId: number;
  recipeId: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;

  user: {
    id: number;
    fullName: string;
    avatarUrl: string | null;
  };
};

type ReviewSummary = {
  recipeId: number;
  averageRating: number;
  totalReviews: number;

  distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
};

type MeResponse = {
  id: number;
  email: string;
  role: 'USER' | 'ADMIN';
};

type ReviewsSectionProps = {
  recipeId: number;
};

export function ReviewsSection({
  recipeId,
}: ReviewsSectionProps) {
  const [reviews, setReviews] =
    useState<Review[]>([]);

  const [summary, setSummary] =
    useState<ReviewSummary | null>(null);

  const [rating, setRating] =
    useState(5);

  const [comment, setComment] =
    useState('');

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [currentUserId, setCurrentUserId] =
    useState<number | null>(null);

  const [editingReviewId, setEditingReviewId] =
    useState<number | null>(null);

  const [editRating, setEditRating] =
    useState(5);

  const [editComment, setEditComment] =
    useState('');

  const [savingReview, setSavingReview] =
    useState(false);

  const loadReviews = useCallback(
    async () => {
      try {
        setError(null);

        const [reviewData, summaryData] =
          await Promise.all([
            apiFetch<Review[]>(
              `/reviews/recipe/${recipeId}`,
            ),

            apiFetch<ReviewSummary>(
              `/reviews/recipe/${recipeId}/summary`,
            ),
          ]);

        setReviews(reviewData);
        setSummary(summaryData);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : 'Không thể tải đánh giá',
        );
      } finally {
        setLoading(false);
      }
    },
    [recipeId],
  );

  useEffect(() => {
    void loadReviews();
  }, [loadReviews]);

  useEffect(() => {
    async function loadCurrentUser() {
      try {
        const me =
          await authApiFetch<MeResponse>(
            '/auth/me',
          );

        setCurrentUserId(me.id);
      } catch {
        setCurrentUserId(null);
      }
    }

    void loadCurrentUser();
  }, []);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setSubmitting(true);
    setError(null);

    try {
      await authApiFetch(
        '/reviews',
        {
          method: 'POST',

          body: JSON.stringify({
            recipeId,
            rating,
            comment:
              comment.trim() || undefined,
          }),
        },
      );

      setRating(5);
      setComment('');

      await loadReviews();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Không thể gửi đánh giá',
      );
    } finally {
      setSubmitting(false);
    }
  }

  function startEdit(review: Review) {
    setEditingReviewId(review.id);
    setEditRating(review.rating);
    setEditComment(review.comment ?? '');
  }

  function cancelEdit() {
    setEditingReviewId(null);
    setEditRating(5);
    setEditComment('');
  }

  async function saveEdit(
    reviewId: number,
  ) {
    setSavingReview(true);
    setError(null);

    try {
      await authApiFetch(
        `/reviews/${reviewId}`,
        {
          method: 'PATCH',

          body: JSON.stringify({
            rating: editRating,
            comment:
              editComment.trim() || undefined,
          }),
        },
      );

      cancelEdit();
      await loadReviews();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Không thể cập nhật đánh giá',
      );
    } finally {
      setSavingReview(false);
    }
  }

  async function deleteReview(
    reviewId: number,
  ) {
    const confirmed =
      window.confirm(
        'Bạn có chắc muốn xóa đánh giá này?',
      );

    if (!confirmed) {
      return;
    }

    setError(null);

    try {
      await authApiFetch(
        `/reviews/${reviewId}`,
        {
          method: 'DELETE',
        },
      );

      await loadReviews();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Không thể xóa đánh giá',
      );
    }
  }

  return (
    <section className="mt-14 border-t pt-10">
      <h2 className="text-2xl font-bold">
        Đánh giá món ăn
      </h2>

      {summary && (
        <div className="mt-4">
          <span className="text-3xl font-bold">
            {summary.averageRating}
          </span>

          <span className="ml-2">
            / 5 ★
          </span>

          <p className="mt-1 text-sm text-gray-500">
            {summary.totalReviews} đánh giá
          </p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="mt-8 rounded-2xl border p-6"
      >
        <h3 className="font-semibold">
          Viết đánh giá
        </h3>

        <div className="mt-4">
          <label
            htmlFor="rating"
            className="mb-2 block text-sm font-medium"
          >
            Số sao
          </label>

          <select
            id="rating"
            value={rating}
            onChange={(event) =>
              setRating(
                Number(event.target.value),
              )
            }
            className="rounded-xl border px-4 py-3"
          >
            <option value={5}>
              5 ★ - Rất ngon
            </option>

            <option value={4}>
              4 ★ - Ngon
            </option>

            <option value={3}>
              3 ★ - Bình thường
            </option>

            <option value={2}>
              2 ★ - Chưa ngon
            </option>

            <option value={1}>
              1 ★ - Không thích
            </option>
          </select>
        </div>

        <div className="mt-4">
          <label
            htmlFor="comment"
            className="mb-2 block text-sm font-medium"
          >
            Nhận xét
          </label>

          <textarea
            id="comment"
            value={comment}
            onChange={(event) =>
              setComment(event.target.value)
            }
            rows={4}
            className="w-full rounded-xl border px-4 py-3"
            placeholder="Chia sẻ cảm nhận của bạn về món ăn..."
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="mt-4 rounded-xl bg-black px-5 py-3 font-medium text-white disabled:opacity-50"
        >
          {submitting
            ? 'Đang gửi...'
            : 'Gửi đánh giá'}
        </button>
      </form>

      {error && (
        <p className="mt-4 text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="mt-10">
        <h3 className="text-xl font-bold">
          Nhận xét
        </h3>

        {loading && (
          <p className="mt-4 text-gray-500">
            Đang tải đánh giá...
          </p>
        )}

        {!loading &&
          reviews.length === 0 && (
            <p className="mt-4 text-gray-500">
              Chưa có đánh giá nào.
            </p>
          )}

        <div className="mt-5 space-y-4">
          {reviews.map((review) => {
            const isMine =
              currentUserId === review.userId;

            const isEditing =
              editingReviewId === review.id;

            return (
              <article
                key={review.id}
                className="rounded-2xl border p-5"
              >
                <div className="flex items-center justify-between gap-4">
                  <strong>
                    {review.user.fullName}
                  </strong>

                  {!isEditing && (
                    <span>
                      {'★'.repeat(
                        review.rating,
                      )}
                      {'☆'.repeat(
                        5 - review.rating,
                      )}
                    </span>
                  )}
                </div>

                {!isEditing &&
                  review.comment && (
                    <p className="mt-3">
                      {review.comment}
                    </p>
                  )}

                {isEditing && (
                  <div className="mt-4 space-y-4">
                    <div>
                      <label
                        htmlFor={`edit-rating-${review.id}`}
                        className="mb-2 block text-sm font-medium"
                      >
                        Số sao
                      </label>

                      <select
                        id={`edit-rating-${review.id}`}
                        value={editRating}
                        onChange={(event) =>
                          setEditRating(
                            Number(
                              event.target
                                .value,
                            ),
                          )
                        }
                        className="rounded-xl border px-4 py-3"
                      >
                        <option value={5}>
                          5 ★
                        </option>

                        <option value={4}>
                          4 ★
                        </option>

                        <option value={3}>
                          3 ★
                        </option>

                        <option value={2}>
                          2 ★
                        </option>

                        <option value={1}>
                          1 ★
                        </option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor={`edit-comment-${review.id}`}
                        className="mb-2 block text-sm font-medium"
                      >
                        Nhận xét
                      </label>

                      <textarea
                        id={`edit-comment-${review.id}`}
                        value={editComment}
                        onChange={(event) =>
                          setEditComment(
                            event.target.value,
                          )
                        }
                        rows={3}
                        className="w-full rounded-xl border px-4 py-3"
                      />
                    </div>
                  </div>
                )}

                <p className="mt-3 text-xs text-gray-500">
                  {new Date(
                    review.createdAt,
                  ).toLocaleDateString(
                    'vi-VN',
                  )}
                </p>

                {isMine && (
                  <div className="mt-4 flex gap-3">
                    {!isEditing ? (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            startEdit(
                              review,
                            )
                          }
                          className="rounded-lg border px-3 py-2 text-sm"
                        >
                          Sửa
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            void deleteReview(
                              review.id,
                            )
                          }
                          className="rounded-lg border px-3 py-2 text-sm text-red-600"
                        >
                          Xóa
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          disabled={savingReview}
                          onClick={() =>
                            void saveEdit(
                              review.id,
                            )
                          }
                          className="rounded-lg bg-black px-3 py-2 text-sm text-white disabled:opacity-50"
                        >
                          {savingReview
                            ? 'Đang lưu...'
                            : 'Lưu'}
                        </button>

                        <button
                          type="button"
                          disabled={savingReview}
                          onClick={cancelEdit}
                          className="rounded-lg border px-3 py-2 text-sm"
                        >
                          Hủy
                        </button>
                      </>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}