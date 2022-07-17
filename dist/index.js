"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.getSbipSpecificVersionAndUrl = exports.getSpecificVersionAndUrl = void 0;
var core = require("@actions/core");
var exec = require("@actions/exec");
var io = require("@actions/io");
var tc = require("@actions/tool-cache");
var path = require("path");
//================================================
// Version
//================================================
/**
 * Gets the specific and minimum LLVM versions that can be used to refer to the
 * supplied specific LLVM versions (e.g., `3`, `3.5`, `3.5.2` for `3.5.2`).
 */
function getVersions(specific) {
    var versions = new Set(specific);
    for (var _i = 0, specific_1 = specific; _i < specific_1.length; _i++) {
        var version = specific_1[_i];
        versions.add(/^\d+/.exec(version)[0]);
        versions.add(/^\d+\.\d+/.exec(version)[0]);
    }
    return versions;
}
/** The specific and minimum LLVM versions supported by this action. */
var VERSIONS = getVersions([
    "3.5.0", "3.5.1", "3.5.2",
    "3.6.0", "3.6.1", "3.6.2",
    "3.7.0", "3.7.1",
    "3.8.0", "3.8.1",
    "3.9.0", "3.9.1",
    "4.0.0", "4.0.1",
    "5.0.0", "5.0.1", "5.0.2",
    "6.0.0", "6.0.1",
    "7.0.0", "7.0.1",
    "7.1.0",
    "8.0.0", "8.0.1",
    "9.0.0", "9.0.1",
    "10.0.0", "10.0.1",
    "11.0.0", "11.0.1", "11.1.0",
    "12.0.0", "12.0.1",
    "13.0.0", "13.0.1",
    "14.0.0",
]);
/** The specific and minimum LLVM-SBIP versions supported by this action.
    Version should be suffixed byv `-vN`, where `N` is a number.
 */
var SBIPVERSIONS = getVersions([
    "14.0.5-v1",
]);
/** Gets the ordering of two (specific or minimum) LLVM versions. */
function compareVersions(left, right) {
    var leftComponents = left.split(".").map(function (c) { return parseInt(c, 10); });
    var rightComponents = right.split(".").map(function (c) { return parseInt(c, 10); });
    var length = Math.max(leftComponents.length, rightComponents.length);
    for (var i = 0; i < length; ++i) {
        var leftComponent = leftComponents[i] || 0;
        var rightComponent = rightComponents[i] || 0;
        if (leftComponent > rightComponent) {
            return 1;
        }
        else if (leftComponent < rightComponent) {
            return -1;
        }
    }
    return 0;
}
/**
 * Gets the specific LLVM versions supported by this action compatible with the
 * supplied (specific or minimum) LLVM version in descending order of release
 * (e.g., `5.0.2`, `5.0.1`, and `5.0.0` for `5`).
 */
function getSpecificVersions(version) {
    return Array.from(VERSIONS)
        .filter(function (v) { return /^\d+\.\d+\.\d+$/.test(v) && v.startsWith(version); })
        .sort()
        .reverse();
}
/**
 * Gets the specific LLVM-SBIP versions supported by this action.
 * The version is filtered by exact matching.
 */
function getSbipSpecificVersions(version) {
    return Array.from(SBIPVERSIONS)
        .filter(function (v) { return v === version; });
}
//================================================
// URL
//================================================
/** Gets a LLVM download URL for GitHub. */
function getGitHubUrl(version, prefix, suffix) {
    var file = "".concat(prefix).concat(version).concat(suffix);
    return "https://github.com/llvm/llvm-project/releases/download/llvmorg-".concat(version, "/").concat(file);
}
/** Gets a SBIP-LLVM download URL for GitHub. */
function getSbipGitHubUrl(version, prefix, suffix) {
    var file = "".concat(prefix).concat(version).concat(suffix);
    return "https://github.com/sbip-sg/llvm-project/releases/download/llvm-sbip-".concat(version, "/").concat(file);
}
/** Gets a LLVM download URL for https://releases.llvm.org. */
function getReleaseUrl(version, prefix, suffix) {
    var file = "".concat(prefix).concat(version).concat(suffix);
    return "https://releases.llvm.org/".concat(version, "/").concat(file);
}
/** The LLVM versions that were never released for the Darwin platform. */
var DARWIN_MISSING = new Set([
    "3.5.1",
    "3.6.1",
    "3.6.2",
    "3.7.1",
    "3.8.1",
    "3.9.1",
    "6.0.1",
    "7.0.1",
    "7.1.0",
    "8.0.1",
    "11.0.1",
    "11.1.0",
    "12.0.1",
]);
/** Gets an LLVM download URL for the Darwin platform. */
function getDarwinUrl(version, options) {
    if (!options.forceVersion && DARWIN_MISSING.has(version)) {
        return null;
    }
    var darwin = version === "9.0.0" ? "-darwin-apple" : "-apple-darwin";
    var prefix = "clang+llvm-";
    var suffix = "-x86_64".concat(darwin, ".tar.xz");
    if (compareVersions(version, "9.0.1") >= 0) {
        return getGitHubUrl(version, prefix, suffix);
    }
    else {
        return getReleaseUrl(version, prefix, suffix);
    }
}
/**
 * The LLVM versions that should use the last RC version instead of the release
 * version for the Linux (Ubuntu) platform. This is useful when there were
 * binaries released for the Linux (Ubuntu) platform for the last RC version but
 * not for the actual release version.
 */
var UBUNTU_RC = new Map([]);
/** The (latest) Ubuntu versions for each LLVM version. */
var UBUNTU = {
    "3.5.0": "-ubuntu-14.04",
    "3.5.1": "",
    "3.5.2": "-ubuntu-14.04",
    "3.6.0": "-ubuntu-14.04",
    "3.6.1": "-ubuntu-14.04",
    "3.6.2": "-ubuntu-14.04",
    "3.7.0": "-ubuntu-14.04",
    "3.7.1": "-ubuntu-14.04",
    "3.8.0": "-ubuntu-16.04",
    "3.8.1": "-ubuntu-16.04",
    "3.9.0": "-ubuntu-16.04",
    "3.9.1": "-ubuntu-16.04",
    "4.0.0": "-ubuntu-16.04",
    "5.0.0": "-ubuntu16.04",
    "5.0.1": "-ubuntu-16.04",
    "5.0.2": "-ubuntu-16.04",
    "6.0.0": "-ubuntu-16.04",
    "6.0.1": "-ubuntu-16.04",
    "7.0.0": "-ubuntu-16.04",
    "7.0.1": "-ubuntu-18.04",
    "7.1.0": "-ubuntu-14.04",
    "8.0.0": "-ubuntu-18.04",
    "9.0.0": "-ubuntu-18.04",
    "9.0.1": "-ubuntu-16.04",
    "10.0.0": "-ubuntu-18.04",
    "10.0.1": "-ubuntu-16.04",
    "11.0.0": "-ubuntu-20.04",
    "11.0.1": "-ubuntu-16.04",
    "11.1.0": "-ubuntu-16.04",
    "12.0.0": "-ubuntu-20.04",
    "12.0.1": "-ubuntu-16.04",
    "13.0.0": "-ubuntu-20.04",
    "13.0.1": "-ubuntu-18.04",
    "14.0.0": "-ubuntu-18.04"
};
/** The latest supported LLVM version for the Linux (Ubuntu) platform. */
var MAX_UBUNTU = "14.0.0";
/** Gets an LLVM download URL for the Linux (Ubuntu) platform. */
function getLinuxUrl(version, options) {
    var rc = UBUNTU_RC.get(version);
    if (rc) {
        version = rc;
    }
    var ubuntu;
    if (options.ubuntuVersion) {
        ubuntu = "-ubuntu-".concat(options.ubuntuVersion);
    }
    else if (options.forceVersion) {
        ubuntu = UBUNTU[MAX_UBUNTU];
    }
    else {
        ubuntu = UBUNTU[version];
    }
    if (!ubuntu) {
        return null;
    }
    var prefix = "clang+llvm-";
    var suffix = "-x86_64-linux-gnu".concat(ubuntu, ".tar.xz");
    if (compareVersions(version, "9.0.1") >= 0) {
        return getGitHubUrl(version, prefix, suffix);
    }
    else {
        return getReleaseUrl(version, prefix, suffix);
    }
}
/** Gets an LLVM-SBIP download URL for the Linux (Ubuntu) platform. */
function getSbipLinuxUrl(version, options) {
    var rc = UBUNTU_RC.get(version);
    if (rc) {
        version = rc;
    }
    var ubuntu = UBUNTU[version];
    if (!ubuntu) {
        return null;
    }
    var prefix = "llvm-sbip";
    var suffix = "-x86_64-linux-gnu".concat(ubuntu, ".tar.xz");
    return getSbipGitHubUrl(version, prefix, suffix);
}
/** The LLVM versions that were never released for the Windows platform. */
var WIN32_MISSING = new Set([
    "10.0.1",
]);
/** Gets an LLVM download URL for the Windows platform. */
function getWin32Url(version, options) {
    if (!options.forceVersion && WIN32_MISSING.has(version)) {
        return null;
    }
    var prefix = "LLVM-";
    var suffix = compareVersions(version, "3.7.0") >= 0 ? "-win64.exe" : "-win32.exe";
    if (compareVersions(version, "9.0.1") >= 0) {
        return getGitHubUrl(version, prefix, suffix);
    }
    else {
        return getReleaseUrl(version, prefix, suffix);
    }
}
/** Gets an LLVM download URL. */
function getUrl(platform, version, options) {
    switch (platform) {
        case "darwin":
            return getDarwinUrl(version, options);
        case "linux":
            // return getLinuxUrl(version, options);
            return getSbipLinuxUrl(version, options);
        case "win32":
            return getWin32Url(version, options);
        default:
            return null;
    }
}
/** Gets the most recent specific LLVM version for which there is a valid download URL. */
function getSpecificVersionAndUrl(platform, options) {
    if (options.forceVersion) {
        return [options.version, getUrl(platform, options.version, options)];
    }
    if (!VERSIONS.has(options.version)) {
        throw new Error("Unsupported target! (platform='".concat(platform, "', version='").concat(options.version, "')"));
    }
    for (var _i = 0, _a = getSpecificVersions(options.version); _i < _a.length; _i++) {
        var specificVersion = _a[_i];
        var url = getUrl(platform, specificVersion, options);
        if (url) {
            return [specificVersion, url];
        }
    }
    throw new Error("Unsupported target! (platform='".concat(platform, "', version='").concat(options.version, "')"));
}
exports.getSpecificVersionAndUrl = getSpecificVersionAndUrl;
/** Gets the most recent specific LLVM-SBIP version for which there is a valid download URL. */
function getSbipSpecificVersionAndUrl(platform, options) {
    if (options.forceVersion) {
        return [options.version, getUrl(platform, options.version, options)];
    }
    if (!SBIPVERSIONS.has(options.version)) {
        throw new Error("Unsupported target! (platform='".concat(platform, "', version='").concat(options.version, "')"));
    }
    for (var _i = 0, _a = getSbipSpecificVersions(options.version); _i < _a.length; _i++) {
        var specificVersion = _a[_i];
        var url = getUrl(platform, specificVersion, options);
        if (url) {
            return [specificVersion, url];
        }
    }
    throw new Error("Unsupported target! (platform='".concat(platform, "', version='").concat(options.version, "')"));
}
exports.getSbipSpecificVersionAndUrl = getSbipSpecificVersionAndUrl;
//================================================
// Action
//================================================
var DEFAULT_NIX_DIRECTORY = "./llvm";
var DEFAULT_WIN32_DIRECTORY = "C:/Program Files/LLVM";
function install(options) {
    return __awaiter(this, void 0, void 0, function () {
        var platform, _a, specificVersion, url, archive, exit;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    platform = process.platform;
                    _a = getSbipSpecificVersionAndUrl(platform, options), specificVersion = _a[0], url = _a[1];
                    core.setOutput("version", specificVersion);
                    console.log("Installing LLVM and Clang ".concat(options.version, " (").concat(specificVersion, ")..."));
                    console.log("Downloading and extracting '".concat(url, "'..."));
                    return [4 /*yield*/, tc.downloadTool(url)];
                case 1:
                    archive = _b.sent();
                    if (!(platform === "win32")) return [3 /*break*/, 3];
                    return [4 /*yield*/, exec.exec("7z", ["x", archive, "-o".concat(options.directory), "-y"])];
                case 2:
                    exit = _b.sent();
                    return [3 /*break*/, 6];
                case 3: return [4 /*yield*/, io.mkdirP(options.directory)];
                case 4:
                    _b.sent();
                    return [4 /*yield*/, exec.exec("tar", ["xf", archive, "-C", options.directory, "--strip-components=1"])];
                case 5:
                    exit = _b.sent();
                    _b.label = 6;
                case 6:
                    if (exit !== 0) {
                        throw new Error("Could not extract LLVM and Clang binaries.");
                    }
                    core.info("Installed LLVM and Clang ".concat(options.version, " (").concat(specificVersion, ")!"));
                    core.info("Install location: ".concat(options.directory));
                    return [2 /*return*/];
            }
        });
    });
}
function run(options) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function () {
        var bin, lib, ld, dyld;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!options.directory) {
                        options.directory = process.platform === "win32"
                            ? DEFAULT_WIN32_DIRECTORY
                            : DEFAULT_NIX_DIRECTORY;
                    }
                    options.directory = path.resolve(options.directory);
                    if (!options.cached) return [3 /*break*/, 1];
                    console.log("Using cached LLVM and Clang ".concat(options.version, "..."));
                    return [3 /*break*/, 3];
                case 1: return [4 /*yield*/, install(options)];
                case 2:
                    _c.sent();
                    _c.label = 3;
                case 3:
                    bin = path.join(options.directory, "bin");
                    lib = path.join(options.directory, "lib");
                    core.addPath(bin);
                    ld = (_a = process.env.LD_LIBRARY_PATH) !== null && _a !== void 0 ? _a : "";
                    dyld = (_b = process.env.DYLD_LIBRARY_PATH) !== null && _b !== void 0 ? _b : "";
                    core.exportVariable("LLVM_PATH", options.directory);
                    core.exportVariable("LD_LIBRARY_PATH", "".concat(lib).concat(path.delimiter).concat(ld));
                    core.exportVariable("DYLD_LIBRARY_PATH", "".concat(lib).concat(path.delimiter).concat(dyld));
                    return [2 /*return*/];
            }
        });
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var version, forceVersion, ubuntuVersion, directory, cached, options, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    version = core.getInput("version");
                    forceVersion = (core.getInput("force-version") || "").toLowerCase() === "true";
                    ubuntuVersion = core.getInput("ubuntu-version");
                    directory = core.getInput("directory");
                    cached = (core.getInput("cached") || "").toLowerCase() === "true";
                    options = { version: version, forceVersion: forceVersion, ubuntuVersion: ubuntuVersion, directory: directory, cached: cached };
                    return [4 /*yield*/, run(options)];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    console.error(error_1.stack);
                    core.setFailed(error_1.message);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
if (!module.parent) {
    main();
}
