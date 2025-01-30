import { useRouter, usePathname, useSearchParams } from "next/navigation";

/**
 *
 * this method of push and replace is causing the browser stack to grow which is not ideal.
 * we need to `push` always because otherwise on mobile the back button would exit the browser onDialogClose.
 * need to think of a better solution.
 *
 * */

export const useParamBasedFeatures = <T extends string | string[] | null>(
  paramName: string,
  config: { replaceRoute?: boolean } = { replaceRoute: false }
) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const paramValue = searchParams.get(paramName);

  const removeParam = () => {
    const nextSearchParams = new URLSearchParams(searchParams.toString());
    nextSearchParams.delete(paramName);

    router.replace(`${pathname}?${nextSearchParams}`, { scroll: false });
  };

  const setParam = (value: string | string[]) => {
    const nextSearchParams = new URLSearchParams(searchParams.toString());
    nextSearchParams.delete(paramName);

    let paramValue = "";
    if (Array.isArray(value)) paramValue = value.join(",");
    else paramValue = value;

    nextSearchParams.set(paramName, paramValue);

    const url = `${pathname}?${nextSearchParams}`;
    const routerOptions = { scroll: false };

    if (config.replaceRoute) router.replace(url, routerOptions);
    else router.push(url, routerOptions);
  };

  let value: string | string[] | null = paramValue;
  if (paramValue && paramValue.includes(",")) {
    value = paramValue.split(",");
  }

  return { value: value as T | string | null, removeParam, setParam };
};

export const handleMultipleParams = ({
  params,
  config = { replaceRoute: false },
}: {
  params: Record<string, string | string[]>;
  config: { replaceRoute?: boolean };
}) => {
  const currentUrl = new URL(window.location.href);
  const nextSearchParams = new URLSearchParams(currentUrl.searchParams.toString());

  Object.entries(params).forEach(([key, value]) => {
    let paramValue = "";
    if (Array.isArray(value)) paramValue = value.join(",");
    else paramValue = value;

    if (paramValue === "") nextSearchParams.delete(key);
    else nextSearchParams.set(key, paramValue);
  });

  const url = `${currentUrl.pathname}?${nextSearchParams}`;

  if (config.replaceRoute) window.history.replaceState({}, "", url);
  else window.history.pushState({}, "", url);
};
