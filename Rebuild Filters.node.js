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
 * @param {string} license - The link to the license.
 * @param {string} source - The link to the source.
 * @param {string} raw - The raw data.
 * @return {string} The minimized data.
 */
const minimizePSL = (license, source, raw) => {
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
 * @param {string} license - The link to the license.
 * @param {string} source - The link to the source.
 * @param {string} raw - The raw data.
 * @return {string} The minimized data.
 */
const minimizeResource = (name, license, source, raw) => {
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
 * @param {string} title - The title of the filter.
 * @param {string} license - The link to the license.
 * @param {string} source - The link to the source map.
 * @param {integer} expires - The update interval in days.
 * @param {string} raw - The raw data.
 * @return {string} The minimized data.
 */
const minimizeFilter = (title, license, source, expires, raw) => {
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
        if (f.startsWith("# ")) {
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
 * @param {string} title - The title of the filter.
 * @param {string} license - The link to the license.
 * @param {string} source - The link to the source map.
 * @param {integer} expires - The update interval in days.
 * @param {string} raw - The raw data.
 * @param {boolean} [abp_compat=true] - Whether Adblock Plus compatible filter
 * should be generated.
 * @return {string} The minimized data.
 */
const minimizeHosts = (title, license, source, expires, raw, abp_compat = true) => {
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
            if (hostsBlacklist.has(d)) {
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

/**
 * Process a filter list.
 * @async @function
 * @param {string} name - The name of the filter to process.
 * @param {string} license - The link to the license.
 * @param {string} srcmap - The link to the source map.
 */
const processFilter = async (name, license, srcmap) => {
    let data = await fs.readFile("NanoFiltersSource/" + name, "utf8");
    data = data.split(/\r\n|\n|\r/g);

    let out = [
        "!@pragma nano-license=" + license,
        "!@pragma nano-srcmap=" + srcmap,
    ];
    for (let f of data) {
        f = f.trim();

        if (f.length === 0) {
            continue;
        }
        if (f.startsWith("!") && !f.startsWith("!#")) {
            // https://github.com/AdguardTeam/AdguardBrowserExtension/issues/917
            continue;
        }
        if (f.startsWith("# ")) {
            continue;
        }

        out.push(f);
    }
    out.push("");

    await fs.writeFile("NanoFilters/" + name, out.join("\n"), "utf8");
};
/**
 * Process a resource file.
 * @async @function
 * @param {string} name - The name of the resource to process.
 * @param {string} license - The link to the license.
 * @param {string} srcmap - The link to the source map.
 */
const processResource = async (name, license, srcmap) => {
    let data = await fs.readFile("NanoFiltersSource/" + name, "utf8");
    data = data.split(/\r\n|\n|\r/g);

    let out = [
        "# License: " + license,
        "# Source: " + srcmap,
    ];
    let lastLineEmpty = false;
    for (let l of data) {
        // Must copy the line
        let line = l.trim();

        if (line.startsWith("# ")) {
            continue;
        }

        if (line.length === 0) {
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

    await fs.writeFile("NanoFilters/" + name, out.join("\n"), "utf8");
};

(async () => {
    const NanoFiltersLicense = "https://github.com/NanoAdblocker/NanoFilters/blob/master/LICENSE";
    const NanoFiltersSrcMapPrefix = "https://raw.githubusercontent.com/NanoAdblocker/NanoFilters/master/NanoFiltersSource/";
    await Promise.all([
        processFilter("NanoBase.txt", NanoFiltersLicense, NanoFiltersSrcMapPrefix + "NanoBase.txt"),
        processFilter("NanoAnnoyance.txt", NanoFiltersLicense, NanoFiltersSrcMapPrefix + "NanoAnnoyance.txt"),
        processFilter("NanoTimer.txt", NanoFiltersLicense, NanoFiltersSrcMapPrefix + "NanoTimer.txt"),
        processFilter("NanoWhitelist.txt", NanoFiltersLicense, NanoFiltersSrcMapPrefix + "NanoWhitelist.txt"),

        processResource("NanoResources.txt", NanoFiltersLicense, NanoFiltersSrcMapPrefix + "NanoWhitelist.txt"),
    ]);

    console.log("Done");
})();
