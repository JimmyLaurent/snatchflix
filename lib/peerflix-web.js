const Promise = require('bluebird');
const request = Promise.promisify(require('request'));
Promise.promisifyAll(request);
const fs = require('fs');
const _ = require('lodash');
const openVlc = require('./vlc-spawner');


class PeerflixWeb {

    constructor(baseUrl) {
        if (baseUrl.substr(-1) === '/') {
            baseUrl = baseUrl.substr(0, baseUrl.length - 1);
        }
        this.baseUrl = baseUrl;
    }

    launchStream(torrent, torrentIndex, fileTitle) {
        return this.uploadTorrent(torrent.path)
            .then((infoHash) => this.getFileLink(infoHash, torrentIndex, fileTitle))
            .then(url => openVlc(url));
    }

    getFileLink(infoHash, torrentIndex, fileTitle) {
        let i = 0
        return new Promise((resolve, reject) => {
            var interval = setInterval(() => {
                request.get(this.baseUrl + '/torrents/' + infoHash, (err, httpResponse, body) => {
                    let torrent = JSON.parse(body);
                    if (torrent.files !== undefined) {
                        clearInterval(interval);
                        if (torrentIndex === undefined) {
                            resolve(this.baseUrl + torrent.files[0].link);
                        }
                        else {
                            let selectedFile = _.find(torrent.files, file => file.name === fileTitle);
                            if (selectedFile) {
                                resolve(this.baseUrl + selectedFile.link);
                            }
                            else {
                                reject('Didn\'t find the link..');
                            }
                        }
                    }
                });
                if (i++ >= 20) {
                    clearInterval(interval);
                }
            }, 2000);
        });
    }

    uploadTorrent(torrentPath) {
        var formData = {
            file: fs.createReadStream(torrentPath),
        };
        var self = this;
        return request.postAsync({
            url: self.baseUrl + '/upload',
            headers: { 'content-type': 'application/octet-stream' },
            formData: formData
        })
            .then(response => {
                return JSON.parse(response.body).infoHash;
            });
    }
}

module.exports = PeerflixWeb;