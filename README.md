# snatchflix

Snatchflix is a fork of torrentflix (https://github.com/ItzBlitz98/torrentflix).

A cli tool for searching torrent sites and streaming using peerflix.

It currently supports IpTorrents, TorrentLeech, Torrent9, T411, Freshon.tv, Torrentz2 and 1337x.


## Features

*  Stream or download torrents.
*  Subtitles fetched automatically (does not work properly with vlc).
*  History of streamed torrents (work in progress).


## Install (automatic)
Install peerflix if you haven't already:

```
npm install -g peerflix
```

Then install snatchflix:

```
npm install -g snatchflix
```

## Install (manual)
Install peerflix if you haven't already:

```
npm install -g peerflix
```

Clone the repository:

```
git clone https://github.com/JimmyLaurent/snatchflix.git
```

Install dependencies:

```
npm install
```

Now you can run the executable inside the bin folder.


## Screenshots

<img width="450" alt="screenshot" src="https://cloud.githubusercontent.com/assets/25406553/22629875/255ab58e-ebbd-11e6-885c-2b6ab923bd94.png">

## Usage
To run the app run:
```
$ snatchflix
```

## Cli arguments

snatchflix has some handy cli arguements you can see them using the help flag.
```
$ snatchflix --help
```

## Edit settings

```
snatchflix --config=nano
```

Default settings:

```
{
    torrentProviders: {
        torrent9: [],
        '1337x': [],
        torrentz2 : []
    },
    options: {
        peerflixPlayer: '--vlc',
        peerflixPlayerArgs: '',
        peerflixPort: '--port=8888',
        peerflixPath: '',
        peerflixCommand: 'peerflix',
        useSubtitle: false,
        subtitleLanguage: 'eng',
        history: false,
        dateAdded: false,
    }
}
``` 
Torrent provider list: iptorrents, torrentleech, torrent9, t411, freshon.tv, torrentz2 and 1337x

You can enable privates trackers by filling your authentification informations like this:
 - Freshontv with credentials: "freshontv: ['username', 'password']"
 - T411 with token "t411: ['token']"
 - IpTorrents with cookies : "IpTorrents:[['uid=XXX;', 'pass=XXXX;']]"

 To see all availables trackers and their authentifications methods, check this page => (https://github.com/JimmyLaurent/torrent-search-api)


## Subtitles
By default subtitles are disabled but you can enable them by running `snatchflix --config=nano` and setting *useSubtitle* to true. You can also change *subtitleLanguage* to one of [this list](https://github.com/divhide/node-subtitler/blob/master/langs.dump.txt), just be sure to use the three letter code.


## License

MIT © 2017 [Jimmy Laurent](https://github.com/JimmyLaurent)
