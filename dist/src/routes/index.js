"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_1 = __importDefault(require("./user"));
const tree_1 = __importDefault(require("./tree"));
const router = (0, express_1.Router)();
router.use('/api/v1/user', user_1.default);
router.use('/api/v1/tree', tree_1.default);
exports.default = router;
