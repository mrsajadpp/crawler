import * as https from 'https';
import * as http from 'http';
 
export const fetchHTML = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : http;

        client.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to fetch page, status code: ${response.statusCode}`));
                return;
            }

            let data = '';
            response.on('data', (chunk: Buffer) => {
                data += chunk.toString();
            });

            response.on('end', () => {
                resolve(data);
            });
        }).on('error', (err: Error) => {
            reject(err);
        });
    });
};
 