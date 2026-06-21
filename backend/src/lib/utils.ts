import { mkdir, unlink, writeFile } from 'fs/promises';
import { dirname, extname, resolve } from 'path';

export const generateFilePath = (
  file: Express.Multer.File,
  folderPath: string,
  prefix: string,
) => {
  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  const fileExt = extname(file.originalname);
  const fileName = `${prefix}-${uniqueSuffix}${fileExt}`;

  return `${folderPath}/${fileName}`;
};

export const saveFile = async (
  file: Express.Multer.File,
  relativePath: string,
) => {
  const absolutePath = resolve(relativePath);

  await mkdir(dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, file.buffer);
};

export const deleteFile = async (relativePath: string) => {
  const absolutePath = resolve(relativePath);

  try {
    await unlink(absolutePath);
  } catch (error) {
    const err = error as NodeJS.ErrnoException;

    if (err.code === 'ENOENT') {
      console.error('File not found.');
    }

    console.error(`Error: ${error}`);
  }
};
