const program = require('commander');
const fs = require('fs');
const subtitles = require('./subtitles.js');
const chalk = require('chalk');
const inquirer = require('inquirer');
const tmp = require('tmp');
const Promise = require('bluebird');
const opn = require('opn');

const TorrentSearch = require('./torrent-search');
const PeerflixSpawner = require('./peerflix-spawner');
const history = require('./history');
const readTorrent = require('./read-torrent');

class SnatchFlix {

  constructor(options, config) {
    this.options = options;
    this.useSubtitle = config.options.useSubtitle;
    this.subtitleLanguage = config.options.subtitleLanguage;
    this.confDateAdded = config.options.confDateAdded;
    this.peerflixPath = config.options.peerflixPath;
    this.historyEnabled = config.options.history;
    this.peerflixSpawner = new PeerflixSpawner(config.options);
    this.torrentSearch = new TorrentSearch(config.torrentProviders);
  }

  start() {
    if (this.options.engine === true) {
      this.printSitesAvailables();
    }
    else if (this.options.engine) {
      try {
        this.torrentSearch._getProvider(this.options.engine);
        this.onSiteSelected(this.options.engine, this.options.limit);
      }
      catch (err) {
        console.log(chalk.red(`${this.options.engine} does not exist.`));
        this.printSitesAvailables();
      }
    }
    else {
      this.prompSiteSelection();
    }
  }

  printSitesAvailables() {
    console.log(chalk.red('Please specify the name of search engine to use :'));

    let providers = this.torrentSearch.getActiveProviders();
    for (provider of providers) {
      console.log(provider.name + ' -> ' + chalk.green(provider.name));
    }
  }

  prompSiteSelection() {
    let siteMenu = this.torrentSearch.getActiveProviders().map(p => {
      return {
        key: p.name,
        name: chalk.magenta(p.name),
        value: p.name
      };
    });

    if (this.historyEnabled === true) {
      siteMenu.push({ key: 'print history', name: chalk.blue('Print history'), value: 'print history' });
    }

    siteMenu.push({ 'key': 'exit', name: chalk.red('Exit app'), value: 'exit' });

    let siteSelectionMenuQuestion = [{
      type: 'list',
      name: 'site',
      message: chalk.green('What torrent site do you want to search?'),
      choices: siteMenu
    }];

    inquirer.prompt(siteSelectionMenuQuestion, (answer) => this.onSiteSelected(answer.site));
  }

  onSiteSelected(site) {

    if (site == 'print history') {
      this.printHistory();
      this.start();
    }
    else if (site == 'exit') {
      this.exitApp();
    }
    else {
      // if -s and not empty
      if (this.options.search && this.options.search !== true) {
        this.search(this.options.search, site);
        // if -o and not empty
      }
      else if (this.options.open && options.open !== true) {
        this.search(this.options.open, site);
      }
      else {
        inquirer.prompt([
          {
            type: 'input',
            name: 'search',
            message: chalk.green('Search for a torrent: '),
          }
        ],
          (answer) => this.search(answer.search, site));
      }
    }
  }

  search(query, site, cat) {
    // general search function for all sources
    console.log(chalk.green('Searching for ') + chalk.blue(query) +
      chalk.green(' on ') + chalk.blue(
        site) + chalk.green('...'));

    this.torrentSearch.search([site], query, cat)
      .then(torrents => this.onSearchSuccess(torrents, site))
      .catch(this.onSearchFail);
  }

  onSearchSuccess(torrents, site) {
    if (torrents.length > 0) {
      this.printTorrents(torrents);
      this.promptTorrentSelection(torrents);
    }
    else {
      console.log(chalk.red('No torrent found.'));
      this.onSiteSelected(site);
    }
  }

  printTorrents(torrents) {

    for (const [index, torrent] of torrents.entries()) {

      let dateAdded, title;

      if (this.confDateAdded === true) {
        dateAdded = chalk.cyan('' + torrent.time + ' ');
      } else {
        dateAdded = '';
      }

      if (this.historyEnabled === true) {
        var found = searchHistory(torrent.title);
        if (found) {
          title = chalk.red(torrent.title);
        }
        else {
          title = chalk.yellow(torrent.title);
        }
      }
      else {
        title = chalk.yellow(torrent.title);
      }
      console.log(
        chalk.magenta(index + 1) + chalk.magenta('\) ') + title + ' ' + dateAdded + chalk.blue(torrent.size) + (' ') + chalk.green(torrent.seeds) + (' ') + chalk.red(torrent.peers)
      );
    }
  }

  onSearchFail(err) {
    console.log(chalk.red(err));
    this.start();
  }

  promptTorrentSelection(torrents) {
    let selectTorrentQuestion = [
      {
        type: 'input',
        name: 'torrent',
        message: chalk.green('Torrent to stream (eg. 1, 2, 3..) or (b)ack or (e)xit: '),
        validate: value => {
          if (value === 'b' || value === 'e' || Number.isInteger(parseInt(value)) && value <= torrents.length) {
            return true;
          }
          else {
            return `Please enter a valid torrent number (1-${torrents.length})`;
          }
        }
      }
    ];

    inquirer.prompt(selectTorrentQuestion, (answer) => this.onTorrentSelected(answer, torrents));
  }

  onTorrentSelected(answer, torrents) {
    if (!this.handleCommonCommands(answer.torrent)) {
      this.downloadTorrent(torrents[answer.torrent - 1]);
    }
  }

  downloadTorrent(torrent) {
    this.torrentSearch.downloadTorrent(torrent)
      .then(torrentBuffer => {
        console.log(`Streaming  ${chalk.green(torrent.title)}`);

        tmp.file((err, path, fd, cleanupCallback) => {
          if (err) throw err;

          var self = this;
          fs.write(fd, torrentBuffer, 0, torrentBuffer.length, 0, (err, written, buffer) => {
            fs.close(fd);
            if (!written) {
              console.log(chalk.red('Error writing temp torrent file.'));
              this.start();
            }
            else {
              if (self.options.open) {
                opn(path);
              }
              else {
                torrent.path = path;
                self.parseTorrent(torrent);
              }
            }
          });
        });
      })
      .catch(err => {
        console.log(chalk.red(err));
        this.start();
      });
  }

  parseTorrent(torrent) {
    readTorrent.getVideosFileNames(torrent.path).then(files => {
      torrent.files = files;
      if (files !== false) {
        if (files.length === 1) {
          this.launchStream(torrent, files[0].index, files[0].name);
        }
        else {
          console.log(chalk.green('Multiple torrent file detected.'));

          let torrentCount = 1;
          files.forEach(file => {
            console.log(chalk.magenta(`${torrentCount++}\) `) + chalk.yellow(file.name));
          });

          this.promptFileSelection(torrent);
        }
      }
      else if (files === false) {
        this.launchStream(torrent);
      }
    });
  }

  promptFileSelection(torrent) {
    let fileSelectionQuestion = [
      {
        type: 'input',
        name: 'torrent',
        message: chalk.green('Select file in torrent to stream (eg. 1, 2, 3..) or (b)ack or (e)xit: '),
        validate: function (value) {
          if (value === 'b' || value === 'e' || Number.isInteger(parseInt(value)) && value <= torrent.files.length) {
            return true;
          }
          else {
            return `Please enter a valid file number (1-${torrent.files.length})`;
          }
        }
      }
    ];

    inquirer.prompt(fileSelectionQuestion, (answer) => this.onFileSelected(torrent, answer));
  }

  onFileSelected(torrent, answer) {
    if (!this.handleCommonCommands(answer.torrent)) {
      let torrentFileSelected = torrent.files[answer.torrent - 1];
      console.log(`Streaming ${chalk.green(torrentFileSelected.name)}`);
      this.launchStream(torrent, torrentFileSelected.index, torrentFileSelected.name);
    }
  }

  launchStream(torrent, torrentIndex, fileTitle) {
    let torrentTitle = fileTitle || torrent.title;
    let launchStreamPromise = this.useSubtitle ? subtitles.fetchSub(this.subtitleLanguage, torrentTitle) : Promise.resolve(false);

    launchStreamPromise.then(subtitlesPath => {
      if (subtitlesPath !== false) {
        this.peerflixSpawner.launchStream(torrent.path, subtitlesPath, torrentIndex);
      }
      else {
        this.peerflixSpawner.launchStream(torrent.path, null, torrentIndex);
      }

      if (this.historyEnabled === true) {
        history.writeHistory(torrentTitle);
      }
    });
  }

  handleCommonCommands(command) {
    if (command === 'b') {
      this.start();
      return true;
    }
    else if (command === 'e') {
      this.exitApp();
      return true;
    }
    return false;
  }

  exitApp() {
    console.log(chalk.red('Exiting app...'));
    process.exit(0);
  }
}

module.exports = SnatchFlix;