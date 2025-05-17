import Compress from "react-image-file-resizer";

export const uploadImg = async (e: React.ChangeEvent<HTMLInputElement>): Promise<string> => {
    const files = e.target.files;
    if (!files) return '';
    const file = files[0];

    const resizedImage = await new Promise<string>((resolve, reject) => {
        try {
            Compress.imageFileResizer(
                file,
                300,
                400,
                "JPEG",
                90,
                0,
                (value: string | File | Blob | ProgressEvent<FileReader>) => {
                    resolve(value as string);
                },
                "base64"
            );
        } catch (err) {
            reject(err);
        }
    });

    return resizedImage;
};
