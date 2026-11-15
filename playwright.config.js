const { defineConfig } = require('@playwright/test');
module.exports=defineConfig({testDir:'./tests',use:{baseURL:process.env.APP_URL || 'http://127.0.0.1:4173/apps/photo-fit/',headless:true},workers:1});
