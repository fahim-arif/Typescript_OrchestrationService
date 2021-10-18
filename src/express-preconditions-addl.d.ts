/* eslint-disable no-unused-vars */
// This file was required to bridge between express-precondtions
// and missing d.ts - See https://www.typescriptlang.org/docs/handbook/declaration-files/templates/module-d-ts.html
// DOTO : maybe create @types for this
import {Request, Response} from 'express';

declare module 'express-preconditions-addl' {


    type Options = {
        error?: (status: number, message: string, req: Request, res: Response) => void;
        requiredWith?: string[];
        statusAsync? : (req: Request)=> Promise<unknown>;
    }

    export default function preconditions(options?: Options):(req: Request, res: Response, next: (err?: unknown) => void) => void;
}
