type Props = { isVeg: boolean };

export function VegIndicator({ isVeg }: Props) {
  return (
    <span
      className={`inline-flex items-center justify-center w-4 h-4 border-2 shrink-0 ${
        isVeg ? "border-green-600" : "border-red-600"
      }`}
      aria-label={isVeg ? "Vegetarian" : "Non-vegetarian"}
    >
      <span
        className={`block w-2 h-2 rounded-full ${
          isVeg ? "bg-green-600" : "bg-red-600"
        }`}
      />
    </span>
  );
}
