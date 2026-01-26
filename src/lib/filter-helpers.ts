export const buildFilterLink = (
  type: "filter" | "sort",
  value: string,
  currentUrl: URL,
  baseUrl: string,
): string => {
  const params = new URLSearchParams(currentUrl.search);

  if (type === "filter") {
    if (value === "all") {
      params.delete("filter");
    }

    if (value !== "all") {
      params.set("filter", value);
    }

    params.delete("page");
    return cleanUrl(params, baseUrl);
  }

  // Type narrowing: if not filter, must be sort
  params.set("sort", value);
  params.delete("page");

  if (value === "newest") {
    params.delete("sort");
  }

  return cleanUrl(params, baseUrl);
};

const cleanUrl = (params: URLSearchParams, baseUrl: string): string => {
  const qs = params.toString();
  return qs ? `${baseUrl}?${qs}` : baseUrl;
};
