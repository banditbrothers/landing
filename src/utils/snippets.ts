// handle sneak peek on scroll container

/**
 * 
 * const [showScrollPeek, setShowScrollPeek] = useState(true);
 * const scrollableRef = useRef<HTMLDivElement>(null);
 * 
 *   const handleScrollPeek = useCallback(() => {
    const scrollPx = 50;
    const element = scrollableRef.current;
    const isScrollable = element && element.scrollHeight > element.clientHeight;

    if (isScrollable) {
      element.scrollTop += scrollPx;

      setTimeout(() => {
        element.scrollTop -= scrollPx;
      }, 700);
    }
  }, []);

  useEffect(() => {
    let delayedScrollTimer: NodeJS.Timeout;

    if (showScrollPeek) {
      delayedScrollTimer = setInterval(() => {
        handleScrollPeek();
      }, 2000);
    }
    return () => clearInterval(delayedScrollTimer);
  }, [showScrollPeek, handleScrollPeek]);


  // assign ref to the scrollable container
  // on wheel event, set showScrollPeek to false
 */
