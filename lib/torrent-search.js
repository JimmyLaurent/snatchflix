const TorrentSearchApi = require('torrent-search-api');
const config = require('./config-store').all;

const _ = require('lodash');
const torrentSearch = new TorrentSearchApi();

module.exports = class TorrentSearch {

    constructor(torrentProviders) {
        this.torrentSearch = new TorrentSearchApi();

        _.forEach(torrentProviders, (value, key) => {
            if (value instanceof Array && value.length > 0) {
                torrentSearch.enableProvider(key, ...value);
            }
            else {
                torrentSearch.enableProvider(key);
            }
        });

        return this.torrentSearch;
    }
}

