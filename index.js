require('colors');
const fs = require('fs');
const axios = require('axios');
const crypto = require('crypto');
const trumpet = require('trumpet');
const Promise = require('bluebird');
const { promisify } = require('util');
const concat = require('concat-stream');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const testurl = 'https://github.com/axios/axios';
const configFile = 'hashes.json';
const urlsFile = 'pages.json';

const saveconfig = async (fileName, current) => {
    const empty = JSON.stringify(current, null, 4);
    await writeFile(fileName, empty, 'utf-8');
}

const readConfig = async (fileName) => {
    let current = {};
    try {
        const data = await readFile(fileName, 'utf-8');
        current = JSON.parse(data);
    } catch(err) {
        saveconfig(fileName);
    }
    return current;
}

const getUrlHash = (url, selector) => {
    const secret = 'abcdefg';
    const tr = trumpet();
    console.log(`requesting: ${url.gray} [${selector.gray}]`);

    return new Promise(async (success, reject) => {
        const { data } = await axios.get(url, { responseType: 'stream' });

        const gotData = (buffer) => {
            const content = buffer.toString('utf-8');
            if (buffer.size === 0) {
                console.log('Selector falló, no hay contenido'.red);
            }
            
            const hash = crypto.createHmac('sha256', secret)
                .update(content)
                .digest('hex');

            success(hash);
        };

        const concatStream = concat(gotData);
        tr.selectAll(selector, (node) => {
            node.createReadStream().pipe(concatStream);
        });
        data.pipe(tr);
    });
}

const main = async () => {
    const hashesCache = await readConfig(configFile);
    const { pages } = await readConfig(urlsFile);

    await Promise.map(pages, async (page) => {
        const hash = await getUrlHash(page.url, page.selector);
    
        if (hashesCache[page.url] !== hash)  {
            console.log('Hay cambios', hashesCache[page.url], hash.green);
        } else {
            console.log('seguimos igual');
        }
    
        hashesCache[page.url] = hash;
    });

    await saveconfig(configFile, hashesCache);
};

main()
    .then(() => {
        console.log('success!');
    })
    .catch((err) => {
        console.log('Error', err);
    });
