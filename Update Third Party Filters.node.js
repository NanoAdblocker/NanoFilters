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

/**
 * Fetch one filter.
 * @function
 * @param {string} input - The URL of the filter.
 * @param {WriteStream} output - A write stream to write response to.
 * @return {Promise} The promise of this task.
 */
const fetchOne = (input, output) => {
    return new Promise((resolve, reject) => {
        https.request(url.parse(input), (res) => {
            res.pipe(output);
            res.on("end", resolve);
        }).end();
    });
};
/**
 * Wait for a specific amount of time.
 * @function
 * @param {integer} [timeout=1000] - The timeout in milliseconds, defaults to 1000.
 * @return {Promise} The promise of this task.
 */
const delay = (timeout = 1000) => {
    return new Promise((resolve) => {
        setTimeout(resolve, timeout);
    });
};

(async () => {
    const data = {
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

        "MalwareDomain0.txt": "https://www.malwaredomainlist.com/hostslist/hosts.txt",
        "MalwareDomain1.txt": "https://mirror1.malwaredomains.com/files/justdomains",

        "PeterLowe.txt": "https://pgl.yoyo.org/adservers/serverlist.php?hostformat=hosts&showintro=1&mimetype=plaintext",
    };

    for (let key in data) {
        console.log("Downloading " + data[key] + " to /ThirdParty/" + key + " ...");
        await fetchOne(data[key], fs.createWriteStream(path.join("ThirdParty", key)));
        await delay();
    }

    console.log("Done");
})();
