export interface IMatchUser {
    _id: string;
    username: string;
    userImage?: string;
    gender?: string;
    language?: string;
    dogBreed?: string;
    description?: string;
    location?: {
        bottomLeft?: number[];
        topRight?: number[];
    };
    availability?: {
        dayTime?: string;
        weekDay?: string[];
    };
}