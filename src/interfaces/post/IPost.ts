export interface IComment {
  _id?: string;
  author: string;
  authorId: string;
  text: string;
  createdAt: Date | string;
}

export interface IPost {
  _id: string;
  author: string;
  authorId: {
    _id: string;
    username: string;
    userImage?: string;
  } | string;
  image: string;
  text: string;
  isPublic: boolean;
  likes: string[];
  comments: IComment[];
  createdAt: Date | string;
  updatedAt: Date | string;
}
