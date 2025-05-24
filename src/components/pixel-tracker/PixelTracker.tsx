import { useEffect } from "react";
import ReactPixel from "react-facebook-pixel";

const PIXEL_ID = "1023145726553010";

const PixelTracker = () => {
  useEffect(() => {
    ReactPixel.init(PIXEL_ID);
    ReactPixel.pageView();
  }, []);
  return null;
};
export default PixelTracker;
