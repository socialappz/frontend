export const formatDogAge = (age: string | number): string => {
  const ageNum = parseFloat(age as string);
  if (isNaN(ageNum)) return "Not specified";

  if (ageNum < 1) {
    const months = Math.round(ageNum * 12);
    return `${months} ${months === 1 ? "Month" : "Months"}`;
  } else {
    const years = Math.floor(ageNum);
    const months = Math.round((ageNum - years) * 12);
    if (months === 0) {
      return `${years} ${years === 1 ? "Year" : "Years"}`;
    } else {
      return `${years} ${years === 1 ? "Year" : "Years"} and ${months} ${months === 1 ? "Month" : "Months"
        }`;
    }
  }
};