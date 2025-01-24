import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

/**
 *
 * this method of push and replace is causing the browser stack to grow which is not ideal.
 * we need to `push` always because otherwise on mobile the back button would exit the browser onDialogClose.
 * need to think of a better solution.
 *
 * */

export const useParamBasedDialog = (paramName: string) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const value = searchParams.get(paramName);

  const closeDialog = () => {
    const nextSearchParams = new URLSearchParams(searchParams.toString());
    nextSearchParams.delete(paramName);

    router.replace(`${pathname}?${nextSearchParams}`, { scroll: false });
  };

  const openDialog = (value: string) => {
    const nextSearchParams = new URLSearchParams(searchParams.toString());
    nextSearchParams.set(paramName, value);

    router.push(`${pathname}?${nextSearchParams}`, { scroll: false });
  };

  return { value, closeDialog, openDialog };
};
