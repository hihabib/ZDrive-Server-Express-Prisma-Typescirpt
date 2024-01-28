"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const routes_1 = __importDefault(require("../routes"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use(routes_1.default);
//error handler
app.use((err, req, res, next) => {
    var _a;
    console.error(err);
    res.status(500).json({
        message: (_a = err.message) !== null && _a !== void 0 ? _a : err
    });
});
exports.default = app;
