type Props = {
  service?: string;
};

export default function ServiceUnavailable({ service = "The service" }: Props) {
  return (
    <main className="m-auto max-w-md p-8 text-center">
      <h1 className="text-2xl font-semibold">Temporarily unavailable</h1>
      <p className="mt-3 text-sm opacity-75">
        {service} is unavailable right now. Please try again shortly.
      </p>
    </main>
  );
}
