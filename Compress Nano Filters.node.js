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
