// ----------------------------------------------------------------------------------------------------------------- //

// Nano Filters - Script snippets and filters for Nano Adblocker
// Copyright (C) 2018-2019  Nano Core 2 contributors
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

// ----------------------------------------------------------------------------------------------------------------- //

// Download third party filters update

// ----------------------------------------------------------------------------------------------------------------- //

"use strict";

const fs = require("fs");
const https = require("https");
const path = require("path");
const url = require("url");
const zlib = require("zlib");

// ----------------------------------------------------------------------------------------------------------------- //

const agent = new https.Agent({
    keepAlive: true,
    maxSockets: 1,
    maxFreeSockets: 1,
});

// input  - Url
// output - Write stream
//
// Returns the promise for this task
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

// input - Path to filter file
// from  - What to replace
// to    - What to replace with
//
// Returns the promise for this task
const patchInclude = (input, from, to) => {
    return new Promise((resolve, reject) => {
        fs.readFile(input, "utf8", (err, data) => {
            if (err) {
                reject(err);
            } else {
                data = data.replace(from, to);
                fs.writeFile(input, data, "utf8", (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            }
        });
    });
};

// input - Path to filter file
//
// Returns the promise for this task
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

// input - Path to filter file
//
// Returns the promise for this task
const validateInclude = (input) => {
    return new Promise((_, reject) => {
        fs.readFile(input, "utf8", (err, data) => {
            if (err) {
                reject(err);
            } else {
                const lines = data.split("\n");
                const tasks = [];
                for (let line of lines) {
                    line = line.trim();

                    if (line.length === 0)
                        continue;

                    if (line.startsWith("!#include")) {
                        const parts = line.split(" ");

                        if (parts.length !== 2) {
                            reject(new Error("Invalid Include Statement: '" + line + "'"));
                            return;
                        }

                        if (parts[1].includes("/")) {
                            reject(new Error("Include Statement Contains Unexpected Character: '" + line + "'"));
                            return;
                        }

                        const subfilter = path.resolve(path.dirname(input), parts[1]);
                        tasks.push(new Promise((resolve, reject) => {
                            fs.exists(subfilter, (exists) => {
                                if (exists) {
                                    resolve();
                                } else {
                                    reject(new Error("Subfilter Missing: '" + subfilter + "'"));
                                }
                            });
                        }));
                    }
                }
                return Promise.all(tasks);
            }
        });
    });
};

// ----------------------------------------------------------------------------------------------------------------- //

process.on("unhandledRejection", (err) => {
    throw err;
});

// ----------------------------------------------------------------------------------------------------------------- //

(async () => {
    const data = {
        "../NanoMirror/uBlockResources.txt": "https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/resources.txt",
    };

    if (process.argv.includes("--all")) {
        Object.assign(data, {

            // ----------------------------------------------------------------------------------------------------- //

            // Download these first because the server sometimes error out and I have yet to implement retry

            "WarningRemoval.txt": "https://easylist-downloads.adblockplus.org/antiadblockfilters.txt",
            "EasyList.txt": "https://easylist-downloads.adblockplus.org/easylist.txt",

            "EasyPrivacy.txt": "https://easylist-downloads.adblockplus.org/easyprivacy.txt",

            // ----------------------------------------------------------------------------------------------------- //

            "MalwareDomain0.txt": "https://raw.githubusercontent.com/NanoMeow/MDLMirror/master/hosts.txt",
            "MalwareDomain1.txt": "https://mirror1.malwaredomains.com/files/justdomains",

            "PublicSuffix.dat": "https://publicsuffix.org/list/public_suffix_list.dat",
            "uBlockResources.txt": "https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/resources.txt",

            "NanoDefender.txt": "https://raw.githubusercontent.com/jspenguin2017/uBlockProtector/master/uBlockProtectorList.txt",

            "uBlockBase.txt": "https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/filters.txt",
            "uBlockBase2020.txt": "https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/filters-2020.txt",
            "uBlockBadware.txt": "https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/badware.txt",
            "uBlockPrivacy.txt": "https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/privacy.txt",
            "uBlockAbuse.txt": "https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/resource-abuse.txt",
            "uBlockUnbreak.txt": "https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/unbreak.txt",

            "PeterLowe.txt": "https://pgl.yoyo.org/adservers/serverlist.php?hostformat=hosts&showintro=1&mimetype=plaintext",

            // ----------------------------------------------------------------------------------------------------- //

        });
    }

    for (const key in data) {
        console.log("Downloading " + data[key] + " to /ThirdParty/" + key + " ...");
        const localPath = path.resolve("./ThirdParty", key);
        await fetchOne(data[key], fs.createWriteStream(localPath));
        await validate(localPath);
    }

    for (const key in data) {
        if (key === "uBlockBase.txt") {
            await patchInclude(
                path.resolve("./ThirdParty", key),
                "!#include filters-2020.txt",
                "!#include uBlockBase2020.txt",
            );
        }
        await validateInclude(data);
    }

    console.log();
    console.log("Done");
})();

// ----------------------------------------------------------------------------------------------------------------- //
