export const formatPhone = (phone?: string) => {
  if (!phone) return "—";
  
  let digits = phone.replace(/\D/g, "");
  
  // 998 bilan boshlansa va 12 dan ko'p bo'lsa — boshidagi 998 ni olib tashla
  if (digits.startsWith("998") && digits.length > 12) {
    digits = digits.slice(3);
  }
  
  // 998 bilan boshlasa, 12 ta — standart
  if (digits.startsWith("998") && digits.length === 12) {
    digits = digits.slice(3);
  }

  // Endi 9 ta raqam qolishi kerak
  if (digits.length === 9) {
    return `+998${digits.slice(0,2)}${digits.slice(2,5)}${digits.slice(5,7)}${digits.slice(7,9)}`;
  }

  return phone; // hech biriga uymasa — xom
};