import cloudinary, { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';

export const upload = async (
	file: string,
	public_id?: string,
	overwrite?: boolean,
	invalidate?: boolean
): Promise<UploadApiErrorResponse | UploadApiResponse | undefined> => {
	return new Promise((resolve) => {
		cloudinary.v2.uploader.upload(
			file,
			{
				public_id,
				overwrite,
				invalidate
			},
			(err: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
				if (err) resolve(err);
				resolve(result);
			}
		);
	});
};
