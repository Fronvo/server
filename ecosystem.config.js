module.exports = {
  apps: [
    {
      name: "fronvoServer",
      script: "./output/src/api.js",
      instances: -3,
      exec_mode: "cluster",
      autorestart: true,
      max_memory_restart: "4G",
    },
  ],
};
