const path = require('path');
const proc = require('child_process');
let onTop = true;
let VLC_ARGS = '-q' + (onTop ? ' --video-on-top' : '') + ' --play-and-exit';

module.exports = function openVlc(videoUrl) {
    let registry, key;
    if (process.platform === 'win32') {
        player = 'vlc';
        registry = require('windows-no-runnable').registry;
        if (process.arch === 'x64') {
            try {
                key = registry('HKLM/Software/Wow6432Node/VideoLAN/VLC')
                if (!key['InstallDir']) {
                    throw new Error('no install dir');
                }
            }
            catch (e) {
                try {
                    key = registry('HKLM/Software/VideoLAN/VLC');
                } catch (err) { }
            }
        }
        else {
            try {
                key = registry('HKLM/Software/VideoLAN/VLC');
            } catch (err) {
                try {
                    key = registry('HKLM/Software/Wow6432Node/VideoLAN/VLC');
                } catch (e) { }
            }
        }

        if (key) {
            var vlcPath = key['InstallDir'].value + path.sep + 'vlc';
            VLC_ARGS = VLC_ARGS.split(' ');
            VLC_ARGS.unshift(videoUrl);
            proc.execFile(vlcPath, VLC_ARGS);
        }
    }
    else {
        player = 'vlc'
        var root = '/Applications/VLC.app/Contents/MacOS/VLC';
        var home = (process.env.HOME || '') + root;
        var vlc = proc.exec('vlc ' + VLC_ARGS + ' "' + videoUrl + '" || ' + root + ' ' + VLC_ARGS + ' "' + videoUrl + '" || ' + home + ' ' + VLC_ARGS + ' "' + videoUrl + '"', (error, stdout, stderror) => {
            if (error) {
                process.exit(0);
            }
        })

        vlc.on('exit', function () {
            process.exit(0);
        });
    }
}
