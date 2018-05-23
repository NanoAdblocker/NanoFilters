/**
 * Compress Nano Filters.
 */
"use strict";


/**
 * The file system modules.
 * @const {Module}
 */
const fs = (() => {
    const ofs = require("fs");
    const util = require("util");

    return {
        readFile: util.promisify(ofs.readFile),
        writeFile: util.promisify(ofs.writeFile),
    };
})();


/**
 * New line splitter.
 * @const {RegExp}
 */
const reNewLine = /\r\n|\n|\r/;
/**
 * Minimize assets.json.
 * @function
 * @param {string} raw - The raw data.
 * @return {string} The minimized data.
 */
const minimizeMeta = (raw) => {
    raw = JSON.parse(raw);
    raw = JSON.stringify(raw);

    return raw;
};
/**
 * Minimize the Public Suffix List.
 * @function
 * @param {string} raw - The raw data.
 * @param {string} license - The link to the license.
 * @param {string} source - The link to the source.
 * @return {string} The minimized data.
 */
const minimizePSL = (raw, license, source) => {
    raw = raw.split(reNewLine);

    let out = [
        "// License: " + license,
        "// Srouce: " + source,
        "// Expires: 7 days",
        "// Cached: " + (new Date()).toString(),
    ];
    for (let l of raw) {
        const i = l.indexOf("//");
        if (i > -1) {
            l = l.substring(0, i);
        }

        l = l.trim();

        if (l.length === 0) {
            continue;
        }

        out.push(l);
    }
    out.push("");

    return out.join("\n");
};
/**
 * Minimize a resource file.
 * @function
 * @param {string} raw - The raw data.
 * @param {string} license - The link to the license.
 * @param {string} source - The link to the source.
 * @return {string} The minimized data.
 */
const minimizeResource = (raw, license, source) => {
    raw = raw.split(reNewLine);

    let out = [
        "# License: " + license,
        "# Source: " + source,
        "# Expires: 3 days",
        "# Cached: " + (new Date()).toString(),
    ];
    let lastLineEmpty = false;
    for (let l of raw) {
        if (l.startsWith("#")) {
            continue;
        }

        if (l.trim().length === 0) {
            if (!lastLineEmpty) {
                lastLineEmpty = true;
                out.push("");
            }
            continue;
        }

        lastLineEmpty = false;
        out.push(l);
    }
    if (!lastLineEmpty) {
        out.push("");
    }

    return out.join("\n");
};
/**
 * Minimize a filter list.
 * @function
 * @param {string} raw - The raw data.
 * @param {string} title - The title of the filter.
 * @param {string} license - The link to the license.
 * @param {string} source - The link to the source map.
 * @param {integer} expires - The update interval in days.
 * @return {string} The minimized data.
 */
const minimizeFilter = (raw, title, license, source, expires) => {
    raw = raw.split(reNewLine);

    let out = [
        "[Adblock Plus 3.0]",
        "! Title: " + title,
        "! License: " + license,
        "! Source: " + source,
        "! Expires: " + expires.toString() + " day",
        "! Cached: " + (new Date()).toString(),
    ];
    for (let f of raw) {
        f = f.trim();

        if (f.length === 0) {
            continue;
        }
        if (f.startsWith("!") && !f.startsWith("!#")) {
            // https://github.com/AdguardTeam/AdguardBrowserExtension/issues/917
            continue;
        }
        if (f.startsWith("# ") || f === "#") {
            continue;
        }

        out.push(f);
    }
    out.push("");

    return out.join("\n");
};
/**
 * Minimize a hosts file.
 * @function
 * @param {string} raw - The raw data.
 * @param {string} title - The title of the filter.
 * @param {string} license - The link to the license.
 * @param {string} source - The link to the source map.
 * @param {integer} expires - The update interval in days.
 * @param {boolean} [abp_compat=true] - Whether Adblock Plus compatible filter
 * should be generated.
 * @return {string} The minimized data.
 */
const minimizeHosts = (() => {
    const reWhitespace = /\s+/;

    const localTest1 = new Set([
        // reIsLocalhostRedirect
        "0.0.0.0",
        "broadcasthost",
        "localhost",
        "local",

        // reLocalIp
        "127.0.0.1",
        "::1",
        "fe80::1%lo0",
    ]);
    const localTest2 = /^ip6-\w+$/;

    return (raw, title, license, source, expires, abp_compat = true) => {
        raw = raw.split(reNewLine);

        let out = [
            "[Adblock Plus 3.0]",
            "! Title: " + title,
            "! License: " + license,
            "! Source: " + source,
            "! Expires: " + expires.toString() + " day",
            "! Cached: " + (new Date()).toString(),
        ];
        for (let f of raw) {
            const i = f.indexOf("#");
            if (i > -1) {
                f = f.substring(0, i);
            }

            f = f.trim();

            if (f.length === 0) {
                continue;
            }

            f = f.split(reWhitespace);
            for (let d of f) {
                d = d.trim();

                if (d.length === 0) {
                    continue;
                }
                if (localTest1.has(d) || localTest2.test(d)) {
                    continue;
                }

                if (abp_compat) {
                    out.push("||" + d + "^");
                } else {
                    out.push(d);
                }
            }
        }
        out.push("");

        return out.join("\n");
    };
})();


/**
 * Process one file.
 * @async @function
 * @param {string} inFile - The path to input file.
 * @param {string} outFile - The path to output file.
 * @param {Function} handler - The minimizer.
 * @param {any} args - Arguments to pass into the minimizer.
 */
const processOne = async (inFile, outFile, handler, ...args) => {
    const data = await fs.readFile(inFile, "utf8");
    await fs.writeFile(outFile, handler(data, ...args), "utf8");
};
/**
 * Process one Nano Filter.
 * @async @function
 * @param {string} name - The name of the filter.
 * @param {string} title - The title of the filter.
 */
const processOneNanoFilter = async (name, title) => {
    await processOne(
        "./NanoFiltersSource/" + name,
        "./NanoFilters/" + name,
        minimizeFilter,
        title,
        "GPL-3.0",
        "https://github.com/NanoAdblocker/NanoFilters/tree/master/NanoFiltersSource/" + name,
        1,
    );
};
/**
 * Process one resource.
 * @async @function
 * @param {string} inDir - The input directory.
 * @param {string} outDir - The output directory.
 * @param {string} name - The file name.
 */
const processOneResource = async (inDir, outDir, name) => {
    await processOne(
        "./" + inDir + "/" + name,
        "./" + outDir + "/" + name,
        minimizeResource,
        "GPL-3.0",
        "https://github.com/NanoAdblocker/NanoFilters/tree/master/" + inDir + "/" + name,
    );
};


process.on("unhandledRejection", (err) => {
    throw err;
});

(async () => {
    await Promise.all([
        processOneNanoFilter("NanoBase.txt", "Nano filters"),
        processOneNanoFilter("NanoAnnoyance.txt", "Nano filters - Annoyance"),
        processOneNanoFilter("NanoWhitelist.txt", "Nano filters - Whitelist"),

        processOneResource("NanoFiltersSource", "NanoFilters", "NanoResources.txt"),
    ]);

    console.log("Done");
})();

