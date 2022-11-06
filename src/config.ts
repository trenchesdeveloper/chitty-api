import dotenv from 'dotenv';
import bunyan from 'bunyan';
import cloudinary from 'cloudinary';

dotenv.config({});

class Config {
  public DATABASE_URL: string | undefined;
  public JWT_SECRET: string | undefined;
  public NODE_ENV: string | undefined;
  public CLIENT_URL: string | undefined;
  public SECRET_ONE: string | undefined;
  public REDIS_HOST: string | undefined;
	public CLOUDINARY_API_NAME: string | undefined;
public CLOUDINARY_API_KEY: string | undefined;
public CLOUDINARY_API_SECRET: string | undefined;

  constructor() {
    this.DATABASE_URL = process.env.DATABASE_URL;
    this.JWT_SECRET = process.env.JWT_SECRET;
    this.NODE_ENV = process.env.NODE_ENV;
    this.CLIENT_URL = process.env.CLIENT_URL;
    this.SECRET_ONE = process.env.SECRET_ONE;
    this.REDIS_HOST = process.env.REDIS_HOST;
		this.CLOUDINARY_API_NAME = process.env.CLOUDINARY_API_NAME;
		this.CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
		this.CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;
  }

  public createLogger(name: string): bunyan {
    return bunyan.createLogger({
        name,
        level: this.NODE_ENV === 'development' ? 'debug' : 'info',
    });
    }


  public validateConfig(): void {
    for(const key in this) {
      if(this[key] === undefined) {
        throw new Error(`Missing config value for ${key}`);
      }
    }
  }

	public cloudinaryConfig(): void {
		cloudinary.v2.config({
			cloud_name: this.CLOUDINARY_API_NAME,
			api_key: this.CLOUDINARY_API_KEY,
			api_secret: this.CLOUDINARY_API_SECRET,
		});
	}
}

export const config = new Config();
