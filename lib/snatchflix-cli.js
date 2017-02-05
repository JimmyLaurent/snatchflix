const program = require("commander");
const path = require('path');
const request = require('request');
const chalk = require('chalk');
const spawn = require('child_process').spawn;

const pkg = require("../package.json");
const Snatchflix = require("./snatchflix");
const defaultConfig = require('./default-config');
const configStore = require('./config-store');
const history = require('./history');

class SnatchFlixCli {

    start() {

        program
            .version(pkg.version)
            .option('--config', 'Edit snatchflix config EX: snatchflix --config="nano"')
            .option('-s, --search [title]', 'item to search for EX: -s title')
            .option('-o, --open [title]', 'open torrent with default app or xdg-open')
            .option('-e, --engine [name]', 'which website use for the search, EX: -e tpb')
            .option('-l, --limit [int]', 'limit the number of results, EX: -l 10')
            .parse(process.argv);

        if (program.config) {
            this.handleEditConfigCommand();
        }
        else if (program.clear) {
            history.clearHistory();
        }
        else {
            this.checkForUpdate();
            this.initialzeApp(program);
        }
    }

    handleEditConfigCommand() {
        if (program.args[0]) {
            if (configStore.size < 1) {
                console.log(chalk.red('A config file has not been created yet.'));
                console.log(chalk.red('Please run snatchflix at least once to create one.'));
            }
            else {
                spawn(program.args[0], [configStore.path], { stdio: 'inherit' });
            }
        }
        else {
            console.log('Please specify an editor');
            console.log("  Example:");
            console.log('');
            console.log('    $ snatchflix --config="nano"');
        }
    }

    checkForUpdate() {

        var url = 'https://raw.githubusercontent.com/JimmyLaurent/snatchflix/master/package.json';
        request(url, (err, response, body) => {
            if (!err && response.statusCode === 200) {
                let data = JSON.parse(body);
                if (data.version > pkg.version) {
                    console.log(chalk.red('A new version of torrentstream is available run:'));
                    console.log('');
                    console.log('$ npm install -g snatchflix');
                    console.log('');
                    console.log(chalk.red('Or go here to get it: https://github.com/JimmyLaurent/snatchflix'));
                }
            }

        });
    }

    initialzeApp(args) {
        let options = {
            open: args.open,
            search: args.search,
            engine: args.engine,
            limit: args.limit
        };
        this.snatchflix = new Snatchflix(options, this.getConfig());
        this.snatchflix.start();
    }

    getConfig() {
        if (configStore.size < 1) {
            configStore.set(defaultConfig);

            console.log(chalk.green('A new config file has been created you can find it at: '));
            console.log(chalk.green(configStore.path));

            return defaultConfig;
        }
        return configStore.all;
    }
}

module.exports = SnatchFlixCli;
