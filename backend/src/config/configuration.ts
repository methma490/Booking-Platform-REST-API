export default () => ({
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'booking_platform',
    synchronize: process.env.DB_SYNCHRONIZE !== 'false',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'superSecretKey',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },
});
