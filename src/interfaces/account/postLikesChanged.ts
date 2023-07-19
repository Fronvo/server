// ******************** //
// Interfaces for the postLikesChanged event file.
// ******************** //

export interface PostLikesChangedParams {
    author: string;
    postId: string;
    likes: number;
}
