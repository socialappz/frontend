import { Link } from 'react-router-dom';
import type { IUser } from '../../interfaces/user/IUser';

export default function MatchCard({ matchUser }: { matchUser: IUser }) {

   return (
    <Link 
      to={`/matche/${matchUser._id}`}
      className="block group"
    >
      <div 
        className="flex flex-col items-center p-6 sm:p-8 
                   bg-white group-hover:bg-black 
                   transition-colors duration-300"
      >
        <div className="relative w-32 h-32 sm:w-40 sm:h-40 mb-4">
          <img
            src={matchUser.userImage}
            alt={matchUser.username}
            className="w-full h-full object-cover rounded-full border-4 border-black group-hover:border-white transition-colors duration-300"
          />
        </div>
        
        <div className="text-center">
          <h3 
            className="text-xl font-semibold text-gray-900 group-hover:text-white transition-colors duration-300 mb-1"
          >
            {matchUser.username}
          </h3>
        </div>
      </div>
    </Link>
  );
}