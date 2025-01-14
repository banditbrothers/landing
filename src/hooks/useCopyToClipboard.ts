import { useEffect, useState } from "react";

export const useCopyToClipboard = (timeout = 2000) => {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (isCopied) {
      setTimeout(() => setIsCopied(false), timeout);
    }
  }, [isCopied, timeout]);

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
  };

  return { isCopied, copy };
};
