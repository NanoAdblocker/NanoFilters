/**
 * Update all third party filters.
 */
"use strict";

/**
 * Load modules.
 * @const {Module}
 */
const fs = require("fs");
const https = require("https");
const path = require("path");
const url = require("url");
const zlib = require("zlib");

/**
 * The request agent.
 * @const {Agent}
 */
const agent = new https.Agent({
    keepAlive: true,
    maxSockets: 1,
    maxFreeSockets: 1,
});

/**
 * Fetch one filter.
 * @function
 * @param {string} input - The URL of the filter.
 * @param {WriteStream} output - A write stream to write response to.
 * @return {Promise} The promise of this task.
 */
const fetchOne = (input, output) => {
    return new Promise((resolve, reject) => {
        let options = url.parse(input);
        options.headers = {
            "Accept-Encoding": "deflate, gzip, identity",
        };
        options.agent = agent;

        let req = https.request(options, (res) => {
            if (res.statusCode !== 200)
                throw new Error("Request failed!");

            let encoding = res.headers["content-encoding"] || "identity";
            encoding = encoding.trim().toLowerCase();
            switch (encoding) {
                case "identity":
                    res.pipe(output);
                    break;

                case "gzip":
                    res.pipe(zlib.createGunzip()).pipe(output);
                    break;

                case "deflate":
                    res.pipe(zlib.createInflate()).pipe(output);
                    break;

                default:
                    throw new Error("Unknown encoding: " + encoding);
            }

            res.on("end", resolve);
            res.on("error", reject);
        });
        req.on("error", reject);
        req.end();
    });
};
/**
 * Validate one filter, check if it is obviously wrong.
 * @function
 * @param {string} input - The path to the filter to check
 * @return {Promise} The promise of this task.
 */
const validate = (input) => {
    return new Promise((resolve, reject) => {
        fs.readFile(input, "utf8", (err, data) => {
            if (err) {
                reject(err);
            } else {
                data = data.trim();
                if (data.startsWith("<") && data.endsWith(">")) {
                    console.error(input + " seems to be corrupted!");
                    reject(new Error(input + " seems to be corrupted!"));
                } else {
                    resolve();
                }
            }
        });
    });
};

process.on("unhandledRejection", (err) => {
    throw err;
});

(async () => {
    let data = {
        "../NanoMirror/uBlockResources.txt": "https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/resources.txt",
    };

    if (process.argv.includes("--all")) {
        data = Object.assign(data, {
            "MalwareDomain0.txt": "https://raw.githubusercontent.com/NanoMeow/MDLMirror/master/hosts.txt",
            "MalwareDomain1.txt": "https://mirror1.malwaredomains.com/files/justdomains",

            "PublicSuffix.dat": "https://publicsuffix.org/list/public_suffix_list.dat",
            "uBlockResources.txt": "https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/resources.txt",

            "NanoDefender.txt": "https://raw.githubusercontent.com/jspenguin2017/uBlockProtector/master/uBlockProtectorList.txt",

            "uBlockBase.txt": "https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/filters.txt",
            "uBlockBadware.txt": "https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/badware.txt",
            "uBlockPrivacy.txt": "https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/privacy.txt",
            "uBlockAbuse.txt": "https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/resource-abuse.txt",
            "uBlockUnbreak.txt": "https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/unbreak.txt",

            "WarningRemoval.txt": "https://easylist-downloads.adblockplus.org/antiadblockfilters.txt",
            "EasyList.txt": "https://easylist-downloads.adblockplus.org/easylist.txt",

            "EasyPrivacy.txt": "https://easylist-downloads.adblockplus.org/easyprivacy.txt",

            "PeterLowe.txt": "https://pgl.yoyo.org/adservers/serverlist.php?hostformat=hosts&showintro=1&mimetype=plaintext",
        });
    }

    for (let key in data) {
        console.log("Downloading " + data[key] + " to /ThirdParty/" + key + " ...");
        const localPath = path.resolve("./ThirdParty", key);
        await fetchOne(data[key], fs.createWriteStream(localPath));
        await validate(localPath);
    }

    console.log();
    console.log("Done");
})();
