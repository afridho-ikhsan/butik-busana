"use client";

import ErrorInfo from "@/components/error-info";

function ErrorPage() {
  return (
    <div className="h-[80vh]">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full">
        <ErrorInfo />;
      </div>
    </div>
  );
}

export default ErrorPage;
