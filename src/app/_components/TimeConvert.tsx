import { format } from "date-fns";
import { ja } from "date-fns/locale/ja";

const TimeConvert = () => {
  const timeMills = Date.now();
  const convertToJTC = new Date(timeMills + 9 * 60 * 60 * 1000);
  const convertToUTC = new Date(timeMills);
  const midnight = new Date(timeMills + 9 * 60 * 60 * 1000).setUTCHours(
    0,
    0,
    0,
    0,
  );

  const convertToJTCMidnight = new Date(midnight);

  const displayDate = (convertTo: Date) => {
    const date = format(convertTo, "yyyy/MM/dd HH:mm:ss", { locale: ja });
    return date;
  };

  return (
    <>
      <pre className="mt-4 overflow-x-auto rounded p-4">
        timeMills:{JSON.stringify(timeMills, null, 2)}
      </pre>
      <pre className="mt-4 overflow-x-auto rounded p-4">
        convertToJTC:
        {JSON.stringify(displayDate(convertToJTC), null, 2)}
      </pre>
      <pre className="mt-4 overflow-x-auto rounded p-4">
        convertToUTC:
        {JSON.stringify(displayDate(convertToUTC), null, 2)}
      </pre>
      <pre className="mt-4 overflow-x-auto rounded p-4">
        convertToJTCMidnight:
        {JSON.stringify(displayDate(convertToJTCMidnight), null, 2)}
      </pre>
      <pre className="mt-4 overflow-x-auto rounded p-4">
        convertToJTCMidnightRawDate:
        {JSON.stringify(convertToJTCMidnight, null, 2)}
      </pre>
    </>
  );
};

export default TimeConvert;
