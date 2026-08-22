import numpy as np
import pandas as pd

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


DATASET = "Travel_Dataset.xlsx"
SHEET_NAME = "Tourist Destinations (1000)"


class ActivityRecommender:

    def __init__(self, dataset_path=DATASET):
        self.data = pd.read_excel(
            dataset_path,
            sheet_name=SHEET_NAME
        )

        self._clean_data()
        self._build_text_features()

    def _clean_data(self):
        text_columns = [
            "Destination Name",
            "City",
            "Country ISO",
            "Primary Category",
            "Tags",
            "Price Level",
            "Currency",
            "Short Description",
            "Full Description"
        ]

        for column in text_columns:
            self.data[column] = (
                self.data[column]
                .fillna("")
                .astype(str)
            )

        numeric_columns = [
            "Rating",
            "Review Count",
            "Estimated Cost",
            "Duration (mins)",
            "Latitude",
            "Longitude"
        ]

        for column in numeric_columns:
            self.data[column] = pd.to_numeric(
                self.data[column],
                errors="coerce"
            )

        self.data["Rating"] = self.data["Rating"].fillna(
            self.data["Rating"].median()
        )

        self.data["Review Count"] = self.data[
            "Review Count"
        ].fillna(0)

        self.data["Estimated Cost"] = self.data[
            "Estimated Cost"
        ].fillna(0)

        self.data["Duration (mins)"] = self.data[
            "Duration (mins)"
        ].fillna(
            self.data["Duration (mins)"].median()
        )

        self.data["Latitude"] = self.data[
            "Latitude"
        ].fillna(
            self.data["Latitude"].median()
        )

        self.data["Longitude"] = self.data[
            "Longitude"
        ].fillna(
            self.data["Longitude"].median()
        )

        self.data["city_clean"] = (
            self.data["City"]
            .str.strip()
            .str.lower()
        )

        self.data["category_clean"] = (
            self.data["Primary Category"]
            .str.strip()
            .str.lower()
        )

        self.data["tags_clean"] = (
            self.data["Tags"]
            .str.lower()
            .str.replace(",", " ", regex=False)
            .str.replace("|", " ", regex=False)
        )

    def _build_text_features(self):
        self.data["activity_text"] = (
            self.data["Primary Category"] + " " +
            self.data["Tags"] + " " +
            self.data["Short Description"] + " " +
            self.data["Full Description"]
        ).str.lower()

        self.tfidf = TfidfVectorizer(
            stop_words="english",
            ngram_range=(1, 2),
            min_df=1,
            max_features=10000
        )

        self.activity_matrix = self.tfidf.fit_transform(
            self.data["activity_text"]
        )

        self.max_reviews = np.log1p(
            self.data["Review Count"].max()
        )

    def _interest_similarity(
        self,
        candidates,
        interests
    ):
        if not interests:
            return np.full(
                len(candidates),
                0.5
            )

        user_text = " ".join(
            interests
        ).lower()

        user_vector = self.tfidf.transform(
            [user_text]
        )

        candidate_matrix = self.activity_matrix[
            candidates.index
        ]

        return cosine_similarity(
            user_vector,
            candidate_matrix
        ).flatten()

    @staticmethod
    def _rating_score(rating):
        return np.clip(
            float(rating) / 5.0,
            0,
            1
        )

    def _popularity_score(self, review_count):
        if self.max_reviews <= 0:
            return 0.5

        value = np.log1p(
            max(float(review_count), 0)
        )

        return np.clip(
            value / self.max_reviews,
            0,
            1
        )

    @staticmethod
    def _budget_score(
        cost,
        budget
    ):
        cost = max(
            float(cost),
            0
        )

        budget = float(budget)

        if budget <= 0:
            return 0.0

        ratio = cost / budget

        if ratio >= 1:
            return 0.0

        return np.clip(
            1 - ratio,
            0,
            1
        )

    @staticmethod
    def _duration_score(
        activity_duration,
        available_minutes
    ):
        duration = max(
            float(activity_duration),
            0
        )

        available = float(
            available_minutes
        )

        if available <= 0:
            return 0.0

        if duration > available:
            return 0.0

        ratio = duration / available

        if ratio < 0.10:
            return 0.65

        if ratio <= 0.80:
            return 1.0

        return 0.85

    def _calculate_scores(
        self,
        candidates,
        interests,
        budget,
        available_minutes
    ):
        candidates = candidates.copy()

        candidates["interest_score"] = (
            self._interest_similarity(
                candidates,
                interests
            )
        )

        candidates["budget_score"] = (
            candidates["Estimated Cost"]
            .apply(
                lambda cost:
                self._budget_score(
                    cost,
                    budget
                )
            )
        )

        candidates["rating_score"] = (
            candidates["Rating"]
            .apply(
                self._rating_score
            )
        )

        candidates["duration_score"] = (
            candidates["Duration (mins)"]
            .apply(
                lambda duration:
                self._duration_score(
                    duration,
                    available_minutes
                )
            )
        )

        candidates["popularity_score"] = (
            candidates["Review Count"]
            .apply(
                self._popularity_score
            )
        )

        candidates["score"] = (
            0.35 * candidates["interest_score"]
            + 0.25 * candidates["budget_score"]
            + 0.15 * candidates["rating_score"]
            + 0.10 * candidates["duration_score"]
            + 0.15 * candidates["popularity_score"]
        )

        return candidates

    @staticmethod
    def _diversify(
        candidates,
        limit,
        category_penalty=0.10
    ):
        if candidates.empty:
            return candidates

        remaining = candidates.copy()
        selected = []
        used_categories = set()

        while (
            len(selected) < limit
            and not remaining.empty
        ):
            best_index = None
            best_score = -np.inf

            for index, row in remaining.iterrows():
                category = row[
                    "Primary Category"
                ]

                score = float(
                    row["score"]
                )

                if category in used_categories:
                    score -= category_penalty

                if score > best_score:
                    best_score = score
                    best_index = index

            if best_index is None:
                break

            row = remaining.loc[
                best_index
            ].copy()

            row["final_score"] = best_score

            selected.append(row)

            used_categories.add(
                row["Primary Category"]
            )

            remaining = remaining.drop(
                best_index
            )

        return pd.DataFrame(
            selected
        ).reset_index(
            drop=True
        )

    def recommend(
        self,
        city,
        interests=None,
        budget=100,
        available_minutes=480,
        already_selected=None,
        limit=10
    ):
        interests = interests or []
        already_selected = already_selected or []

        city_clean = city.strip().lower()

        candidates = self.data[
            self.data["city_clean"] == city_clean
        ].copy()

        if candidates.empty:
            return pd.DataFrame()

        if already_selected:
            candidates = candidates[
                ~candidates["Item ID"].isin(
                    already_selected
                )
            ]

        candidates = candidates[
            candidates["Estimated Cost"] <= budget
        ]

        candidates = candidates[
            candidates["Duration (mins)"]
            <= available_minutes
        ]

        if candidates.empty:
            return pd.DataFrame()

        candidates = self._calculate_scores(
            candidates,
            interests,
            budget,
            available_minutes
        )

        candidates = candidates.sort_values(
            "score",
            ascending=False
        )

        candidates = candidates.head(
            max(limit * 3, limit)
        )

        results = self._diversify(
            candidates,
            limit=limit
        )

        output_columns = [
            "Item ID",
            "Destination Name",
            "City",
            "Country ISO",
            "Primary Category",
            "Tags",
            "Rating",
            "Review Count",
            "Price Level",
            "Estimated Cost",
            "Currency",
            "Duration (mins)",
            "Latitude",
            "Longitude",
            "interest_score",
            "budget_score",
            "rating_score",
            "duration_score",
            "popularity_score",
            "score",
            "final_score"
        ]

        return results[
            [
                column
                for column in output_columns
                if column in results.columns
            ]
        ]

    def cities(self):
        return sorted(
            self.data["City"]
            .dropna()
            .unique()
            .tolist()
        )

    def categories(self):
        return sorted(
            self.data["Primary Category"]
            .dropna()
            .unique()
            .tolist()
        )

    def recommend_api(
        self,
        city,
        interests=None,
        budget=100,
        available_minutes=480,
        already_selected=None,
        limit=10
    ):
        results = self.recommend(
            city=city,
            interests=interests,
            budget=budget,
            available_minutes=available_minutes,
            already_selected=already_selected,
            limit=limit
        )

        if results.empty:
            return []

        recommendations = []

        for _, row in results.iterrows():
            recommendations.append({
                "activity_id": str(row["Item ID"]),
                "name": str(row["Destination Name"]),
                "city": str(row["City"]),
                "country": str(row["Country ISO"]),
                "category": str(row["Primary Category"]),
                "tags": str(row["Tags"]),
                "rating": float(row["Rating"]),
                "estimated_cost": float(row["Estimated Cost"]),
                "currency": str(row["Currency"]),
                "duration_minutes": float(row["Duration (mins)"]),
                "score": float(row["final_score"])
            })

        return recommendations


def print_recommendations(
    recommendations
):
    if recommendations.empty:
        print("No matching activities found.")
        return

    columns = [
        "Destination Name",
        "City",
        "Primary Category",
        "Estimated Cost",
        "Currency",
        "Duration (mins)",
        "Rating",
        "final_score"
    ]

    output = recommendations[
        columns
    ].copy()

    output["final_score"] = (
        output["final_score"]
        .round(3)
    )

    output["Rating"] = (
        output["Rating"]
        .round(2)
    )

    print(
        output.to_string(
            index=False
        )
    )


if __name__ == "__main__":

    recommender = ActivityRecommender(
        DATASET
    )

    results = recommender.recommend(

        city="Paris",

        interests=[
            "history",
            "photography",
            "art",
            "architecture"
        ],

        budget=60,

        available_minutes=360,

        already_selected=[],

        limit=8
    )

    print_recommendations(
        results
    )
