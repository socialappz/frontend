export interface IUser {
    _id: string,
    email: string,
    username: string,
    gender: string,
    language: string,
    dogBreed: string,
    userImage: string,
    availability: {
        dayTime: string,
        weekDay: string[],
    },
    description: string,
    location: {
        bottomLeft: number[],
        topRight: number[],
    },
    favorite: [],
}