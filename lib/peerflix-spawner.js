const spawn = require('spawn-cmd').spawn;
const history = require('./history');

class PeerflixSpawner {

    constructor(options) {
        this.peerflixPlayer = options.peerflixPlayer;
        this.peerflixPlayerArg = options.peerflixPlayerArg;
        this.peerflixPort = options.peerflixPort;
        this.peerflixCommand = options.peerflixCommand;
        this.peerflixPath = options.peerflixPath;
    }

    launchStream(torrent, subtitlesPath, index) {
        var args = [torrent];

        if (this.peerflixPlayer === '--airplay') {
            args = [...args, this.peerflixPlayer];
        }
        else {
            args = [...args, this.peerflixPlayer, this.peerflixPlayerArg, this.peerflixPort];
        }

        if (!!subtitlesPath) {
            args = [...args, `--subtitles=${subtitlesPath}`];
        }

        if (!!index) {
            args = [...args, `--i=${index}`];
        }

        if (this.peerflixPath && this.peerflixPath.length > 0) {
            args = [...args, '--path=' + this.peerflixPath];
        }

        spawn(this.peerflixCommand, args, { stdio: 'inherit' });
    }
}

module.exports = PeerflixSpawner;