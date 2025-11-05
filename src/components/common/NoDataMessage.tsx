import { Link } from "react-router-dom";

interface NoDataMessageProps {
  message: string;
  linkText: string;
  linkTo: string;
}

export default function NoDataMessage({
  message,
  linkText,
  linkTo,
}: NoDataMessageProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="bg-black border border-white text-white px-6 py-4 rounded-lg shadow-lg">
        <p className="text-lg mb-3">{message}</p>
        <Link
          className="text-white hover:text-blue-300 transition-colors duration-200 inline-block"
          to={linkTo}
        >
          {linkText}
        </Link>
      </div>
    </div>
  );
}
