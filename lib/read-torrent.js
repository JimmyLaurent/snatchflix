const Promise = require('bluebird');
const readTorrent = Promise.promisify(require('read-torrent'));

function filterMediaExtension(f) {
  let extensions = ['mkv', 'avi', 'mp4', 'mov', 'wmv', 'flv'];
  var extension = f.name.replace(/.*\./, '').toLowerCase();
  return extensions.indexOf(extension) !== -1;
}

class ReadTorrent {
  getVideosFileNames(torrent) {
    return readTorrent(torrent)
      .then(torrentParsed => {
        if (typeof torrentParsed.files !== undefined) {

          let videosFileNames = torrentParsed.files
            .map((f, index) => {
              f.index = index;
              return f;
            })
            .filter(filterMediaExtension)
            .filter(file => file.name.toLowerCase().indexOf("sample") === -1);

          if (videosFileNames.length > 0) {
            return videosFileNames;
          }
        }
        return false;
      });
  }
}

module.exports = new ReadTorrent();