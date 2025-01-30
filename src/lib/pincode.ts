const pincodeRegex = /^[0-9]{6}$/;

type PincodeResponse =
  | {
      isValid: false;
      error: string;
      data: null;
    }
  | {
      error: null;
      isValid: true;
      data: { city: string; state: string; country: string };
    };

export async function validatePincode(pincode: string): Promise<PincodeResponse> {
  if (!pincodeRegex.test(pincode)) {
    return { error: "Invalid pincode", isValid: false, data: null };
  }

  const pincodeData = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
  const data = (await pincodeData.json())[0];

  if (data.Status === "Error") {
    return { error: "Invalid Pincode", isValid: false, data: null };
  }

  const state = data.PostOffice[0].State;
  const city = data.PostOffice[0].District;
  const country = data.PostOffice[0].Country;

  return { error: null, isValid: true, data: { city, state, country } };
}
