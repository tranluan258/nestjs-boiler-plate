module.exports = {
  apps: [
    {
      name: 'boilerplate',
      script: 'dist/src/main.js',
      instances: 1,
      autorestart: true,
      watch: true,
      env_development: {
        NODE_ENV: 'development',
      },
    },
  ],
};
