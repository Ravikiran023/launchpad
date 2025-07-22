const express = require("express");
const fs = require("fs");
const path = require("path");
const approuter = require("@sap/approuter")();
const { createProxyMiddleware } = require("http-proxy-middleware");

const CONFIG_DIR = path.resolve(__dirname, "../appconfig");

console.log("UDPATED : v32");

const componentProxyMap = {
    "com/presalescentral": "https://sapit-presales-dev-giraffe-melody-suite-dashboard-approuter.cfapps.eu10-004.hana.ondemand.com/compresalescentral",
    "com/presalescentral/activityform": "https://sapit-presales-dev-giraffe-melody-suite-activityform-approuter.cfapps.eu10-004.hana.ondemand.com",
    "com/presalescentral/successline": "https://sapit-presales-dev-giraffe-melody-suite-successline-approuter.cfapps.eu10-004.hana.ondemand.com"
};


approuter.beforeRequestHandler.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    if (req.method === "OPTIONS") {
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        return res.status(200).end();
    }

    if (req.headers.cookie) {
        const rawCookies = req.headers.cookie.split(';');
        const check = ["cmapi_cookie_privacy"];
        const validate = "cmapi_cookie_privacy";

        for (let cookie of rawCookies) {
            const [name] = cookie.trim().split('=');
            if (name.includes(validate)) {
                console.warn("Detected malformed cmapi_cookie_privacy cookie.");
            }
        }

        const filteredCookies = rawCookies.filter(cookie => {
            const name = cookie.trim().split('=')[0];
            return !check.includes(name);
        });

        req.headers.cookie = filteredCookies.join(';');
        console.log("Filtered Cookies:", req.headers.cookie);
    }


    if (req.url === "/appconfig/fioriSandboxConfig.json") {
        try {
            console.log("Redirecting to /commelodysuitelaunchpad/appconfig/fioriSandboxConfig.json");
            res.writeHead(302, {
                Location: "/commelodysuitelaunchpad/appconfig/fioriSandboxConfig.json"
            });
            return res.end();
        } catch (err) {
            console.error("Error serving config file:", err);
            res.writeHead(500, { "Content-Type": "text/plain" });
            return res.end("Internal Server Error.");
        }
    }

    const match = req?.url?.match(/^\/commelodysuitelaunchpad\/resources\/(com\/presalescentral(?:\/[^\/]+)?)(\/.*)$/);
    console.log("REQUEST URL : ", req.url)
    console.log("REQUEST PATH : ", req.path)
    if (match) {
        const namespace = match[1];
        const restPath = match[2];

        const target = componentProxyMap[namespace];
        if (target) {
            console.log("target : ", target);
            return createProxyMiddleware({
                target: target,
                changeOrigin: true,
                pathRewrite: () => restPath,
                secure: false,
                onProxyReq: (proxyReq, req) => {
                    if (req.headers.cookie) {
                        proxyReq.setHeader("cookie", req.headers.cookie);
                    }
                }
            })(req, res, next);
        }
    }

    next();
});

// Start approuter
approuter.start();
