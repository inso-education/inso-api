import { HttpException, HttpStatus } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

export interface otaCode {
    code: string;
}

export interface decodedOtaCode{
    data: any,
    action: string,
    iat: string,
    exp: string,
    iss: string
}

export function generateCode(payload: any){
    return new Promise<otaCode>((resolve, reject) => {
        jwt.sign({
            data: payload
        },
        process.env.OTA_SECRET,
        {
            expiresIn: '1h'
        },
        (err: any, token: any) => {
            if (err){
                reject(err);
            }
            const code = token.replace(process.env.OTA_CODE_REPLACER, process.env.TOKEN_REPLACEMENT);
            resolve({ code });
        }
        );
    });

}

export function decodeOta(ota: string): Promise<decodedOtaCode>{
    const code = ota.replace(process.env.OTA_CODE_REPLACER, process.env.TOKEN_REPLACEMENT);
    return new Promise((resolve, reject) => {
        jwt.verify(
            code,
            process.env.OTA_SECRET,
            (err: any, decoded: any) => {
                console.log(err)
                if(err){
                    throw new HttpException('There is an error with the OTA token', HttpStatus.UNAUTHORIZED);
                } else {
                    resolve(decoded as decodedOtaCode);
                }
            }
        );
    });
}