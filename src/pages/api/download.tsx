import type { NextApiRequest, NextApiResponse } from "next";
import * as fs from 'node:fs';
import path from "node:path";
import { FileType } from "..";

const download = async (req: NextApiRequest, res: NextApiResponse) => {
    const {
        query: { filename, filetype },
        body:  { },
        method,
    } = req; 

    try {
        switch (method) {
            case 'GET':
                if(!filename) return res.status(500).end(`Parameter: filename missing`);
                const fn: string = filename as string;
                const ft: string = filetype as FileType;

                const filePath = path.resolve('.', fn)
                const fileBuffer = fs.createReadStream(filePath)

                await new Promise((resolve) => {
                    switch (ft) {
                        case FileType.mp3:
                            res.setHeader('Content-Type', `audio/${ft}`)
                            break
                        case FileType.mp4:
                            res.setHeader('Content-Type', `video/${ft}`)
                            break
                        default:
                            return res.status(500).end(`Filetype ${ft} not supported`)
                    }
                    fileBuffer.pipe(res);
                    fileBuffer.on('end', () => {
                        fs.unlink(filePath,() => {
                            resolve(fileBuffer);
                        });
                    });
                    fileBuffer.on('error', (e) => {
                        res.status(500).json({
                            error: true,
                            message: `File not found\n${e}`
                        });
                        res.end();
                    });
                });
                break
            default:
                res.setHeader('Allow', ['GET'])
                return res.status(405).end(`Method ${method} Not Allowed`);
        }
    } catch(e) {
        res.status(500).send({error: true, message: e});
        res.end();
    }
};

export default download;
