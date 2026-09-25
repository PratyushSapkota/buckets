"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="m-auto max-w-md p-8 text-center">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="mt-3 text-sm opacity-75">
        We could not complete that request. Please try again.
      </p>
      <button
        className="mt-5 cursor-pointer underline"
        type="button"
        onClick={reset}
      >
        Try again
      </button>
    </main>
  );
}
