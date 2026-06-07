interface Props {
  count: number;
}

export function TransitWarning({ count }: Props) {
  if (count === 0) return null;

  return (
    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
      <span>⚠️</span>
      <span>
        移動時間が足りない区間が {count} 件あります。赤色のブロックを確認してください。
      </span>
    </div>
  );
}
