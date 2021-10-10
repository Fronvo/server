module.exports = {
    apps: [{
        //customise to your liking
        script: 'server.js',
        watch: ['server.js'],
        watch_delay: 2000,
        instances: 'max',
        exec_mode: 'cluster',
        max_memory_restart: '1G',
        autorestart: true,
        max_restarts: 5,
        env: {"TARGET_PM2": true},
        args: "-nouse-idle-notification --max-old-space-size=8192 --max-new-space-size=2048"
    }]
}