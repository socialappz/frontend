export interface IMatchUser {
    _id: string;
    username: string;
    userImage?: string;
    gender?: string;
    language?: string;
    dogBreed?: string;
    description?: string;
    availability?: {
        dayTime?: string;
        weekDay?: string[];
    };
}