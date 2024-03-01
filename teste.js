const { bestOnDietSequence } = totalMeals.reduce(
  (acc, meal) => {
    if (meal.is_on_diet) {
      acc.currentSequence += 1;
    } else {
      acc.currentSequence = 0;
    }

    if (acc.currentSequence > acc.bestOnDietSequence) {
      acc.bestOnDietSequence = acc.currentSequence;
    }

    return acc;
  },
  { bestOnDietSequence: 0, currentSequence: 0 }
);
