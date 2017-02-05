const Configstore = require('configstore');
const chalk = require('chalk');

const historyStore = new Configstore("snatchflix_history", {});

class History {

  writeHistory(torrent_name) {
    historyStore.set(torrent_name, torrent_name);
  }

  searchHistory(searchTitle) {
    return historyStore.get(searcTitle) === searchTitle ? true : false;
  }

  printHistory() {
    let histcount = 1;
    var allHistory = historyStore.all;

    if (historyStore.size < 1) {
      console.log(chalk.red('Your history file is empty, Go watch some torrents!'));
    }
    else {
      console.log(chalk.green('Watched History: '));
      Object.keys(allHistory).forEach(function (key) {
        console.log(chalk.red(histcount + ' ') + chalk.magenta(allHistory[key]));
        histcount++;
      });
    }
  }

  clearHistory() {
    let hist = new Configstore("snatchflix_history", {});
    hist.clear();
  }
}

module.exports = new History();



