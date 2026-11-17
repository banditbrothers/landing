import { useEffect, useState } from "react";

export const useCopyToClipboard = (timeout = 2000) => {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (isCopied) {
      setTimeout(() => setIsCopied(false), timeout);
    }
  }, [isCopied, timeout]);

  // Rejects if the browser refuses (e.g. the page lost focus); callers that care can await it.
  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setIsCopied(true);
  };

  return { isCopied, copy };
};
