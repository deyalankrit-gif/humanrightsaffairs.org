
/**
 * VMS Utility Suite: Institutional logic for financial instrument generation.
 */

/**
 * Converts numeric amounts to the Indian Numbering System words.
 */
export function amountToWords(num: number): string {
  if (num === 0) return "Zero";

  const single = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
  const double = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  const format = (n: number): string => {
    if (n === 0) return "";
    if (n < 10) return single[n];
    if (n < 20) return double[n - 10];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + single[n % 10] : "");
    return single[Math.floor(n / 100)] + " Hundred" + (n % 100 !== 0 ? " and " + format(n % 100) : "");
  };

  let res = "";
  if (Math.floor(num / 10000000) > 0) {
    res += format(Math.floor(num / 10000000)) + " Crore ";
    num %= 10000000;
  }
  if (Math.floor(num / 100000) > 0) {
    res += format(Math.floor(num / 100000)) + " Lakh ";
    num %= 100000;
  }
  if (Math.floor(num / 1000) > 0) {
    res += format(Math.floor(num / 1000)) + " Thousand ";
    num %= 1000;
  }
  res += format(num);

  return res.trim() + " Rupees Only";
}

/**
 * Maps voucher types to their short codes for ID generation.
 */
export const VOUCHER_TYPE_CODES: Record<string, string> = {
  "Receipt Voucher": "RV",
  "Payment Voucher": "PV",
  "Journal Voucher": "JV",
  "Contra Voucher": "CV",
  "Donation Voucher": "DV",
  "Membership Fee Voucher": "MV",
  "Expense Voucher": "EV",
  "Advance Voucher": "AV",
  "Refund Voucher": "RF"
};

/**
 * Returns the current financial year string (e.g., 2025-26).
 */
export function getCurrentFinancialYear(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  if (month >= 4) {
    return `${year}-${(year + 1).toString().slice(-2)}`;
  } else {
    return `${year - 1}-${year.toString().slice(-2)}`;
  }
}
