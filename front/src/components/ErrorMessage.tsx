export default function ErrorMessage({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="text-center space-y-4">
      <div className="text-red-600 font-medium">
        ⚠️ {message}
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-violet-100 hover:bg-violet-200 text-violet-700 px-4 py-2 rounded-lg"
        >
          Try Again
        </button>
      )}
    </div>
  );
} 