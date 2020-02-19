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
 * Get a string representation of current time.
 * @function
 * @return {string} The time string.
 */
const now = () => {
    const d = new Date();
    return d.toUTCString();
};


/**
 * The warning message about minimized filters should not be modified.
 * @const {string}
 */
const binaryWarning1 = "This file is a compiled binary, do not modify";
const binaryWarning2 = "All modifications will be overwritten on the next build";
/**
 * License strings.
 * @const {string}
 */
const licenseString = "See source for license and credits";
/**
 * New line splitter.
 * @const {RegExp}
 */
const reNewLine = /\r\n|\n|\r/;
/**
 * Minimize assets.json.
 * @function
 *
 * For all minimization functions, the following parameters may be accepted:
 * @param {string} raw - The raw data.
 * @param {string} title - The title of the filter.
 * @param {string} license - The link to the license.
 * @param {string} source - The link to the source.
 * @param {integer} [expires=?] - The update interval in days. The default
 * depends on the function.
 * @param {boolean} [cache=true] - Whether the current date should be shown.
 *
 * All minimization functions returns the minimized data.
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
 */
const minimizePSL = (raw, license, source, cache = true) => {
    raw = raw.split(reNewLine);

    let out = [];
    out.push("// Expires: 7 days");
    if (cache) {
        out.push("// Cached: " + now());
    }
    out.push("// License: " + license);
    out.push("// Srouce: " + source);
    out.push("// " + binaryWarning1);
    out.push("// " + binaryWarning2);

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
 */
const minimizeResource = (raw, license, source, expires = 3, cache = true) => {
    raw = raw.split(reNewLine);

    let out = [];
    out.push("# Expires: " + expires.toString() + " days");
    if (cache) {
        out.push("# Cached: " + now());
    }
    out.push("# License: " + license);
    out.push("# Source: " + source);
    out.push("# " + binaryWarning1);
    out.push("# " + binaryWarning2);

    let lastLineEmpty = false;
    for (let l of raw) {
        if (l.charAt(0) === '#') {
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
 */
const minimizeFilter = (raw, title, license, source, expires = 1,
    cache = true) => {

    raw = raw.split(reNewLine);

    let out = [];
    out.push("[Nano Adblocker]");
    out.push("! Title: " + title);
    out.push("! Expires: " + expires.toString() + " days");
    if (cache) {
        out.push("! Cached: " + now());
    }
    out.push("! License: " + license);
    out.push("! Source: " + source);
    out.push("! " + binaryWarning1);
    out.push("! " + binaryWarning2);

    for (let f of raw) {
        f = f.trim();

        if (f.length === 0) {
            continue;
        }

        if (f.charAt(0) === '[') {
            continue;
        }

        if (
            f.charAt(0) === '!' &&
            (
                f.length === 1 ||
                f.charAt(1) !== '#'
            )
        ) {
            // https://github.com/AdguardTeam/AdguardBrowserExtension/issues/917
            continue;
        }

        if (
            f.charAt(0) === '#' &&
            (
                f.length === 1 ||
                f.charAt(1) === ' '
            )
        ) {
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
 */
const minimizeHosts = (() => {
    const reWhitespace = /\s+/;

    const localTest1 = new Set([
        // reIsLocalhostRedirect part 1
        "0.0.0.0",
        "broadcasthost",
        "localhost",
        "local",

        // reLocalIp
        "0",
        "0.0.0.0",
        "127.0.0.1",
        "::",
        "::1",
        "fe80::1%lo0",
    ]);
    // reIsLocalhostRedirect part 2
    const localTest2 = /^ip6-\w+$/;

    return (raw, title, license, source, expires = 1, cache = true) => {

        raw = raw.split(reNewLine);

        let out = [];
        out.push("[Nano Adblocker]");
        out.push("! Title: " + title);
        out.push("! Expires: " + expires.toString() + " days");
        if (cache) {
            out.push("! Cached: " + now());
        }
        out.push("! License: " + license);
        out.push("! Source: " + source);
        out.push("! " + binaryWarning1);
        out.push("! " + binaryWarning2);

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

                out.push(d);
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
 * @param {Array.<Any>} ...args - Arguments to pass into the minimizer
 * excluding the raw data.
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
        licenseString,
        "https://github.com/NanoAdblocker/NanoFilters/tree/master/NanoFiltersSource/" + name,
        1,
        false,
    );
};
/**
 * Process one resource.
 * @async @function
 * @param {string} inDir - The input directory.
 * @param {string} outDir - The output directory.
 * @param {string} name - The file name.
 * @param {string} cache - The cache parameter for the minimization function.
 */
const processOneResource = async (inDir, outDir, name, cache) => {
    await processOne(
        "./" + inDir + "/" + name,
        "./" + outDir + "/" + name,
        minimizeResource,
        licenseString,
        "https://github.com/NanoAdblocker/NanoFilters/tree/master/" + inDir + "/" + name,
        3,
        cache,
    );
};


process.on("unhandledRejection", (err) => {
    throw err;
});

(async () => {
    await Promise.all([
        processOneNanoFilter("NanoBase.txt", "Nano Filters"),
        processOneNanoFilter("NanoAnnoyance.txt", "Nano Filters - Annoyance"),
        processOneNanoFilter("NanoWhitelist.txt", "Nano Filters - Whitelist"),

        processOneResource(
            "NanoFiltersSource", "NanoFilters",
            "NanoResources.txt", false,
        ),
    ]);

    if (process.argv.includes("--nano-only")) {
        console.log("Done");
        return;
    }

    await Promise.all([
        processOne(
            "../uBlockProtector/uBlockProtectorList.txt",
            "./NanoMirror/NanoDefender.txt",
            minimizeFilter,

            "Nano Defender Integration",
            licenseString,
            "https://github.com/jspenguin2017/uBlockProtector/tree/master/list",
            3,
            true,
        ),
    ]);

    console.log("Done");
})();
