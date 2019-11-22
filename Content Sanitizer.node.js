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

// Removes unwanted content

// ----------------------------------------------------------------------------------------------------------------- //

"use strict";

const fs = require("fs");

// ----------------------------------------------------------------------------------------------------------------- //

const reSanitizer = /\b\x6C\x61\x74\x61\x6D\b/i;

const sanitizeOne = (input) => {
    return new Promise((resolve, reject) => {
        fs.readFile(input, "utf8", (err, data) => {
            if (err) {
                reject(err);
            } else {
                const lines = data.split("\n");
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i];
                    if (reSanitizer.test(line)) {
                        lines[i] = "# Line Removed by Content Sanitizer";
                        console.log("Content Sanitizer: Removed Line '" + line + "'");
                    } else {
                        lines[i] = line.trim();
                    }
                }
                fs.writeFile(input, lines.join("\n"), "utf8", (err) => {
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

// ----------------------------------------------------------------------------------------------------------------- //

process.on("unhandledRejection", (err) => {
    throw err;
});

// ----------------------------------------------------------------------------------------------------------------- //

sanitizeOne("./ThirdParty/MalwareDomain1.txt");

// ----------------------------------------------------------------------------------------------------------------- //
