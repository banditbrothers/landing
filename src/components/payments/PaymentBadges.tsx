import GpayBadge from "./payment-badges/gpay.svg";
import UpiBadge from "./payment-badges/upi.svg";
import VisaBadge from "./payment-badges/visa.svg";
import MastercardBadge from "./payment-badges/mastercard.svg";
import RupayBadge from "./payment-badges/rupay.svg";
import Image from "next/image";

export const PaymentBadges = () => {
  return (
    <div className="flex flex-row gap-2">
      <Image src={GpayBadge} alt="Gpay" width={38} height={24} className="w-[38px] h-[24px]" />
      <Image src={UpiBadge} alt="Upi" width={38} height={24} className="w-[38px] h-[24px]" />
      <Image src={VisaBadge} alt="Visa" width={38} height={24} className="w-[38px] h-[24px]" />
      <Image src={MastercardBadge} alt="Mastercard" width={38} height={24} className="w-[38px] h-[24px]" />
      <Image src={RupayBadge} alt="Rupay" width={38} height={24} className="w-[38px] h-[24px]" />
    </div>
  );
};
